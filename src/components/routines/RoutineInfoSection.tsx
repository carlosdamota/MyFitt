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
    wrapper:
      "bg-slate-50 dark:bg-surface-900/40 border border-slate-200 dark:border-surface-800 rounded-2xl p-5 flex items-start gap-4 transition-colors",
    iconWrapper:
      "p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400 shrink-0 border border-orange-200 dark:border-orange-500/10 transition-colors",
  },
  cooldown: {
    wrapper:
      "bg-slate-50 dark:bg-surface-900/40 border border-slate-200 dark:border-surface-800 rounded-2xl p-5 flex items-start gap-4 transition-colors",
    iconWrapper:
      "p-2.5 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400 shrink-0 border border-green-200 dark:border-green-500/10 transition-colors",
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
        <h3 className='text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors'>
          {title}
        </h3>
        <p className='text-slate-700 dark:text-slate-300 text-sm leading-7 transition-colors'>
          {text}
        </p>
      </div>
    </div>
  );
};

export default RoutineInfoSection;
