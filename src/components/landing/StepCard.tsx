import React from "react";

export interface StepCardProps {
  step: string;
  title: string;
  desc: string;
}

export const StepCard: React.FC<StepCardProps> = ({ step, title, desc }) => (
  <div className='p-6 rounded-2xl bg-white/60 dark:bg-surface-900/50 border border-slate-200 dark:border-surface-800 text-left space-y-4 transition-colors'>
    <div className='text-xs tracking-[0.2em] text-slate-500'>{step}</div>
    <h3 className='text-xl font-bold text-slate-900 dark:text-white transition-colors'>{title}</h3>
    <p className='text-slate-500 dark:text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);
