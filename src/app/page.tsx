"use client";

import { BubbleCluster } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ui/trigger";
import { motion } from "framer-motion";
import { generateDailyQuote } from "./actions";
import { toast } from "sonner";

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
  const [quote, setQuote] = useState("Your body is the only place you have to live.");

  useEffect(() => {
    async function loadQuote() {
      const today = new Date().toDateString();
      const storedQuote = localStorage.getItem(`dailyQuote_${today}`);

      if (storedQuote) {
        setQuote(storedQuote);
      } else {
        const newQuote = await generateDailyQuote();
        setQuote(newQuote);
        localStorage.setItem(`dailyQuote_${today}`, newQuote);
      }
    }
    loadQuote();
  }, []);

  const login = () => {
    const userCount = localStorage.getItem("userCount");
    if (!userCount) return;
    for (let i = 1; i <= parseInt(userCount); i++) {
      const userStr = localStorage.getItem(`user_${i}`);
      if (!userStr) continue;
      const user = JSON.parse(userStr);
      if (user.username === username && user.password === password) {
        Cookies.set("loggedInUser", username, { expires: 7 });
        toast.success("Login successful! Welcome back.");
        router.push("/details");
        return;
      }
    }
    toast.error("Invalid credentials. Please try again.");
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
    toast.success("Account created successfully! Please login.");
    setSignUp(false);
    setUsername("");
    setPassword("");
  };

  return (
    <main className="min-h-screen bg-background px-2 py-2 md:px-6 md:py-9 lg:px-8 lg:py-12 text-foreground flex items-center justify-center transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl"
      >
        <section className="rounded-[20px] md:rounded-[34px] border border-border bg-card/50 px-2 md:px-8 lg:px-10 py-4 md:py-9 lg:py-12 shadow-2xl backdrop-blur-sm dark:bg-[radial-gradient(circle_at_top,_#111,_#050505)]">
          <header className="mb-5 md:mb-10 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">HealthMon</h1>
            <motion.p
              key={quote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm italic hidden md:block text-slate-600 dark:text-slate-300 text-center"
            >
              "{quote}"
            </motion.p>
            <div className="flex gap-4">
              <ModeToggle />
            </div>
          </header>

          <p className="text-sm italic md:hidden text-slate-600 dark:text-slate-300 text-center mb-2.5">
            "{quote}"
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="grid gap-4 rounded-[32px] border border-border bg-secondary/20 p-8 md:grid-cols-2">
              {landingPageArray.map((component, index) => (
                <motion.div
                  key={component.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  className="rounded-2xl border border-dashed border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-accent hover:shadow-lg"
                >
                  <h2 className="mb-2 text-lg font-semibold">{component.heading}</h2>
                  <p className="text-base text-muted-foreground">{component.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="rounded-[15px] md:rounded-[32px] border border-border bg-secondary/20 p-2 md:p-8"
            >
              <div className="mb-3  md:mb-12 flex items-center justify-between text-3xl md:text-3xl text-muted-foreground">
                <span className="font-light">Secure Access</span>
              </div>

              <form className="flex flex-col gap-6 text-lg text-foreground">
                <label className="space-y-1 md:space-y-3">
                  <span className="block font-medium">Username:</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-6 py-4 transition-all hover:border-ring focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                <label className="space-y-1 md:space-y-3">
                  <span className="block font-medium">Password:</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background px-6 py-4 transition-all hover:border-ring focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    signUp ? signUpUser() : login();
                  }}
                  className="cursor-pointer rounded-xl bg-primary border border-primary px-6 py-4 text-center text-primary-foreground font-medium transition-all hover:bg-primary/90 shadow-md"
                >
                  {signUp ? "Sign Up" : "Login"}
                </motion.div>

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
            </motion.div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}