import React, { forwardRef } from "react";
import { cn } from "./Button"; // Re-using our cn utility

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "outline";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseStyles = "rounded-2xl overflow-hidden relative";

    const variants = {
      default:
        "bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 transition-colors",
      glass:
        "bg-white/60 dark:bg-surface-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl transition-colors",
      gradient:
        "bg-gradient-to-br from-slate-50 dark:from-surface-800 to-white dark:to-surface-900 border border-slate-200 dark:border-surface-700/50 transition-colors",
      outline: "bg-transparent border-2 border-slate-200 dark:border-surface-800 transition-colors",
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-5 border-b border-slate-200 dark:border-surface-800/50 transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold text-slate-900 dark:text-white tracking-tight transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-4 bg-slate-50 dark:bg-surface-950/30 border-t border-slate-200 dark:border-surface-800/50 flex items-center justify-between transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
