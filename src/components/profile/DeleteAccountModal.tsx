import React, { useState } from "react";
import { Trash2, AlertTriangle, X, Loader, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import type { User } from "firebase/auth";
import { auth } from "../../config/firebase";

interface DeleteAccountModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onAccountDeleted: () => void;
}

const FEEDBACK_REASONS = [
  { id: "not_useful", label: "No me resulta útil" },
  { id: "found_alternative", label: "Encontré algo mejor" },
  { id: "too_expensive", label: "Demasiado caro" },
  { id: "technical_issues", label: "Problemas técnicos" },
  { id: "privacy", label: "Preocupaciones de privacidad" },
  { id: "other", label: "Otro" },
] as const;

type FeedbackReason = (typeof FEEDBACK_REASONS)[number]["id"];

const getFunctionsUrl = () => {
  const projectId = auth?.app.options.projectId;
  if (import.meta.env.DEV) {
    return `http://127.0.0.1:5001/${projectId}/us-central1`;
  }
  return `https://us-central1-${projectId}.cloudfunctions.net`;
};

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  user,
  onClose,
  onAccountDeleted,
}) => {
  const [step, setStep] = useState<"feedback" | "confirm">("feedback");
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const [comment, setComment] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep("feedback");
    setSelectedReason(null);
    setComment("");
    setConfirmText("");
    setIsDeleting(false);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const submitFeedback = async () => {
    if (!selectedReason) return;

    try {
      const token = await user.getIdToken();
      const baseUrl = getFunctionsUrl();

      await fetch(`${baseUrl}/submitDeletionFeedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: selectedReason,
          comment: comment.trim() || null,
        }),
      });
    } catch {
      // Non-critical — continue with deletion even if feedback fails
      console.warn("Failed to submit deletion feedback");
    }
  };

  const handleGoToConfirm = async (withFeedback: boolean) => {
    if (withFeedback) {
      await submitFeedback();
    }
    setStep("confirm");
  };

  const performDeletion = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const baseUrl = getFunctionsUrl();

      const response = await fetch(`${baseUrl}/deleteUserAccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }

      await auth?.signOut();
      onAccountDeleted();
    } catch (err: any) {
      console.error("Delete account error:", err);
      setError("Error al comunicar con el servidor. Inténtalo de nuevo.");
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (confirmText !== "ELIMINAR") return;
    await performDeletion();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={handleClose}
      />

      <div className='relative bg-surface-900 border border-surface-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl'>
        <div className='flex items-center justify-between p-4 border-b border-surface-800'>
          <div className='flex items-center gap-2'>
            {step === "feedback" ? (
              <MessageSquare
                size={20}
                className='text-slate-400'
              />
            ) : (
              <AlertTriangle
                size={20}
                className='text-danger-400'
              />
            )}
            <h2 className='text-lg font-bold text-white'>
              {step === "feedback" ? "¿Por qué te vas?" : "Confirmar eliminación"}
            </h2>
          </div>
          <Button
            variant='ghost'
            onClick={handleClose}
            className='p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors'
            aria-label='Cerrar modal'
          >
            <X size={18} />
          </Button>
        </div>

        <div className='p-4'>
          {step === "feedback" && (
            <div className='space-y-4'>
              <p className='text-sm text-slate-400'>
                Tu opinión nos ayuda a mejorar. Es completamente opcional y anónima.
              </p>

              <div className='space-y-2'>
                {FEEDBACK_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? "border-danger-500/50 bg-danger-500/10 text-white"
                        : "border-surface-700 bg-surface-800/50 text-slate-300 hover:border-surface-600"
                    }`}
                  >
                    <input
                      type='radio'
                      name='reason'
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className='sr-only'
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedReason === reason.id ? "border-danger-500" : "border-slate-600"
                      }`}
                    >
                      {selectedReason === reason.id && (
                        <div className='w-2 h-2 rounded-full bg-danger-500' />
                      )}
                    </div>
                    <span className='text-sm font-medium'>{reason.label}</span>
                  </label>
                ))}
              </div>

              {selectedReason && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='Cuéntanos más (opcional)...'
                  rows={3}
                  maxLength={1000}
                  className='w-full bg-surface-800 border border-surface-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none'
                />
              )}

              <div className='flex flex-col gap-2 pt-2'>
                <Button
                  variant='danger'
                  onClick={() => handleGoToConfirm(true)}
                  disabled={!selectedReason}
                  className='w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2'
                  rightIcon={<ChevronRight size={16} />}
                >
                  Enviar y continuar
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => handleGoToConfirm(false)}
                  className='w-full py-2.5 rounded-xl font-medium text-sm'
                >
                  Saltar y continuar
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className='space-y-4'>
              <div className='bg-danger-500/10 border border-danger-500/30 rounded-xl p-4'>
                <div className='flex gap-3'>
                  <AlertTriangle
                    size={20}
                    className='text-danger-400 shrink-0 mt-0.5'
                  />
                  <div className='space-y-2'>
                    <p className='text-sm font-semibold text-danger-300'>
                      Esta acción es irreversible
                    </p>
                    <ul className='text-xs text-red-300/80 space-y-1'>
                      <li>• Se eliminará tu cuenta de autenticación</li>
                      <li>• Se borrarán todas tus rutinas y datos</li>
                      <li>• Se cancelará tu suscripción si la tienes</li>
                      <li>• No podrás recuperar ningún dato</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-300 mb-2'>
                  Escribe <span className='font-mono text-danger-400'>ELIMINAR</span> para
                  confirmar:
                </label>
                <input
                  type='text'
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder='ELIMINAR'
                  className='w-full bg-surface-800 border border-surface-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-danger-500/50 font-mono tracking-wider'
                  autoComplete='off'
                />
              </div>

              {error && (
                <div className='bg-danger-500/10 border border-danger-500/30 rounded-xl p-3 text-sm text-danger-300'>
                  {error}
                </div>
              )}

              <div className='flex gap-3 pt-2 w-full'>
                <Button
                  variant='outline'
                  onClick={handleClose}
                  disabled={isDeleting}
                  className='flex-1 py-3 rounded-xl font-bold text-sm'
                >
                  Cancelar
                </Button>
                <Button
                  variant='danger'
                  onClick={handleConfirmDelete}
                  disabled={confirmText !== "ELIMINAR" || isDeleting}
                  className='flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2'
                  leftIcon={
                    isDeleting ? (
                      <Loader
                        size={18}
                        className='animate-spin'
                      />
                    ) : (
                      <Trash2 size={16} />
                    )
                  }
                >
                  {isDeleting ? "" : "Eliminar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
