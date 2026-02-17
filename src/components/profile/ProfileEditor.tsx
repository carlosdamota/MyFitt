import React, { useState, useEffect, FormEvent } from "react";
import { Dumbbell, Loader, Check } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { useEntitlement } from "../../hooks/useEntitlement";
import RoutineManager from "../routines/RoutineManager";
import ProfileForm from "./ProfileForm";
import SubscriptionPanel from "./SubscriptionPanel";
import NotificationSettings from "./NotificationSettings";
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

  useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string | number | string[]): void => {
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
    return <div className='p-8 text-center text-slate-500'>Cargando perfil...</div>;

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

      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
          savedSuccess
            ? "bg-green-600 text-white shadow-green-900/20"
            : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
        }`}
      >
        {isSaving ? (
          <Loader
            size={18}
            className='animate-spin'
          />
        ) : savedSuccess ? (
          <>
            <Check size={18} /> Guardado
          </>
        ) : (
          "Guardar Perfil"
        )}
      </button>

      <SubscriptionPanel
        user={user}
        onRequireAuth={onRequireAuth}
      />

      <NotificationSettings user={user} />

      <div className='mt-4 pt-4 border-t border-slate-800 text-center'>
        <button
          type='button'
          onClick={() => setShowRoutineManager(true)}
          className='text-slate-400 hover:text-white text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors'
        >
          <Dumbbell size={16} /> Gestionar Mis Rutinas Guardadas
        </button>
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
              alert(`Modo Desarrollador: Analytics ${newState ? "DESACTIVADO" : "ACTIVADO"}`);
              (window as any)._devTapCount = 0;
            }
          }}
          className='text-[10px] text-slate-700 font-mono cursor-default select-none active:text-slate-500'
        >
          v1.0.0
        </p>
      </div>
    </div>
  );
};

export default ProfileEditor;
