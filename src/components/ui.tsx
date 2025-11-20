"use client";
import Image from "next/image";
import jsPDF from "jspdf";
export const BubbleCluster = () => (
  <div className="flex gap-2">
    {Array.from({ length: 3 }).map((_, idx) => (
      <span
        key={idx}
        className="h-4 w-4 rounded-full border border-white/80 animate-pulse"
        style={{ animationDelay: `${idx * 0.1}s` }}
      />
    ))}
  </div>
);

export const BubbleClusterIcons = (e:{ arrayVal: { id: number; link: string }[],downloadAsPdf: (n:number, dietPlan?: boolean) => void,dietPlan?: boolean }) =>{
  return(
    <div className="flex gap-2" >
      {e.arrayVal.map((element) => (
        <Image
          src={element.link} 
          key={element.id} 
          onClick={() => e.downloadAsPdf(element.id,e.dietPlan)}
          style={{ animationDelay: `${element.id * 0.1}s` }} 
          alt="alt" 
          width={32}
          height={32}
          className="p-1 rounded-full border bg-white border-white/80 animate-pulse" />
      ))}
    </div>
  )
} ;

export const Checkbox = () => (
  <span className="h-5 w-5 rounded-sm border border-white/80 transition-all hover:border-white" />
);

export const DottedCard = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-dotted border-white/50 bg-white/5 ${className}`}>
    {children}
  </div>
);

