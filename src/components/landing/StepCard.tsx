import React from "react";

export interface StepCardProps {
  step: string;
  title: string;
  desc: string;
}

export const StepCard: React.FC<StepCardProps> = ({ step, title, desc }) => (
  <div className='p-6 rounded-2xl bg-surface-900/50 border border-surface-800 text-left space-y-4'>
    <div className='text-xs tracking-[0.2em] text-slate-500'>{step}</div>
    <h3 className='text-xl font-bold text-white'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);
