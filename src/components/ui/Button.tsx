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
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 ring-offset-surface-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 shadow-[0_4px_14px_0_rgba(6,182,212,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)] hover:-translate-y-0.5",
      secondary:
        "bg-surface-800 text-slate-200 hover:bg-surface-700 hover:text-white border border-surface-700",
      outline:
        "border-2 border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400",
      ghost: "text-slate-300 hover:bg-surface-800 hover:text-white",
      danger: "bg-danger-500/10 text-danger-400 hover:bg-danger-500/20",
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
