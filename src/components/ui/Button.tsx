import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * Utility to merge tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ring-offset-white dark:ring-offset-surface-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 shadow-[0_4px_14px_0_rgba(6,182,212,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)] hover:-translate-y-0.5",
      secondary:
        "bg-slate-100 dark:bg-surface-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-surface-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-surface-700 transition-colors",
      outline:
        "border-2 border-primary-500/50 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 hover:border-primary-400 transition-colors",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-white transition-colors",
      danger:
        "bg-red-50 dark:bg-danger-500/10 text-red-600 dark:text-danger-400 hover:bg-red-100 dark:hover:bg-danger-500/20 transition-colors",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        {!isLoading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
