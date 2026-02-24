import React, { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";
import { useScrollLock } from "../../hooks/useScrollLock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Lock scroll
  useScrollLock(isOpen);

  // Focus trap (basic)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-100 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center p-4 transition-colors'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      ref={modalRef}
      tabIndex={-1}
    >
      <div
        className='absolute inset-0'
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-surface-950 rounded-3xl border border-slate-200 dark:border-surface-800 shadow-xl dark:shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[85vh] transition-colors ${className}`}
      >
        <div className='bg-white dark:bg-surface-950 p-4 pl-6 flex justify-between items-center border-b border-slate-200 dark:border-surface-800 transition-colors'>
          <h2
            id='modal-title'
            className='text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors'
          >
            {icon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className='p-2 bg-slate-100 dark:bg-surface-800 hover:bg-slate-200 dark:hover:bg-surface-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95'
            aria-label='Cerrar'
          >
            <X size={20} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-6 text-slate-700 dark:text-slate-200 transition-colors'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
