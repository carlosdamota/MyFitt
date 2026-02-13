import React from "react";
import type { ReactNode } from "react";

interface RoutineInfoSectionProps {
  title: string;
  text: string;
  icon: ReactNode;
  tone: "warmup" | "cooldown";
  className?: string;
}

const toneStyles = {
  warmup: {
    wrapper: "bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-start gap-4",
    iconWrapper:
      "p-2.5 bg-orange-500/10 rounded-xl text-orange-400 shrink-0 border border-orange-500/10",
  },
  cooldown: {
    wrapper: "bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-start gap-4",
    iconWrapper:
      "p-2.5 bg-green-500/10 rounded-xl text-green-400 shrink-0 border border-green-500/10",
  },
} as const;

const RoutineInfoSection: React.FC<RoutineInfoSectionProps> = ({
  title,
  text,
  icon,
  tone,
  className,
}) => {
  const styles = toneStyles[tone];

  return (
    <div className={`${styles.wrapper} ${className ?? ""}`.trim()}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div>
        <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-2'>{title}</h3>
        <p className='text-slate-300 text-sm leading-7'>{text}</p>
      </div>
    </div>
  );
};

export default RoutineInfoSection;
