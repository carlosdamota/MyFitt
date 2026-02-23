import React, { forwardRef } from "react";
import { cn } from "./Button";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-950";

    const variants = {
      default:
        "bg-slate-100 dark:bg-surface-800 text-slate-700 dark:text-slate-200 transition-colors",
      primary:
        "bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-500/30 transition-colors",
      secondary:
        "bg-secondary-50 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-500/30 transition-colors",
      success:
        "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 transition-colors",
      warning:
        "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 transition-colors",
      danger:
        "bg-red-50 dark:bg-danger-500/20 text-red-700 dark:text-danger-300 border border-red-200 dark:border-danger-500/30 transition-colors",
      outline:
        "text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-surface-700 transition-colors",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { Badge };
