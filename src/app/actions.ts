'use server';
import {GoogleGenerativeAI} from '@google/generative-ai';

export async function generateImageWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

  const payload = {
    instances: [
      { prompt: prompt }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9" 
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Imagen API Error:", errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

     // 3. RESPONSE PARSING: Imagen returns 'predictions', not 'candidates'
    const base64String = data.predictions?.[0]?.bytesBase64Encoded;

    if (!base64String) {
      throw new Error('No image data returned');
    }

    // Return the standard data URL
    return `data:image/png;base64,${base64String}`;

  } catch (error) {
    console.error("Image Generation Failed:", error);
	console.log("Falling back to Pollinations...");
    const fallbackUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=768&model=flux&seed=${Math.random()}`;
    return fallbackUrl; // This returns a URL, not base64, but <img src> handles both.
  }
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