"use client";
import { useState, useEffect } from "react";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar"
import Link from "next/link";
import { ModeToggle } from "@/components/ui/trigger"; // Check path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import WorkoutDietPlan from "@/components/WorkoutDietPlan";
import Cookies from "js-cookie";
import { generateTextWithGemini } from "../actions";

interface FitnessPlan {
  workout_routine: Record<string, string>;
  diet_plan: Record<string, string>;
  summary: string;
}

interface WorkoutDietPlanProps {
  plan?: FitnessPlan | null;
  showFlowPreview?: boolean;
}

const initialFormState = {
  name: '',
  age: 30,
  gender: 'Male',
  heightCm: 175,
  weightKg: 75,
  fitnessGoal: 'Muscle Gain',
  fitnessLevel: 'Intermediate',
  workoutLocation: 'Gym',
  dietaryPreference: 'Non-Veg',
  medicalHistory: '',
  stressLevel: 'Medium',
};

const goalOptions = ['Muscle Gain', 'Weight Loss', 'Endurance Training', 'General Fitness'];
const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const locationOptions = ['Home', 'Gym', 'Outdoor', 'Hybrid'];
const dietOptions = ['Non-Veg', 'Veg', 'Vegan', 'Keto', 'Pescatarian'];
const stressOptions = ['Low', 'Medium', 'High'];
const genderOptions = ['Male', 'Female', 'Other'];

// 1. FIX: InputField uses semantic colors (bg-background, text-foreground, border-input)
const InputField = ({ label, id, type = 'text', value, onChange, min, max }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value.toString()}
      onChange={onChange}
      min={min}
      max={max}
      className="w-full rounded-xl border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring focus:outline-none transition duration-300"
    />
  </div>
);

// 2. FIX: SelectField uses semantic colors
const SelectField = ({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-ring focus:outline-none transition duration-300"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-background text-foreground">
          {option}
        </option>
      ))}
    </select>
  </div>
);

const GYM_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Sore today, strong tomorrow.",
  "Don't wish for it, work for it.",
  "Your body can stand almost anything. It’s your mind that you have to convince.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "Success starts with self-discipline.",
  "Sweat is just fat crying.",
  "Respect your body. It’s the only one you get.",
  "Focus on your goal. Don't look in any direction but ahead.",
  "Pain is temporary. Quitting lasts forever.",
  "Stronger than yesterday.",
  "You don't find willpower, you create it.",
  "Excuses don't burn calories.",
  "Discipline is doing what needs to be done, even if you don't want to.",
  "Fall in love with the process, and the results will come."
];
const getDailyQuote = () => {
  const date = new Date();
  // Create a unique seed for the day (e.g., 2023-10-27)
  const dateString = date.toDateString();
  
  // Simple hash function to get a number from the string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use absolute value of hash to pick an index
  const index = Math.abs(hash) % GYM_QUOTES.length;
  return GYM_QUOTES[index];
};

