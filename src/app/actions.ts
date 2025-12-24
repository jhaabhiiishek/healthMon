'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';

export async function generateImageWithGemini(prompt: string) {
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;
  const huggingFaceToken = process.env.HUGGING_FACE_TOKEN;

  // Try Replicate first (paid, best quality)
  if (replicateApiKey) {
    try {
      console.log("Generating image with Replicate (Flux Schnell)...");
      const replicate = new Replicate({
        auth: replicateApiKey,
      });

      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 80,
          }
        }
      ) as string[];

      if (output && output[0]) {
        console.log("Image generated successfully with Replicate");
        return output[0];
      }
    } catch (error) {
      console.error("Replicate generation failed:", error);
    }
  }

  // Try Hugging Face second (free tier available)
  if (huggingFaceToken) {
    try {
      console.log("Trying Hugging Face Inference API...");
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const base64 = buffer.toString('base64');
        console.log("Image generated successfully with Hugging Face");
        return `data:image/png;base64,${base64}`;
      } else {
        const errorText = await response.text();
        console.warn("Hugging Face failed:", errorText);
      }
    } catch (error) {
      console.error("Hugging Face generation failed:", error);
    }
  }

  // Final fallback to Pollinations (always free, always works)
  console.log("Falling back to Pollinations...");
  const sanitizedPrompt = prompt.trim().replace(/\s+/g, ' ');
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}?width=1024&height=768&nologo=true&model=flux&seed=${Date.now()}`;
  return fallbackUrl;
}

export async function generateTextWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return "Error: API Key missing.";
  }

  try {
    // 1. Initialize the SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // 2. Get the specific model
    // If "gemini-2.5-flash-lite" fails, try "gemini-2.5-flash-preview-09-2025"
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json" // Force JSON response
      }
    });

    // 3. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (err) {
    console.error("Gemini SDK Error:", err);

    return "Error generating details.";
  }
}

export async function generateAudioWithElevenLabs(text: string) {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  // "21m00Tcm4TlvDq8ikWAM" is the ID for "Rachel" (American, Soft). 
  // You can find other IDs in the VoiceLab on their website.
  const voiceId = "JBFqnCBsd6RMkjVDRZzb";

  if (!apiKey) {
    console.error("ElevenLabs API Key is missing");
    return null;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text, // The plan text
        model_id: "eleven_multilingual_v2", // Low latency model
        outputFormat: 'mp3_44100_128'
      }),
    });
    console.log("ElevenLabs API Response Status:", response);


    if (!response.ok) {
      const errorData = await response.json();
      console.error("ElevenLabs API Error:", errorData);
      return null;
    }

    // Convert the binary audio data to a Base64 string
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:audio/mpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error("Audio Generation Failed:", error);
    return null;
  }
}

export async function generateDailyQuote() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "The only bad workout is the one that didn't happen."; // Fallback
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Generate a short, powerful, and unique motivational fitness quote. Do not include quotes or attribution, just the text. Keep it under 20 words.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error("Quote Generation Failed:", error);
    return "Sore today, strong tomorrow."; // Fallback
  }
}