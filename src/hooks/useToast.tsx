import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast],
  );

  const success = useCallback((message: string) => toast(message, "success"), [toast]);
  const error = useCallback((message: string) => toast(message, "error"), [toast]);
  const info = useCallback((message: string) => toast(message, "info"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}

      <div
        className='fixed bottom-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4'
        id='custom-toast-container'
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border pointer-events-auto transition-all transform duration-300 translate-y-0 opacity-100 ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-50 shadow-emerald-900/20"
                : t.type === "error"
                  ? "bg-red-950/90 border-red-500/30 text-red-50 shadow-red-900/20"
                  : "bg-slate-900/90 border-slate-700/50 text-slate-50 shadow-slate-900/20"
            } backdrop-blur-md w-full`}
          >
            {t.type === "success" && <CheckCircle className='w-5 h-5 text-emerald-400 shrink-0' />}
            {t.type === "error" && <AlertCircle className='w-5 h-5 text-red-400 shrink-0' />}
            {t.type === "info" && <Info className='w-5 h-5 text-cyan-400 shrink-0' />}

            <span className='text-sm font-medium flex-1'>{t.message}</span>

            <button
              onClick={() => removeToast(t.id)}
              className='hover:bg-white/10 rounded-full p-1 transition-colors shrink-0'
            >
              <X className='w-4 h-4 opacity-70 hover:opacity-100' />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
