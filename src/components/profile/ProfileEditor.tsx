import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  User,
  Save,
  Ruler,
  Weight,
  Calendar,
  Dumbbell,
  Target,
  AlertCircle,
  Check,
  Zap,
  Loader,
  Clock,
  Utensils,
} from "lucide-react";
import { useProfile } from "../../hooks/useProfile";
import { generateRoutine, generateFullProgram } from "../../api/gemini";
import { useRoutines } from "../../hooks/useRoutines";
import { useRateLimit } from "../../hooks/useRateLimit";
import RateLimitError from "../errors/RateLimitError";
import RoutineManager from "../routines/RoutineManager";
import { logEvent } from "../../utils/analytics";
import type { User as FirebaseUser } from "firebase/auth";

interface ProfileEditorProps {
  user: FirebaseUser | null;
  onClose: () => void;
}

interface ProfileFormData {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female" | "other";
  dietType: "balanced" | "keto" | "paleo" | "high_protein" | "low_carb";
  goal: "muscle_gain" | "fat_loss" | "strength" | "endurance";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  availableDays: number;
  dailyTimeMinutes: number;
  equipment: "gym_full" | "dumbbells_only" | "bodyweight" | "home_gym";
  injuries: string;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onClose }) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { saveRoutine, createRoutine } = useRoutines(user);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [genSuccess, setGenSuccess] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);

  const [showRoutineManager, setShowRoutineManager] = useState<boolean>(false);

  // Rate limiting: 5 generaciones de rutinas por día
  const rateLimitRoutine = useRateLimit(user, "generate_routine", 5);

  useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string | number): void => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    setSavedSuccess(false);
    setGenSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleGenerateRoutine = async (): Promise<void> => {
    if (!formData) return;
    setShowConfirmModal(true);
  };

  const confirmGeneration = async (): Promise<void> => {
    if (!formData) return;
    setShowConfirmModal(false);

    // Verificar rate limit antes de generar
    const canGenerate = await rateLimitRoutine.checkAndIncrement();
    if (!canGenerate) {
      setShowRateLimitError(true);
      return;
    }

    // Primero guardar el perfil para asegurar que usamos los datos más recientes
    await saveProfile(formData);

    setIsGenerating(true);
    try {
      const daysToGenerate = formData.availableDays || 3;
      setGenerationProgress("Generando programa completo con inteligencia artificial...");

      const program = await generateFullProgram({
        weight: parseFloat(formData.weight) || 70,
        height: parseFloat(formData.height) || 170,
        age: parseFloat(formData.age) || 30,
        gender: formData.gender,
        dietType: formData.dietType,
        experienceLevel: formData.experienceLevel,
        goal: formData.goal,
        equipment: formData.equipment,
        injuries: formData.injuries,
        dailyTimeMinutes:
          typeof formData.dailyTimeMinutes === "string"
            ? parseInt(formData.dailyTimeMinutes)
            : formData.dailyTimeMinutes || 60,
        availableDays: daysToGenerate,
        dayNumber: 1, // Not used for full program
        totalDays: daysToGenerate,
      });

      const programId = `prog_${Date.now()}`;
      const programTitle = program.programName || `Programa ${new Date().toLocaleDateString()}`;

      // Save each day
      for (let i = 0; i < program.days.length; i++) {
        const dayRoutine = program.days[i];
        setGenerationProgress(`Guardando día ${i + 1}: ${dayRoutine.title}...`);

        await createRoutine(`Día ${i + 1} - ${dayRoutine.title}`, {
          ...dayRoutine,
          title: dayRoutine.title, // Ensure title is set from AI
          programId: programId,
          active: false,
          dayNumber: i + 1,
          totalDays: program.days.length,
          // Inject program title into goal or a new field if possible, or just rely on grouping
        });
      }

      setGenSuccess(true);
      setGenerationProgress("¡Plan Completado!");

      // Log analytics event
      logEvent("Routine", "Generated Program", `${daysToGenerate} days`);

      // Clear cache or reload routines if needed (useRoutines updates automatically via listener)

      // Abrir el manager para que vea lo nuevo
      setShowRoutineManager(true);
    } catch (error) {
      console.error(error);
      alert("Error generando rutina: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  if (loading || !formData)
    return <div className='p-8 text-center text-slate-500'>Cargando perfil...</div>;

  return (
    <>
      {/* Rate Limit Error Modal */}
      {showRateLimitError && (
        <RateLimitError
          message={
            rateLimitRoutine.error || "Has alcanzado el límite de 5 generaciones de rutinas por día"
          }
          resetAt={rateLimitRoutine.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 duration-200'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='p-2 bg-blue-600/20 rounded-lg'>
                <Zap
                  size={24}
                  className='text-blue-400'
                />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-bold text-white mb-1'>Generar Rutinas con IA</h3>
                <p className='text-sm text-slate-400'>
                  Esto creará {formData.availableDays} rutinas personalizadas basadas en tu perfil,
                  sobrescribiendo las actuales.
                </p>
              </div>
            </div>
            <div className='bg-slate-950 border border-slate-800 rounded-lg p-3 mb-4'>
              <div className='text-xs text-slate-500 space-y-1'>
                <div className='flex justify-between'>
                  <span>Días:</span>
                  <span className='text-white font-bold'>{formData.availableDays}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tiempo/sesión:</span>
                  <span className='text-white font-bold'>{formData.dailyTimeMinutes} min</span>
                </div>
                <div className='flex justify-between'>
                  <span>Objetivo:</span>
                  <span className='text-white font-bold'>
                    {formData.goal === "muscle_gain"
                      ? "Hipertrofia"
                      : formData.goal === "strength"
                        ? "Fuerza"
                        : formData.goal === "fat_loss"
                          ? "Pérdida de Grasa"
                          : "Resistencia"}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => setShowConfirmModal(false)}
                className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors'
              >
                Cancelar
              </button>
              <button
                onClick={confirmGeneration}
                className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg transition-all'
              >
                Generar
              </button>
            </div>
            {isGenerating && (
              <div className='mt-4 text-center'>
                <div className='flex items-center justify-center gap-2 text-blue-400 mb-2'>
                  <Loader
                    size={16}
                    className='animate-spin'
                  />
                  <span className='text-xs font-bold'>{generationProgress}</span>
                </div>
                <div className='h-1 bg-slate-800 rounded-full overflow-hidden'>
                  <div className='h-full bg-blue-500 animate-pulse w-full'></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='space-y-6 pb-20'>
        <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
          <h3 className='text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2'>
            <User size={16} /> Datos Personales
          </h3>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Weight size={12} /> Peso (kg)
              </label>
              <input
                type='number'
                value={formData.weight}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("weight", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
                placeholder='Ej. 75'
              />
            </div>
            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Ruler size={12} /> Altura (cm)
              </label>
              <input
                type='number'
                value={formData.height}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleChange("height", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
                placeholder='Ej. 180'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs text-slate-500 mb-1'>Edad</label>
              <input
                type='number'
                value={formData.age}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("age", e.target.value)}
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
                placeholder='Ej. 30'
              />
            </div>
            <div>
              <label className='block text-xs text-slate-500 mb-1'>Género</label>
              <select
                value={formData.gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("gender", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              >
                <option value='male'>Hombre</option>
                <option value='female'>Mujer</option>
                <option value='other'>Otro</option>
              </select>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Utensils size={12} /> Tipo de Dieta
              </label>
              <select
                value={formData.dietType || "balanced"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("dietType", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              >
                <option value='balanced'>Equilibrada (Estándar)</option>
                <option value='high_protein'>Alta en Proteína</option>
                <option value='keto'>Keto (Cetogénica)</option>
                <option value='paleo'>Paleo</option>
                <option value='low_carb'>Baja en Carbohidratos</option>
              </select>
            </div>
          </div>
        </div>

        <div className='bg-slate-900/50 p-4 rounded-2xl border border-slate-800'>
          <h3 className='text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2'>
            <Target size={16} /> Objetivos y Contexto
          </h3>

          <div className='space-y-4'>
            <div>
              <label className='block text-xs text-slate-500 mb-1'>Objetivo Principal</label>
              <select
                value={formData.goal}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("goal", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              >
                <option value='muscle_gain'>Ganar Músculo (Hipertrofia)</option>
                <option value='strength'>Ganar Fuerza</option>
                <option value='fat_loss'>Perder Grasa</option>
                <option value='endurance'>Resistencia / Salud General</option>
              </select>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1'>Nivel de Experiencia</label>
              <select
                value={formData.experienceLevel}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("experienceLevel", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              >
                <option value='beginner'>Principiante (0-1 años)</option>
                <option value='intermediate'>Intermedio (1-3 años)</option>
                <option value='advanced'>Avanzado (3+ años)</option>
              </select>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Calendar size={12} /> Días Disponibles por Semana
              </label>
              <div className='flex gap-2'>
                {[2, 3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    type='button'
                    onClick={() => handleChange("availableDays", days)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.availableDays === days ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Clock size={12} /> Tiempo Disponible por Sesión (minutos)
              </label>
              <div className='flex gap-2'>
                {[30, 45, 60, 75, 90].map((time) => (
                  <button
                    key={time}
                    type='button'
                    onClick={() => handleChange("dailyTimeMinutes", time)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.dailyTimeMinutes === time ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <Dumbbell size={12} /> Equipamiento Disponible
              </label>
              <select
                value={formData.equipment}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("equipment", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none'
              >
                <option value='gym_full'>Gimnasio Completo</option>
                <option value='home_gym'>Home Gym (Barra + Jaula)</option>
                <option value='dumbbells_only'>Solo Mancuernas</option>
                <option value='bodyweight'>Peso Corporal (Calistenia)</option>
              </select>
            </div>

            <div>
              <label className='block text-xs text-slate-500 mb-1 flex items-center gap-1'>
                <AlertCircle size={12} /> Lesiones / Limitaciones
              </label>
              <textarea
                value={formData.injuries}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("injuries", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none'
                placeholder='Ej. Dolor lumbar, hombro derecho sensible...'
              />
            </div>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }
            disabled={isSaving || isGenerating}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${savedSuccess ? "bg-green-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"}`}
          >
            {isSaving ? (
              "Guardando..."
            ) : savedSuccess ? (
              <>
                <Check size={18} /> Guardado
              </>
            ) : (
              <>
                <Save size={18} /> Guardar Perfil
              </>
            )}
          </button>

          <button
            onClick={handleGenerateRoutine}
            disabled={isGenerating || isSaving}
            className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all transform active:scale-95'
          >
            {isGenerating ? (
              <Loader className='animate-spin' />
            ) : (
              <>
                <Zap size={18} /> Generar Nueva Rutina
              </>
            )}
          </button>
        </div>

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
    </>
  );
};

export default ProfileEditor;
