"use client"

import { BubbleCluster, BubbleClusterIcons } from "./ui";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import Cookies from "js-cookie";
import {
  Activity,
  Loader2,
  Check,
  Download,
  Youtube,
  ImageIcon,
  CheckCircle,
  Megaphone,
  RefreshCw,
  User,
  X,
  Dumbbell,
  Utensils,
  ChevronDown
} from 'lucide-react';
import { generateImageWithGemini,generateAudioWithElevenLabs, generateTextWithGemini } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
interface FitnessPlan {
  workout_routine: Record<string, string>;
  diet_plan: Record<string, string>;
  summary: string;
}

interface WorkoutDietPlanProps {
  plan?: FitnessPlan | null;
  showFlowPreview?: boolean;
}



const optionIcons = [
  { id: 1, link: "/icons/downloadPdf.png" },
  { id: 2, link: "/icons/megaphone.png" },
  { id: 3, link: "/icons/refresh.png" },
];

const Checkbox = ({ checked, onChange }: { checked: boolean; onChange?: (checked: boolean) => void }) => (
  <div
    onClick={() => onChange && onChange(!checked)}
    className={`h-6 w-6 rounded-md border border-foreground/30 flex items-center justify-center cursor-pointer transition-all ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-foreground/5 hover:bg-foreground/10'}`}
  >
    {checked && <Check size={14} className="text-foreground" />}
  </div>
);

const DietRow = ({ setSelectedMeal, label, content, delay }: { setSelectedMeal: React.Dispatch<React.SetStateAction<{ label: string; content: string } | null>>; label: string, content: string, delay: number }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div
      onClick={() => setSelectedMeal({ label, content })}
      className="flex flex-col gap-2 rounded-2xl border border-dotted border-foreground/20 p-5 text-lg text-foreground/80 transition-all hover:border-foreground/40 hover:bg-foreground/5 animate-in fade-in slide-in-from-right-4 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between w-full">

        <span className="font-medium text-orange-200/90 text-base">{label}</span>

        <Checkbox checked={checked} onChange={setChecked} />

      </div>

      <p className={`text-sm font-light text-foreground/60 transition-all duration-500 ${checked ? 'line-through opacity-30' : ''}`}>

        {content}

      </p>

    </div>

  );

};



