import React, { forwardRef } from "react";
import { cn } from "./Button";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950";

    const variants = {
      default: "bg-surface-800 text-slate-200",
      primary: "bg-primary-500/20 text-primary-300 border border-primary-500/30",
      secondary: "bg-secondary-500/20 text-secondary-300 border border-secondary-500/30",
      success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      danger: "bg-danger-500/20 text-danger-300 border border-danger-500/30",
      outline: "text-slate-200 border border-surface-700",
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