export default function DetailsPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [files, setFiles] = useState<File[] | undefined>();
  const [imageLoaded, setImageLoaded] = useState<string | null>(null);
  const [displayDetails, setDisplayDetails] = useState(true);
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [enterDayProgress, setEnterDayProgress] = useState<boolean>(true);
  const [progressModalDate, setProgressModalDate] = useState<string | null>(null)
  const [completedDays, setCompletedDays] = useState<Date[]>([]);
  const quote = getDailyQuote();

  useEffect(() => {
    // Ensure logic runs on client side
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach(key => {
        const userPrefix = Cookies.get("loggedInUser") || "guest";
        if (key.startsWith(`${userPrefix}_`)) {
          const datePart = key.split('_')[1];
          // Avoid invalid dates
          if (!datePart) return;
          const offset = new Date().getTimezoneOffset() * 60000;
          const storedDate = new Date(new Date(datePart).getTime() - offset);
          const iso = storedDate.toISOString().split('T')[0];
          
          // Prevent duplicate dates in state (optional check)
          setCompletedDays((prev) => {
             const exists = prev.some(d => d.toISOString().split('T')[0] === iso);
             return exists ? prev : [...prev, new Date(iso)];
          });
        }
      });
    }
  }, []);

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    const newValue = ['age', 'heightCm', 'weightKg'].includes(name)
      ? parseFloat(value as string)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const openProgressModal = (dateString: string) => {
    setProgressModalDate(dateString)
    const userName = Cookies.get("loggedInUser") || "guest";
    const offset = new Date().getTimezoneOffset() * 60000
    const storedDate = new Date(new Date(dateString).getTime() - offset);
    const iso = storedDate.toISOString().split('T')[0]

    const storageKey = `${userName}_${iso}`;
    const imageData = localStorage.getItem(storageKey);
    setImageLoaded(imageData);
  }

  const updateDayProgress = () => {
    if ((files?.length ?? 0) > 0) {
      setEnterDayProgress(false);
      const userName = Cookies.get("loggedInUser") || "guest";
      const storageKey = `${userName}_${date.toISOString().split('T')[0]}`;
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          localStorage.setItem(storageKey, base64data);
        }
        reader.readAsDataURL(files![0]);
        console.log("saved", storageKey)
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  const generatePlan = async () => {
    const prompt = `
      Act as an expert fitness coach and nutritionist. Generate a personalized workout routine and diet plan based on the following user profile:
      ${JSON.stringify(formData, null, 2)}

      **CRITICAL INSTRUCTION**: You must return ONLY valid JSON. Do not include markdown formatting like \`\`\`json or \`\`\`. 
      The JSON structure must be exactly as follows:

      {
        "workout_routine": {
          "monday": "Specific detailed workout...",
          "tuesday": "...",
          "wednesday": "...",
          "thursday": "...",
          "friday": "...",
          "saturday": "...",
          "sunday": "..."
        },
        "diet_plan": {
          "breakfast": "Specific meal options with macros...",
          "lunch": "...",
          "dinner": "...",
          "snacks": "..."
        },
        "summary": "A brief 2-sentence motivational summary for the user."
      }

      Ensure the workout matches the '${formData.fitnessLevel}' level and '${formData.workoutLocation}' location.
      Ensure the diet respects the '${formData.dietaryPreference}' preference.
    `;
    const response = await generateTextWithGemini(prompt);
    if (response) {
      try {
        const planData: FitnessPlan = JSON.parse(response);
        console.log("Generated Plan:", planData);
        setPlan(planData);
        setDisplayDetails(!displayDetails);
      } catch (error) {
        console.error("Failed to parse plan JSON:", error);
      }
    };
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage('Generating your personalized fitness plan...');
    localStorage.setItem('latestFormData', JSON.stringify(formData));

    setTimeout(() => {
      setIsGenerating(false);
      setMessage('Plan data logged to console. Check the browser console.');
    }, 2000);
  };

  return (
    // 3. FIX: Main background uses bg-background and text-foreground
    <main className="min-h-screen bg-background  px-2 py-2 md:px-6 md:py-9 lg:px-8 lg:py-12 text-foreground flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-7xl duration-1000">
        
        {/* 4. FIX: Main Card uses bg-card/popover. Dark mode keeps the cool gradient via 'dark:' modifier */}
        <section className="rounded-[20px] md:rounded-[34px] border border-border bg-card/50 px-2 md:px-8 lg:px-10 py-4 md:py-9 lg:py-12 shadow-2xl backdrop-blur-sm dark:bg-[radial-gradient(circle_at_top,_#111,_#050505)]">
          <header className="mb-5 md:mb-10 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">HealthMon</h1>
            <p className="text-sm italic hidden md:block text-slate-600 dark:text-slate-300 text-center ">
              {quote}
            </p>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <Avatar className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setDisplayDetails(!displayDetails)}>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
          </header>

          <p className="text-sm italic md:hidden text-slate-600 dark:text-slate-300 text-center mb-2.5">
            {quote}
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {displayDetails &&
              // 5. FIX: Inner containers use bg-secondary or bg-muted instead of bg-black/40
              <div className="rounded-[20px] md:rounded-[32px] border border-border bg-secondary/20 p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                <div className="mb-6 text-xl text-muted-foreground font-semibold">Details:</div>
                <div className="rounded-2xl border border-border/50 bg-card/40 animate-pulse-slow">
                  
                  {/* The Input Form */}
                  <form onSubmit={(e) => handleSubmit(e)} className="space-y-8 p-4">

                    {/* Section 1: Personal Metrics */}
                    <div className="p-6 bg-background/50 rounded-2xl border border-primary/10 shadow-sm">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center"> Your Metrics </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Name" id="name" value={formData.name} onChange={(e) => handleChange(e)} />
                        <InputField label="Age (Years)" id="age" type="number" value={formData.age} onChange={(e) => handleChange(e)} min="16" max="100" />
                        <SelectField label="Gender" id="gender" value={formData.gender} onChange={(e) => handleChange(e)} options={genderOptions} />
                        <InputField label="Height (cm)" id="heightCm" type="number" value={formData.heightCm} onChange={(e) => handleChange(e)} min="100" max="250" />
                        <InputField label="Weight (kg)" id="weightKg" type="number" value={formData.weightKg} onChange={(e) => handleChange(e)} min="30" max="300" />
                      </div>
                    </div>

                    {/* Section 2: Goals and Preferences */}
                    <div className="p-6 bg-background/50 rounded-2xl border border-primary/10 shadow-sm">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center"> Goals & Preferences </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SelectField label="Fitness Goal" id="fitnessGoal" value={formData.fitnessGoal} onChange={(e) => handleChange(e)} options={goalOptions} />
                        <SelectField label="Fitness Level" id="fitnessLevel" value={formData.fitnessLevel} onChange={(e) => handleChange(e)} options={levelOptions} />
                        <SelectField label="Workout Location" id="workoutLocation" value={formData.workoutLocation} onChange={(e) => handleChange(e)} options={locationOptions} />
                        <div className="md:col-span-1">
                          <SelectField label="Dietary Preferences" id="dietaryPreference" value={formData.dietaryPreference} onChange={(e) => handleChange(e)} options={dietOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Optional Details */}
                    <div className="p-6 bg-background/50 rounded-2xl border border-primary/10 shadow-sm">
                      <h2 className="text-xl font-bold text-primary mb-4 flex items-center"> Optional Details </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Current Stress Level" id="stressLevel" value={formData.stressLevel} onChange={(e) => handleChange(e)} options={stressOptions} />
                        <div className="flex flex-col space-y-2 md:col-span-2">
                          <label htmlFor="medicalHistory" className="text-sm font-medium text-muted-foreground">
                            Medical History (Optional)
                          </label>
                          <textarea
                            id="medicalHistory"
                            name="medicalHistory"
                            value={formData.medicalHistory}
                            onChange={(e) => handleChange(e)}
                            placeholder="Any injuries, allergies, or health conditions we should know about?"
                            className="w-full rounded-xl border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring focus:outline-none transition duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submission Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        onClick={() => generatePlan()}
                        disabled={isGenerating}
                        className={`w-full text-lg font-semibold py-3 rounded-xl transition-all duration-300 transform shadow-lg ${isGenerating
                            ? 'bg-muted text-muted-foreground cursor-not-allowed flex items-center justify-center'
                            : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 hover:scale-[1.01] text-primary-foreground'
                          }`}
                      >
                        {isGenerating ? (
                          <>Processing...</>
                        ) : (
                          'Generate'
                        )}
                      </button>
                      {message && (
                        <p className="mt-4 text-center text-sm font-medium text-primary">
                          {message}
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            }

            {!displayDetails &&
              <WorkoutDietPlan plan={plan} />
            }

            <div className="rounded-[32px] border border-border bg-secondary/20 p-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300 flex flex-col h-full">
              <div className="mb-6 text-xl text-muted-foreground font-semibold">Calendar:</div>
              
              {/* 6. FIX: Calendar Styling */}
              <Calendar
                mode="single"
                required={true}
                selected={date}
                onDayClick={(day) => openProgressModal(day.toDateString())}
                style={{ width: "100%" }}
                modifiers={{
                  completed: completedDays
                }}
                modifiersClassNames={{
                  completed: "bg-emerald-500 text-white hover:bg-emerald-600 rounded-md font-bold" // Keep Emerald for success state
                }}
                // Removed hardcoded bg-[#050505], replaced with bg-card
                className="rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-sm"
                buttonVariant="ghost"
              />
              
              {/* 7. FIX: Dropzone Styling */}
              <Dropzone
                accept={{ 'image/*': [] }}
                maxFiles={10}
                maxSize={1024 * 1024 * 10}
                // Removed hardcoded bg-[#050505], replaced with bg-card
                className="rounded-2xl border border-dashed border-border flex-grow bg-card text-card-foreground text-xl mt-6 hover:bg-accent/50 transition-colors"
                minSize={1024}
                onDrop={handleDrop}
                onError={console.error}
                src={files}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>

              <button
                onClick={() => updateDayProgress()}
                type="button"
                className="mt-6 w-full rounded-2xl border border-dashed border-primary/50 px-6 py-4 text-center text-lg font-semibold text-primary hover:bg-primary/10 transition-all hover:scale-105 active:scale-95"
              >
                {enterDayProgress ? "Upload today's Progress" : "Well done! Progress Uploaded."}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 8. FIX: Modal Styling */}
      {progressModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setProgressModalDate(null)}
          />
          {/* Changed bg-zinc-900 to bg-popover */}
          <div className="relative z-10 bg-popover text-popover-foreground p-6 rounded-xl border border-border shadow-2xl min-w-[300px] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-primary text-sm font-bold uppercase mb-2">Log Progress</h3>
              <button
                onClick={() => setProgressModalDate(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Close
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-4">{progressModalDate}</h2>
            {imageLoaded && (
              <img src={imageLoaded} alt="Progress" className="max-h-[70vh] max-w-full mx-auto mb-4 rounded-lg border border-border" />
            )}
            {!imageLoaded && (
              <p className="text-muted-foreground mb-4">No progress image uploaded for this day.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}