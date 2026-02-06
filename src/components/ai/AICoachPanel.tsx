import React, { useEffect, useState } from "react";
import { Sparkles, User } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { useProfile } from "../../hooks/useProfile";
import { useRoutines } from "../../hooks/useRoutines";
import type { ProfileFormData } from "../../types";
import AIGenerator from "../profile/AIGenerator";
import GoalsContextPanel from "../profile/GoalsContextPanel";

interface AICoachPanelProps {
  user: FirebaseUser | null;
  onRequireAuth?: () => void;
  onShowProfile?: () => void;
  onShowRoutines?: () => void;
  onUpgrade?: () => void;
  isPro?: boolean;
}

const AICoachPanel: React.FC<AICoachPanelProps> = ({
  user,
  onRequireAuth,
  onShowProfile,
  onShowRoutines,
  onUpgrade,
  isPro,
}) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { createRoutine } = useRoutines(user);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string | number | string[]): void => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) {
    return <div className='p-8 text-center text-slate-500'>Cargando AI Coach...</div>;
  }

  if (!formData) {
    return (
      <div className='space-y-4'>
        <div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-5'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-emerald-500/10 text-emerald-300'>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className='text-base font-semibold text-white'>Activa tu AI Coach</h3>
              <p className='text-sm text-slate-400'>Completa tu perfil para generar rutinas.</p>
            </div>
          </div>
        </div>
        <button
          onClick={onShowProfile}
          className='w-full py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center justify-center gap-2'
        >
          <User size={16} /> Completar perfil
        </button>
      </div>
    );
  }

  const handleSubmit = async (): Promise<void> => {
    await saveProfile(formData);
  };

  return (
    <div className='space-y-5 pb-12'>
      <div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between gap-3'>
        <div>
          <p className='text-xs text-slate-400 uppercase tracking-wider'>AI Coach</p>
          <p className='text-sm text-slate-300'>La IA usa tu perfil actual para generar rutinas.</p>
        </div>
        <button
          onClick={onShowProfile}
          className='px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors'
        >
          Editar perfil
        </button>
      </div>

      <GoalsContextPanel
        formData={formData}
        onChange={handleChange}
      />

      <AIGenerator
        user={user}
        formData={formData}
        saveProfile={saveProfile}
        createRoutine={createRoutine}
        isSaving={false}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        savedSuccess={false}
        handleSubmit={handleSubmit}
        onSuccess={() => onShowRoutines?.()}
        onRequireAuth={onRequireAuth}
        onUpgrade={onUpgrade}
        showSaveButton={false}
        isPro={isPro}
      />
    </div>
  );
};

export default AICoachPanel;
