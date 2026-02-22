import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, Undo2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, action?: ToastAction) => void;
  success: (message: string, action?: ToastAction) => void;
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
    (message: string, type: ToastType = "info", action?: ToastAction) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, action }]);
      // Longer timeout when there's an action to give user time to click
      const timeout = action ? 6000 : 3000;
      setTimeout(() => {
        removeToast(id);
      }, timeout);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, action?: ToastAction) => toast(message, "success", action),
    [toast],
  );
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

            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  removeToast(t.id);
                }}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wide transition-all active:scale-95 border border-white/10 shrink-0'
              >
                <Undo2 size={12} />
                {t.action.label}
              </button>
            )}

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
