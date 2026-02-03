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
      className='fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      ref={modalRef}
      tabIndex={-1}
    >
      <div className='bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800'>
        <h2
          id='modal-title'
          className='text-lg font-bold text-white flex items-center gap-2'
        >
          {icon}
          {title}
        </h2>
        <button
          onClick={onClose}
          className='p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors'
          aria-label='Cerrar'
        >
          <X size={20} />
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 ${className}`}>{children}</div>
    </div>
  );
};

export default Modal;
