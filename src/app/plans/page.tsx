"use client";

import { BubbleCluster } from "@/components/ui";
import WorkoutDietPlan from "@/components/WorkoutDietPlan";

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-8 py-12 text-white">
      <div className="mx-auto w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <section className="rounded-[34px] border-2 border-dashed border-white/60 bg-[radial-gradient(circle_at_top,_#111,_#050505)] px-10 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <header className="mb-10 flex items-center justify-between">
            <h1 className="text-3xl font-bold">HealthMon</h1>
            <div className="flex items-center gap-4">
              <BubbleCluster />
            </div>
          </header>

          <WorkoutDietPlan showFlowPreview={true} />
        </section>
      </div>
    </main>
  );
}