export default function WorkoutDietPlan({ plan, showFlowPreview = false }: WorkoutDietPlanProps & { plan?: FitnessPlan | null }) {
  const capitalize = (s:string)=>{s.charAt(0).toUpperCase()+s.slice(1);}
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioType, setCurrentAudioType] = useState<'workout' | 'diet' | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImageDish, setGeneratedImageDish] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan,setCurrentPlan] = useState(plan)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedDish,setSelectedDish] = useState<string|null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ label: string; content: string } | null>(null);
  const [selectedDay,setSelectedDay] = useState<{ day: string; routine: string } | null>(null);


  useEffect(() => {
    // Reset audio when plan changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentAudioType(null)
    setCurrentPlan(plan);
  }, [plan]);

  const downloadAsPdf = async (choice:number,dietPlan?: boolean)=>{
    if(choice==1){
      const doc = new jsPDF();
      const username = Cookies.get("loggedInUser") || "User";

      // 2. Define page dimensions & Config
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15; // Slightly more margin for a cleaner look
      const maxLineWidth = pageWidth - (margin * 2);
     
      let y = margin; // Initialize Vertical cursor position

      // --- A. MAIN TITLE ---

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 150, 100); // Emerald Green Title
      doc.text(`${username}'s ${dietPlan ? "Diet" : "Workout"} Plan`, margin, y);
      y += 15; // Add spacing after title
  
      // Draw a line under the main title
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);

      const data = dietPlan ? currentPlan?.diet_plan : currentPlan?.workout_routine;

      // --- B. CONTENT LOOP ---
      if (data && typeof data === 'object'&&!dietPlan) {
        Object.entries(data).forEach(([day, content]) => {
            const textContent = String(content);
            // 1. PARSE CONTENT: Extract "Focus" vs "Details"
            // Example: "Chest: Bench press..." -> Focus: "Chest", Details: "Bench press..."
            let focus = "";
            let details = textContent;
            const colonIndex = textContent.indexOf(':');


            if (colonIndex > -1 && colonIndex < 50) { // Limit focus length to avoid false positives
                focus = textContent.substring(0, colonIndex).trim();
                details = textContent.substring(colonIndex + 1).trim();
            }
            // --- PAGE BREAK CHECK ---
            // If we are too close to bottom, start a new page
            if (y + 40 > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }


           // 2. DAY HEADING (e.g., "MONDAY")
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0); // Black
            doc.text(day.toUpperCase(), margin, y);

            y += 7;

            // 3. SUBHEADING / FOCUS (e.g., "Chest & Triceps")

            if (focus) {
                doc.setFontSize(11);
                doc.setFont("helvetica", "bolditalic");
                doc.setTextColor(80, 80, 80); // Dark Gray
                doc.text(focus, margin, y);
                y += 6;
            }

            // 4. DETAILS / EXERCISES (Simple text wrapped)
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60); // Softer Gray for body
            // Automatically wrap text to fit width
            const splitDetails = doc.splitTextToSize(details, maxLineWidth);
           
            splitDetails.forEach((line:string) => {
                // Check page break for individual lines
                if (y + 5 > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                 doc.text(line, margin, y);
                y += 5; // Line height
            });

            // Add spacing between days
            y += 8;
        });
      }else if(data && typeof data ==='object' && dietPlan){
        Object.entries(data).forEach(([meal, content]) => {
            const textContent = String(content);
            // --- PAGE BREAK CHECK ---
            if (y + 30 > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            // 2. MEAL HEADING (e.g., "Breakfast")
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0); // Black
            doc.text(meal, margin, y);
            y += 7;
            // 3. MEAL DETAILS
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60); // Softer Gray for body
            const splitDetails = doc.splitTextToSize(textContent, maxLineWidth);
            splitDetails.forEach((line:string) => {
                // Check page break for individual lines
                if (y + 5 > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 5; // Line height
            });
            // Add spacing between meals
            y += 8;
        });
      }else {
        // Fallback if data is just a string or empty
        const textToPrint = String(data || "No plan available.");
        const lines = doc.splitTextToSize(textToPrint, maxLineWidth);
        doc.text(lines, margin, y);
      }

      // 6. Save the file
      const fileName = `${username}_${dietPlan ? "diet" : "workout"}_plan.pdf`;
      doc.save(fileName);
    }
    if(choice==2){
      const requestType = dietPlan ? "diet" : "workout";

      if (currentAudioType === requestType) {
        // Toggle ElevenLabs
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
          } else {
            audioRef.current.pause();
            setIsPlaying(false);
          }
          return;
        }
        // Toggle Native
        if (window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
          } else {
            window.speechSynthesis.pause();
            setIsPlaying(false);
          }
          return;
        }
      }


      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      window.speechSynthesis.cancel();
      setIsPlaying(false);

      // 3. START NEW REQUEST
      setCurrentAudioType(requestType); // Track the new type
      setIsPlaying(true); // Show loading/playing state


      const diet_Plan = currentPlan?.diet_plan;
      const workoutPlan = currentPlan?.workout_routine;
      const targetObj = dietPlan ? diet_Plan : workoutPlan;
      let planInText = "";
      if (targetObj && typeof targetObj === 'object'&&!dietPlan) {
        planInText += `Here is your ${dietPlan ? "Diet" : "Workout"} plan. `;
        planInText += Object.entries(targetObj)
          .map(([day, routine]) => `On ${day}: ${routine}`)
          .join(". \n ");
      }else if (targetObj && typeof targetObj === 'object'&&dietPlan) {
        planInText += `Here is your ${dietPlan ? "Diet" : "Workout"} plan. `;
        planInText += Object.entries(targetObj)
          .map(([meal,content]) => `In ${meal}: ${content}`)
          .join(". \n ");

     } else {
        planInText = String(targetObj || "No plan available.");
      }
      try{
        const audioSrc = await generateAudioWithElevenLabs(planInText);
        if(audioSrc){
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          audio.onplay=()=>setIsPlaying(true);
          audio.onended = () => setIsPlaying(false);
          audio.onpause = () => setIsPlaying(false);
          await audio.play();
        }else{
          console.warn("ElevenLabs API limit exhausted. Switching to Native TTS.");
          window.speechSynthesis.cancel(); // Stop any previous speech
          const utterance = new SpeechSynthesisUtterance(planInText);
          utterance.rate = 1.05; // Slightly slower for better clarity
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.warn("ElevenLabs API limit exhausted. Switching to Native TTS.");
          window.speechSynthesis.cancel(); // Stop any previous speech
          const utterance = new SpeechSynthesisUtterance(planInText);
          utterance.rate = 1.05; // Slightly slower for better clarity
          utterance.pitch = 1;
          window.speechSynthesis.speak(utterance);
      }
    }
   if(choice==3){

     let prompt = "";
      const formData = JSON.parse(localStorage.getItem('latestFormData') || '{}');
       console.log("parsed FOrm",formData)
      if(dietPlan){
        prompt=`Act as an expert fitness coach and nutritionist. Generate a personalized diet plan based on the following user profile:
        ${JSON.stringify(formData, null, 2)}
        Act as an expert fitness coach and nutritionist. Generate a personalized diet plan based on the following user profile:
        **CRITICAL INSTRUCTION**: You must return ONLY valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
        The JSON structure must be exactly as follows:
        {
          "breakfast": "Detailed meal options with macros...",
          "lunch": "...",
          "dinner": "...",
          "snacks": "..."
        }
        Ensure the workout matches the '${formData.fitnessLevel}' level and '${formData.workoutLocation}' location.
      Ensure the diet respects the '${formData.dietaryPreference}' preference.
        `
      }else{
        prompt=`Act as an expert fitness coach and nutritionist. Generate a personalized workout routine based on the following user profile:
      ${JSON.stringify(formData, null, 2)}

      **CRITICAL INSTRUCTION**: You must return ONLY valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`.
      The JSON structure must be exactly as follows.
       {
          "monday": "Specific detailed workout...",
          "tuesday": "...",
          "wednesday": "...",
          "thursday": "...",
          "friday": "...",
          "saturday": "...",
          "sunday": "..."
        }
     }
      Ensure the workout matches the '${formData.fitnessLevel}' level and '${formData.workoutLocation}' location.
      Ensure the diet respects the '${formData.dietaryPreference}' preference.
    `
    }
      try{
        const response = await generateTextWithGemini(prompt);
        // Clean up potential markdown code blocks
        const cleanResponse = response.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        // 3. UPDATE STATE (Triggers Re-render)
        setCurrentPlan(prev => {
          if (!prev) return null; // Safety check
          // Return a NEW object to trigger React's diffing engine
          return {
            ...prev,
            [dietPlan ? 'diet_plan' : 'workout_routine']: parsed
          };
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    }
  }
  if(!currentPlan){
    return (
      <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="rounded-[28px] border-2 border-foreground/40 bg-background/40 p-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <div className="mb-6 flex items-center justify-between text-lg text-foreground/70">
            <span className="font-semibold">Workout Plan</span>
            <BubbleClusterIcons arrayVal={optionIcons} downloadAsPdf={downloadAsPdf} />
          </div>
          <div className="h-80 rounded-2xl border border-dotted border-foreground/30 bg-background/40 animate-pulse">
          </div>
        </div>
 
        <div className="flex flex-col rounded-[28px] border-2 border-foreground/40 bg-background/40 p-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <div className="mb-6 flex items-center justify-between text-lg text-foreground/70">
            <span className="font-semibold">Diet Plan</span>
            <div className="flex gap-3">
              <BubbleClusterIcons arrayVal={optionIcons} downloadAsPdf={downloadAsPdf}/>
              {showFlowPreview && (
                <span className="relative h-5 w-5 animate-bounce">
                  <span className="absolute inset-0 -translate-y-5 -translate-x-2 rotate-45 border border-foreground/40" />
                </span>
              )}
            </div>
          </div>
 
          <div className="space-y-4">
            {["Breakfast", "Lunch", "Dinner", "Snacks"].map((label, idx) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-dotted border-foreground/30 px-6 py-4 text-lg text-foreground/80 transition-all hover:border-foreground/60 hover:bg-foreground/5 animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <span className="font-medium">{label}</span>
                <Checkbox checked={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRoutineLines = (text: string) => {
      if (!text) return [];

      // Scenario A: It's already a nice numbered list (Old format)
      if (text.includes('\n') && /^\d+\./m.test(text)) {
        return text.split('\n');
      }

      // Scenario B: It's a paragraph (New format)
      // Logic: We split by commas, but NOT commas inside parentheses (like "e.g., Planks")
      // We also separate the "Title:" part from the rest.
     
      // 1. Extract Title (everything before the first colon)
      const firstColonIndex = text.indexOf(':');
      if (firstColonIndex === -1) return [text]; // Fallback

      const title = text.slice(0, firstColonIndex + 1); // "Upper Body A (Focus):"
      const content = text.slice(firstColonIndex + 1);  // " Barbell Press (...), Rows (...)"

      // 2. Split the content by comma (ignoring commas inside parens)
      // Regex explanation: Match comma only if it's NOT followed by a closing paren without an opening one
      const exercises = content.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);
      return [title, ...exercises];
    };
  

  const getExerciseName = (line: string): string | null => {
    // Format 1: "1. Bench Press:"
    let match = line.match(/^\s*\d+\.\s*([^:]+)/);
    if (match) return match[1].trim();
    // Format 2: "Bench Press (3 sets x 10 reps)"
    // Capture text at the start until the first opening parenthesis '('
    match = line.match(/^([^(]+)\s*\(/);
    // Extra check: Ignore lines that end with ':' (These are titles, not exercises)
    if (match && !line.trim().endsWith(':')) {
      return match[1].trim();
    }
    return null;
  };
  const getMealName = (line: string): string | null => {
    // Format 1: "1. Bench Press:"
    let match = line.match(/^\s*\d+\.\s*([^:]+)/);
    if (match) return match[1].trim();
    // Format 2: "Bench Press (3 sets x 10 reps)"
    // Capture text at the start until the first opening parenthesis '('
    match = line.match(/^([^(]+)\s*\(/);
    // Extra check: Ignore lines that end with ':' (These are titles, not exercises)
    if (match && !line.trim().endsWith(':')) {
      return match[1].trim();
    }
    return null;
  };



  // 2. STATE: Track the specific exercise selected by the user


  return (

    <div className="">
        <div className="grid gap-8 h-full">
          {/* --- WORKOUT SECTION --- */}
          <div className="rounded-[28px] border-2 border-foreground/10 bg-background/40 p-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100 backdrop-blur-xl shadow-2xl flex flex-col">

            <div className="mb-6 flex items-center justify-between text-lg text-foreground/70 shrink-0">

              <span className="font-semibold tracking-tight flex items-center gap-2">

                <Dumbbell className="text-emerald-400" size={20}/> Workout Plan

              </span>

              <BubbleClusterIcons arrayVal={optionIcons} downloadAsPdf={downloadAsPdf}/>

            </div>

          

            <div className="h-120 overflow-y-auto pr-2 custom-scrollbar space-y-3">

              {Object.entries(currentPlan.workout_routine || {}).map(([day, routine], idx) => (

                <div

                  key={day}

                  onClick={()=>{setSelectedDay({day,routine})}}

                  className="group relative rounded-2xl border border-foreground/10 bg-foreground/5 p-4 hover:bg-foreground/10 transition-all duration-300 hover:border-foreground/20"

                  style={{ animationDelay: `${idx * 100}ms` }}

                >

                  <h4 className="text-emerald-400 font-medium text-sm uppercase tracking-wider mb-1">{day}</h4>

                  <p className="text-foreground/80 text-sm leading-relaxed font-light">

                    {routine}

                  </p>

                </div>

              ))}

            </div>

          </div>
          {/* --- DIET SECTION --- */}
          <div className=" flex flex-col rounded-[28px] border-2 border-foreground/10 bg-background/40 p-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-200 backdrop-blur-xl shadow-2xl">
            <div className="mb-6 flex items-center justify-between text-lg text-foreground/70 shrink-0">
              <span className="font-semibold tracking-tight flex items-center gap-2">
                <Utensils className="text-orange-400" size={20}/> Diet Plan
              </span>
              <div className="flex gap-3">
                <BubbleClusterIcons arrayVal={optionIcons} downloadAsPdf={downloadAsPdf} dietPlan={true}/>
                {showFlowPreview && (
                  <span className="relative h-5 w-5 animate-bounce text-foreground/50">
                    <ChevronDown />
                  </span>
                )}
              </div>
            </div>
          

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {["Breakfast", "Lunch", "Dinner", "Snacks"].map((label, idx) => {
                // Safe access using the interface
                const mealKey = label.toLowerCase();
                const mealContent = currentPlan.diet_plan?.[mealKey] || "No meal data available";
              
                // Render Sub-Component to allow useState
                return (
                  <DietRow
                    setSelectedMeal={setSelectedMeal}
                    key={label}
                    label={label}
                    content={mealContent}
                    delay={300 + idx * 100}
                  />
                );
              })}
            </div>
            {/* 3. THE MODAL (Abrupt Div) */}
          </div>
          
        </div>
          {selectedMeal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => {
                  setSelectedMeal(null);
                  setSelectedDish(null);
                }}
              />


             {/* Popup Content */}
              <div className="relative w-full max-w-lg flex flex-col max-h-[85vh] transform overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6">
              
                {/* Close Button */}
                <div className="p-6 border-b border-foreground/5 shrink-0 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-wide">
                      {selectedMeal.label}
                    </h3>
                    <p className="text-xs text-foreground/40 mt-1 font-mono">
                      Select a Dish below to interact
                    </p>
                  </div>
                  <button
                    onClick={() =>{
                      setSelectedMeal(null)
                      setSelectedDish(null);
                    }}
                  className="absolute right-4 top-4 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Header */}
                
                <div className="overflow-y-auto custom-scrollbar p-4 space-y-2">
                  {getRoutineLines(selectedMeal.content).map((line, idx) => {
                    // Check if this line is a valid exercise
                    const dishName = getExerciseName(line);
                    const isSelectable = !!dishName;
                    const isSelected = selectedExercise === dishName;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSelectable) setSelectedDish(dishName);
                        }}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 text-sm leading-relaxed
                          ${!isSelectable ? 'bg-transparent border-transparent text-foreground/60 italic' : 'cursor-pointer'}
                          ${isSelectable && !isSelected ? 'bg-foreground/5 border-foreground/5 hover:bg-foreground/10 text-foreground/80' : ''}
                          ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50 text-foreground shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection Indicator Icon */}
                          {isSelectable && (
                            <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-foreground/20'}`}>
                              <CheckCircle size={16} className={isSelected ? 'fill-emerald-500/20' : ''} />
                            </div>
                          )}
                    
                          {/* The Text */}

                          <span className={isSelected ? 'font-medium' : 'font-light'}>
                            {line}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full Content */}
                <div className={`
                  p-4 border-t bg-background  border-foreground/10 transition-all duration-300 ease-in-out
                  ${selectedDish ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full hidden'}
                `}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const query = `${selectedDish} recipe healthy easy`;
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/20 py-2.5 rounded-lg transition-all font-medium text-sm"
                    >
                      <Youtube size={18} /> Watch Video
                    </button>
                    <button
                      disabled={isGenerating}
                      onClick={async() => {
                        setIsGenerating(true);
                        setGeneratedImageDish(null);

                      try{

                          const prompt = `
                            Professional editorial food photography of a delicious and healthy dish: ${selectedDish}.
                            Presentation: Michelin-star quality plating, elegant arrangement, appetizing and fresh.
                            Setting: A high-end dark marble or slate table, cinematic atmosphere with soft steam rising.
                            Lighting: Dramatic studio lighting, soft window light from the side, sharp focus on the food texture.
                            Style: Macro food photography, 8k resolution, highly detailed, depth of field, photorealistic.
                          `;
                          const response = await generateImageWithGemini(prompt)
                          if(response){
                            console.log(response)
                            setGeneratedImageDish(response);
                          }else{
                            alert("Image generation failed. Please try again.");
                          }
                        }catch{
                          console.error("Error generating image");
                        }finally{
                          setIsGenerating(false);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-lg transition-all font-medium text-sm"
                      >
                    <ImageIcon size={18} /> {isGenerating ? "Generating..." : "Generate Image"}
                    </button>
                  </div>
                </div>

                {generatedImageDish && (
                  <div className="w-full rounded-xl overflow-hidden border border-foreground/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative aspect-video w-full">
                      {isGenerating?(
                        <Skeleton className="h-[80%] w-[80%] rounded-full" />
                      ):(
                        <img
                          src={generatedImageDish}
                          alt="AI Generated Workout"
                          className="w-full h-full object-cover"
                        />
                      )}
                    
                      {/* Optional: Download Button overlay */}
                      <a
                        href={generatedImageDish}
                        download={`workout-${selectedDish}.png`}
                        className="absolute bottom-3 right-3 bg-background/60 hover:bg-background/80 text-foreground px-3 py-1.5 rounded-lg text-xs backdrop-blur-md transition-colors flex items-center gap-2"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
                
                
              </div>

            </div>
          )}

          {selectedDay && (

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => {
                  setSelectedDay(null);
                  setSelectedExercise(null); // Reset selection on close
                }}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-foreground/10 bg-background p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header Section */}
                <div className="p-6 border-b border-foreground/5 shrink-0 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-wide">
                      {selectedDay.day}
                    </h3>
                    <p className="text-xs text-foreground/40 mt-1 font-mono">
                      Select an exercise below to interact
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedExercise(null);
                    }}
                    className="text-foreground/40 hover:text-foreground transition-colors"
                  >
                  <X size={20} />
                  </button>
                </div>

                {/* Scrollable List Section */}
                <div className="overflow-y-auto custom-scrollbar p-4 space-y-2">
                  {getRoutineLines(selectedDay.routine).map((line, idx) => {
                    // Check if this line is a valid exercise
                    const exerciseName = getExerciseName(line);
                    const isSelectable = !!exerciseName;
                    const isSelected = selectedExercise === exerciseName;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSelectable) setSelectedExercise(exerciseName);
                        }}
                        className={`
                          p-3 rounded-xl border transition-all duration-200 text-sm leading-relaxed
                          ${!isSelectable ? 'bg-transparent border-transparent text-foreground/60 italic' : 'cursor-pointer'}
                          ${isSelectable && !isSelected ? 'bg-foreground/5 border-foreground/5 hover:bg-foreground/10 text-foreground/80' : ''}
                          ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50 text-foreground shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection Indicator Icon */}
                          {isSelectable && (
                            <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-foreground/20'}`}>
                              <CheckCircle size={16} className={isSelected ? 'fill-emerald-500/20' : ''} />
                            </div>
                          )}
                    
                          {/* The Text */}

                          <span className={isSelected ? 'font-medium' : 'font-light'}>
                            {line}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ACTION FOOTER - Only shows when an exercise is selected */}
                <div className={`
                  p-4 border-t border-foreground/10 bg-primary transition-all duration-300 ease-in-out
                  ${selectedExercise ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full hidden'}
                `}>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const query = `${selectedExercise} exercise tutorial`;
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/20 py-2.5 rounded-lg transition-all font-medium text-sm"
                    >
                      <Youtube size={18} /> Watch Video
                    </button>
                    <button
                      disabled={isGenerating}
                      onClick={async() => {
                        setIsGenerating(true);
                        setGeneratedImage(null);

                      try{

                          const prompt = `
                          A professional, cinematic full-body photograph of a fit ${localStorage.getItem("age")} years old, ${localStorage.getItem("gender")} athlete performing the "${selectedExercise}" exercise with perfect form.                
                          Setting: A modern, high-end gym with dark industrial aesthetics and neon accents.
                          Lighting: Dramatic rim lighting highlighting muscle definition, soft volumetric fog, 8k resolution.
                          Style: Photorealistic, highly detailed, sports photography, sharp focus, depth of field.
                          `;
                          const response = await generateImageWithGemini(prompt)
                          if(response){
                            console.log(response)
                            setGeneratedImage(response);
                          }else{
                            alert("Image generation failed. Please try again.");
                          }
                        }catch{
                          console.error("Error generating image");
                        }finally{
                          setIsGenerating(false);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-lg transition-all font-medium text-sm"
                      >
                    <ImageIcon size={18} /> {isGenerating ? "Generating..." : "Generate Image"}
                    </button>

                  </div>
                </div>
                {generatedImage && (
                <div className="w-full rounded-xl overflow-hidden border border-foreground/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative aspect-video w-full">
                    {isGenerating?(
                      <Skeleton className="h-[80%] w-[80%] rounded-full" />
                    ):(
                      <img
                        src={generatedImage}
                        alt="AI Generated Workout"
                        className="w-full h-full object-cover"
                      />
                    )}
                  
                    {/* Optional: Download Button overlay */}
                    <a
                      href={generatedImage}
                      download={`workout-${selectedExercise}.png`}
                      className="absolute bottom-3 right-3 bg-background/60 hover:bg-background/80 text-foreground px-3 py-1.5 rounded-lg text-xs backdrop-blur-md transition-colors flex items-center gap-2"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

            </div>
              {/* Image Result Area */}
            
            </div>
          )}
    </div>
  );
}