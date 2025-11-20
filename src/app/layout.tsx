import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import { Dumbbell } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HealthMon AI | Smart Fitness Coaching",
    template: "%s | HealthMon AI"
  },
  description: "Your personal AI-powered fitness coach. Generate workout routines, diet plans, and get real-time visual and audio guidance.",
  keywords: ["Fitness", "AI Coach", "Workout Generator", "Diet Plan", "Gym", "Health"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  icons: {
    icon: "favicon.ico", // Place favicon.ico in /public
    apple: "apple-touch-icon.png", // Place png in /public
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-app-url.com",
    title: "HealthMon AI - The Future of Fitness",
    description: "Generate hyper-personalized workouts and meal plans with Gemini & ElevenLabs.",
    siteName: "HealthMon AI",
}}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
