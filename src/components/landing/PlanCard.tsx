import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export interface PlanCardProps {
  title: string;
  badge: string;
  price: React.ReactNode;
  desc: string;
  features: string[];
  cta: string;
  onClick: () => void;
  tone?: "accent" | "neutral";
}

export const PlanCard: React.FC<PlanCardProps> = ({
  title,
  badge,
  price,
  desc,
  features,
  cta,
  onClick,
  tone = "neutral",
}) => (
  <div
    className={`flex flex-col justify-between rounded-3xl border p-6 md:p-8 text-left space-y-6 ${
      tone === "accent"
        ? "border-primary-400/40 bg-primary-500/10"
        : "border-slate-200 dark:border-surface-800 bg-white/60 dark:bg-surface-900/60"
    }`}
  >
    <div className='flex items-start justify-between'>
      <div>
        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>{badge}</p>
        <h3 className='text-2xl font-bold text-slate-900 dark:text-white transition-colors'>
          {title}
        </h3>
      </div>
      <span
        className={`text-sm font-semibold px-3 py-1 rounded-full ${
          tone === "accent"
            ? "bg-primary-500/20 text-primary-200"
            : "bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-300"
        }`}
      >
        {price}
      </span>
    </div>
    <p className='text-slate-500 dark:text-slate-300'>{desc}</p>
    <ul className='space-y-2 text-sm text-slate-400'>
      {features.map((item) => (
        <li
          key={item}
          className='flex items-center gap-2'
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${tone === "accent" ? "bg-primary-400" : "bg-primary-500/50"}`}
          />
          {item}
        </li>
      ))}
    </ul>
    <Button
      variant={tone === "accent" ? "primary" : "secondary"}
      onClick={onClick}
      className='w-full h-auto py-3 rounded-2xl'
      rightIcon={<ArrowRight size={16} />}
    >
      {cta}
    </Button>
  </div>
);
