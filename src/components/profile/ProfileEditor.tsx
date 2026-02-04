import React, { useState, useEffect, FormEvent } from "react";
import { Dumbbell } from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { useRoutines } from "../../hooks/useRoutines";
import RoutineManager from "../routines/RoutineManager";
import ProfileForm from "./ProfileForm";
import AIGenerator from "./AIGenerator";
import type { User as FirebaseUser } from "firebase/auth";
import type { ProfileFormData } from "../../types";

interface ProfileEditorProps {
  user: FirebaseUser | null;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onClose }) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { createRoutine } = useRoutines(user);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showRoutineManager, setShowRoutineManager] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string | number): void => {
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

  if (loading || !formData)
    return <div className='p-8 text-center text-slate-500'>Cargando perfil...</div>;

  return (
    <div className='space-y-6 pb-20 overflow-y-auto max-h-[80vh] px-1'>
      <ProfileForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        isGenerating={isGenerating}
        savedSuccess={savedSuccess}
      />

      <AIGenerator
        user={user}
        formData={formData}
        saveProfile={saveProfile}
        createRoutine={createRoutine}
        isSaving={isSaving}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        savedSuccess={savedSuccess}
        handleSubmit={handleSubmit}
        onSuccess={() => setShowRoutineManager(true)}
      />

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
    </div>
  );
};

export default ProfileEditor;
