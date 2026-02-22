import React from "react";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className='p-5 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 hover:bg-surface-800/60 transition-all text-left'>
    <div className='w-11 h-11 rounded-xl bg-surface-800 flex items-center justify-center mb-4'>
      {icon}
    </div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-slate-400 text-sm leading-relaxed'>{desc}</p>
  </div>
);
