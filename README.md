🧠 AI Fitness & Diet Planner

A Next.js 14 application that generates hyper-personalized workout routines and diet plans using Google Gemini AI, creates visual aids using Imagen 3, and provides audio guidance using ElevenLabs AI.

✨ Features

Personalized AI Generation: Creates detailed weekly workout splits and daily meal plans based on user metrics (age, weight, goal, equipment).

Visual Exercise & Meal Guides: Generates high-quality, photorealistic images for specific exercises or meals on demand using Google's Imagen model.

Audio Guidance (TTS): Reads out your daily plan using ElevenLabs' realistic AI voices.

Progress Tracking: Interactive calendar to log daily workouts with photo uploads (stored locally).

PDF Export: Download your full plan as a formatted PDF.

Dark/Light Mode: Fully responsive UI with theme switching.

Secure(ish) Auth: Simple local-storage based authentication for personal use.

🛠️ Tech Stack

Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS & Shadcn UI

AI Models:

Text: Google Gemini 1.5 Flash

Image: Google Imagen 3.0

Audio: ElevenLabs Multilingual v2

Utilities: jspdf (PDF generation), lucide-react (Icons), date-fns (Dates).

🚀 Getting Started

1. Clone & Install

git clone <your-repo-url>
cd my-app
npm install


2. Environment Setup

Create a file named .env.local in the root directory and add your keys:

# Get this from [https://aistudio.google.com/](https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...

# Get this from [https://elevenlabs.io/](https://elevenlabs.io/)
ELEVENLABS_API_KEY=xi_...


3. Run the App

npm run dev


Open http://localhost:3000 to view it.

📂 Project Structure

src/app/details: Main dashboard for inputting metrics and viewing the calendar.

src/components/WorkoutDietPlan.tsx: The core component that displays the plan, handles modals, and triggers AI generation.

src/app/actions.ts: Server actions for secure API calls to Google and ElevenLabs.