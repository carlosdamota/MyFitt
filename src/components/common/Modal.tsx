import React, { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

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
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Focus trap (basic)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-100 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center p-4'
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
        className={`relative w-full max-w-lg bg-surface-950 rounded-3xl border border-surface-800 shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh] ${className}`}
      >
        <div className='bg-surface-950 p-4 pl-6 flex justify-between items-center border-b border-surface-800'>
          <h2
            id='modal-title'
            className='text-lg font-bold text-white flex items-center gap-2'
          >
            {icon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className='p-2 bg-surface-800 hover:bg-surface-700 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95'
            aria-label='Cerrar'
          >
            <X size={20} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-6 text-slate-200'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
