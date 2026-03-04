import React from "react";
import { useTheme } from "../../contexts/ThemeProvider";
import { Monitor, Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full sm:w-auto mt-1 sm:mt-0'>
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
          theme === "light"
            ? "bg-white text-primary-600 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <Sun className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
        <span>Claro</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
          theme === "dark"
            ? "bg-slate-700 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <Moon className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
        <span>Oscuro</span>
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`flex items-center justify-center gap-2 flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
          theme === "system"
            ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <Monitor className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
        <span>Auto</span>
      </button>
    </div>
  );
}
