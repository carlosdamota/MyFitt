import React from "react";

export interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({ icon, title, desc }) => (
  <div className='p-5 rounded-2xl bg-white/60 dark:bg-surface-900/50 border border-slate-200 dark:border-surface-800 hover:border-slate-300 dark:hover:border-surface-700 hover:bg-slate-50 dark:hover:bg-surface-800/60 transition-all text-left'>
    <div className='w-11 h-11 rounded-xl bg-slate-100 dark:bg-surface-800 flex items-center justify-center mb-4 transition-colors'>
      {icon}
    </div>
    <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2 transition-colors'>
      {title}
    </h3>
    <p className='text-slate-500 dark:text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);
