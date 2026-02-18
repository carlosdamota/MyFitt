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
  isPro?: boolean;
}

const GeneratedRoutinesHistory: React.FC<{
  user: FirebaseUser | null;
  onShowRoutines?: () => void;
}> = ({ user, onShowRoutines }) => {
  const { routines } = useRoutines(user);

  // Group routines by programId to count "generated programs"
  const programs = React.useMemo(() => {
    const groups: Record<string, { title: string; date: string; count: number; focus: string }> =
      {};

    Object.values(routines).forEach((routine) => {
      if (routine.programId && !routine.isDefault) {
        if (!groups[routine.programId]) {
          groups[routine.programId] = {
            title: routine.title.split(":")[0].trim(),
            date: routine.createdAt || new Date().toISOString(),
            count: 0,
            focus: routine.focus || routine.goal || "General",
          };
        }
        groups[routine.programId].count++;
      }
    });

    return Object.values(groups).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [routines]);

  if (programs.length === 0) return null;

  return (
    <div className='space-y-3 animate-in slide-in-from-bottom-2 duration-500'>
      <div className='flex items-center justify-between px-1'>
        <h3 className='text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2'>
          <span className='w-1.5 h-1.5 rounded-full bg-blue-500' />
          Historial Generado ({programs.length})
        </h3>
      </div>

      <div className='grid gap-2'>
        {programs.slice(0, 3).map((prog, idx) => (
          <div
            key={idx}
            className='bg-slate-900/30 border border-slate-800 rounded-xl p-3 flex items-center justify-between'
          >
            <div>
              <h4 className='text-sm font-bold text-slate-300'>{prog.title}</h4>
              <div className='flex gap-2 text-[10px] text-slate-500 mt-0.5'>
                <span>{new Date(prog.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{prog.count} Días</span>
                <span>•</span>
                <span>{prog.focus}</span>
              </div>
            </div>
            <button
              onClick={onShowRoutines}
              className='text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-900/10 hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors'
            >
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AICoachPanel: React.FC<AICoachPanelProps> = ({
  user,
  onRequireAuth,
  onShowProfile,
  onShowRoutines,
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

      {/* Generated Routines Summary */}
      <GeneratedRoutinesHistory
        user={user}
        onShowRoutines={onShowRoutines}
      />

      <GoalsContextPanel
        formData={formData}
        onChange={handleChange}
        isPro={isPro}
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
        showSaveButton={false}
        isPro={isPro}
      />
    </div>
  );
};

export default AICoachPanel;
