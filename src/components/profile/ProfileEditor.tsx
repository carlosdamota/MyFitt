import React, { useState, useEffect, FormEvent } from "react";
import { Dumbbell, Loader, Check, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/Button";
import { useProfile } from "../../hooks/useProfile";
import { useEntitlement } from "../../hooks/useEntitlement";
import { useToast } from "../../hooks/useToast";
import RoutineManager from "../routines/RoutineManager";
import ProfileForm from "./ProfileForm";
import SubscriptionPanel from "./SubscriptionPanel";
import NotificationSettings from "./NotificationSettings";
import ThemeToggle from "../common/ThemeToggle";
import DeleteAccountModal from "./DeleteAccountModal";
import type { User as FirebaseUser } from "firebase/auth";
import type { ProfileFormData } from "../../types";

interface ProfileEditorProps {
  user: FirebaseUser | null;
  onRequireAuth?: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onRequireAuth }) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { plan } = useEntitlement(user);
  const isPro = plan === "pro";
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showRoutineManager, setShowRoutineManager] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { info } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: any): void => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleSaveClick = async (): Promise<void> => {
    if (!formData) return;
    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  if (loading || !formData)
    return (
      <div className='p-8 text-center text-slate-500 dark:text-slate-400'>Cargando perfil...</div>
    );

  return (
    <div className='space-y-6 pb-20 px-1'>
      <ProfileForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        isGenerating={false}
        savedSuccess={savedSuccess}
        isPro={isPro}
      />

      <Button
        onClick={handleSaveClick}
        disabled={isSaving}
        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${savedSuccess ? "bg-success-600 hover:bg-success-600 text-white shadow-success-900/20" : ""}`}
        variant='primary'
        leftIcon={
          isSaving ? (
            <Loader
              size={18}
              className='animate-spin'
            />
          ) : savedSuccess ? (
            <Check size={18} />
          ) : undefined
        }
      >
        {savedSuccess ? "Guardado" : "Guardar Perfil"}
      </Button>

      <SubscriptionPanel
        user={user}
        onRequireAuth={onRequireAuth}
      />

      <NotificationSettings user={user} />

      <div className='bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800 rounded-2xl p-5 mb-6 shadow-sm dark:shadow-xl transition-colors'>
        <h3 className='text-sm font-semibold text-slate-800 dark:text-white mb-4'>Apariencia</h3>
        <ThemeToggle />
      </div>

      <div className='mt-4 pt-4 border-t border-slate-200 dark:border-surface-800 text-center transition-colors'>
        <Button
          variant='ghost'
          onClick={() => setShowRoutineManager(true)}
          className='w-full sm:w-auto mx-auto'
          leftIcon={<Dumbbell size={16} />}
        >
          Gestionar Mis Rutinas Guardadas
        </Button>
      </div>

      {showRoutineManager && (
        <RoutineManager
          user={user}
          onClose={() => setShowRoutineManager(false)}
        />
      )}

      {/* Secret Developer Mode Trigger */}
      <div className='mt-8 text-center'>
        <p
          onClick={() => {
            const newCount = ((window as any)._devTapCount =
              ((window as any)._devTapCount || 0) + 1);
            if (newCount === 7) {
              const currentOptOut = localStorage.getItem("fittwiz_analytics_optout") === "true";
              const newState = !currentOptOut;
              localStorage.setItem("fittwiz_analytics_optout", String(newState));
              info(`Modo Desarrollador: Analytics ${newState ? "DESACTIVADO" : "ACTIVADO"}`);
              (window as any)._devTapCount = 0;
            }
          }}
          className='text-[10px] text-slate-400 dark:text-slate-700 font-mono cursor-default select-none active:text-slate-500 transition-colors'
        >
          v1.0.0
        </p>
      </div>

      {/* Danger Zone — Delete Account */}
      {user && (
        <div className='mt-6 pt-6 border-t border-danger-500/20'>
          <Button
            variant='danger'
            onClick={() => setShowDeleteModal(true)}
            className='w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2'
            leftIcon={<Trash2 size={16} />}
          >
            Eliminar mi cuenta
          </Button>
          <p className='text-[11px] text-slate-500 dark:text-slate-600 text-center mt-2 transition-colors'>
            Se eliminarán todos tus datos de forma irreversible.
          </p>
        </div>
      )}

      {/* Delete Account Modal */}
      {user && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onAccountDeleted={() => {
            setShowDeleteModal(false);
            navigate("/");
          }}
        />
      )}
    </div>
  );
};

export default ProfileEditor;
