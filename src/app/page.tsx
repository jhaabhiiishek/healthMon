"use client";

import { BubbleCluster } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";
import { ModeToggle } from "@/components/ui/trigger"; // Assuming you have a toggle component

const landingPageArray = [
  {
    id: 1,
    heading: "🧠 Personalized AI Plans",
    desc: "Generates fully customized workout routines (sets, reps, rest) and detailed diet plans (meals, snacks) based on your unique fitness goals and current level."
  },
  {
    id: 2,
    heading: "🖼️ Visual Exercise Guide",
    desc: "Get instant visual references! Click any exercise or meal item to generate an AI-powered image representing the correct form or food presentation."
  },
  {
    id: 3,
    heading: "Voice Readout 🔊",
    desc: "Use the 'Read My Plan' feature to have your daily workout or diet schedule spoken out loud using advanced Text-to-Speech (TTS) technology."
  },
  {
    id: 4,
    heading: "💬 Dynamic AI Coaching",
    desc: "Receive real-time AI Tips & Motivation, including personalized lifestyle advice, posture corrections, and daily inspirational quotes to keep you on track."
  },
  {
    id: 5,
    heading: "📄 Export & Sharing",
    desc: "Easily export your complete, generated fitness and nutrition plan as a sharable PDF document for offline use or to review with a physical trainer."
  },
  {
    id: 6,
    heading: "Modern UX 🌗 & Dark Mode",
    desc: "Enjoy a smooth, responsive user interface with dynamic animations and the flexibility to switch between Dark and Light mode themes for comfortable viewing."
  }
];
export default function LoginPage() {
  const router = useRouter();
  const [signUp, setSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    const userCount = localStorage.getItem("userCount");
    if (!userCount) return;
    for (let i = 1; i <= parseInt(userCount); i++) {
      const userStr = localStorage.getItem(`user_${i}`);
      if (!userStr) continue;
      const user = JSON.parse(userStr);
      if (user.username === username && user.password === password) {
        Cookies.set("loggedInUser", username, { expires: 7 });
        router.push("/details");
        return;
      }
    }
  };

  const signUpUser = () => {
    const userCount = localStorage.getItem("userCount");
    const newCount = userCount ? parseInt(userCount) + 1 : 1;
    localStorage.setItem("userCount", newCount.toString());
    const user = {
      username: username,
      password: password
    };
    localStorage.setItem(`user_${newCount}`, JSON.stringify(user));
    setSignUp(false);
    setUsername("");
    setPassword("");
  };

  return (
    // 1. FIX: Changed bg-[#050505] to bg-background, text-white to text-foreground
    <main className="min-h-screen bg-background px-8 py-12 text-foreground flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* 2. FIX: Used bg-card/bg-popover instead of radial gradients, removed hardcoded borders */}
        <section className="rounded-[34px] border border-border bg-card/50 px-10 py-12 shadow-2xl backdrop-blur-sm dark:bg-[radial-gradient(circle_at_top,_#111,_#050505)]">
          <header className="mb-10 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Health App - We help you get fitter!</h1>
            {/* Optional: Add Theme Toggle here if you want to test it */}
            <div className="flex gap-4">
                <ModeToggle/>
            </div>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            {/* 3. FIX: Changed bg-black/40 to bg-muted/30 or bg-secondary */}
            <div className="grid gap-4 rounded-[32px] border border-border bg-secondary/20 p-8 md:grid-cols-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              {landingPageArray.map((component) => (
                <div
                  key={component.id}
                  // 4. FIX: Changed border-white/35 to border-border and bg-white/5 to bg-card
                  className="rounded-2xl border border-dashed border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent hover:shadow-lg animate-in fade-in zoom-in-95"
                  style={{ animationDelay: `${300 + component.id * 50}ms` }}
                >
                  <h2 className="mb-2 text-lg font-semibold">{component.heading}</h2>
                  <p className="text-base text-muted-foreground">{component.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-border bg-secondary/20 p-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              <div className="mb-12 flex items-center justify-between text-4xl text-muted-foreground">
                <span className="font-light">Secure Access</span>
              </div>

              <form className="flex flex-col gap-6 text-lg text-foreground">
                <label className="space-y-3">
                  <span className="block font-medium">Username:</span>
                  {/* 5. FIX: Changed input styles to use border-input and bg-background */}
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-6 py-4 transition-all hover:border-ring focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                <label className="space-y-3">
                  <span className="block font-medium">Password:</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-6 py-4 transition-all hover:border-ring focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                <div
                  onClick={() => {
                    signUp ? signUpUser() : login();
                  }}
                  // 6. FIX: Changed button styles to use bg-primary and text-primary-foreground
                  className="cursor-pointer rounded-xl bg-primary border border-primary px-6 py-4 text-center text-primary-foreground font-medium transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-md"
                >
                  {signUp ? "Sign Up" : "Login"}
                </div>
                
                <Link
                  href="/details"
                  className="rounded-xl border border-input bg-secondary px-6 py-4 text-center text-secondary-foreground transition-all hover:bg-secondary/80 hover:scale-[1.02] active:scale-95"
                >
                  Login with test credentials
                </Link>
                
                <button
                  type="button"
                  onClick={() => setSignUp(!signUp)}
                  className="rounded-2xl border border-dashed border-muted-foreground/30 px-6 py-4 text-center text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-accent"
                >
                  {signUp ? "Login Instead" : "SignUp Instead"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}