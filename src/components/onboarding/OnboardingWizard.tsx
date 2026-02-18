import React, { useState, useEffect, type ChangeEvent } from "react";
import {
  User,
  Weight,
  Ruler,
  Target,
  Calendar,
  Clock,
  Dumbbell,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader,
  Check,
  ArrowRight,
  Crown,
  X,
} from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import type { ProfileFormData, EquipmentOption } from "../../types";
import { useProfile } from "../../hooks/useProfile";
import { useRoutines } from "../../hooks/useRoutines";
import { generateFullProgram } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import { AiError } from "../../api/ai";

// ——————————————————————————————————————————
// Constants
// ——————————————————————————————————————————

const TOTAL_STEPS = 4;
const FREE_MAX_DAYS = 2;

const goalOptions: {
  value: ProfileFormData["goal"];
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { value: "muscle_gain", label: "Ganar Músculo", emoji: "💪", desc: "Hipertrofia y volumen" },
  { value: "strength", label: "Ganar Fuerza", emoji: "🏋️", desc: "Potencia y PRs" },
  { value: "fat_loss", label: "Perder Grasa", emoji: "🔥", desc: "Definición y recorte" },
  { value: "endurance", label: "Resistencia", emoji: "🏃", desc: "Salud general y cardio" },
];

const levelOptions: { value: ProfileFormData["experienceLevel"]; label: string; years: string }[] =
  [
    { value: "beginner", label: "Principiante", years: "0-1 años" },
    { value: "intermediate", label: "Intermedio", years: "1-3 años" },
    { value: "advanced", label: "Avanzado", years: "3+ años" },
  ];

const equipmentOptions: { value: EquipmentOption; label: string; description: string }[] = [
  { value: "gym_full", label: "Gimnasio completo", description: "Máquinas + libres" },
  { value: "home_gym", label: "Home gym", description: "Barra + jaula" },
  { value: "dumbbells_only", label: "Solo mancuernas", description: "Ajustables o fijas" },
  { value: "bodyweight", label: "Peso corporal", description: "Calistenia" },
  { value: "barbell_plates", label: "Barra y discos", description: "Peso libre" },
  { value: "pullup_bar", label: "Barra de dominadas", description: "Pared o puerta" },
  { value: "resistance_bands", label: "Bandas elásticas", description: "Ligeras/medias" },
  { value: "bench", label: "Banco", description: "Plano/inclinado" },
  { value: "kettlebells", label: "Kettlebells", description: "Balones rusos" },
];

const equipmentLabels: Record<string, string> = Object.fromEntries(
  equipmentOptions.map((o) => [o.value, o.label]),
);

const formatEquipment = (equipment: EquipmentOption[]): string => {
  if (!equipment || equipment.length === 0) return "Peso corporal";
  return equipment.map((v) => equipmentLabels[v] ?? v).join(", ");
};

const MOTIVATIONAL_PHRASES = [
  "Preparando tu entrenamiento personalizado... 💪",
  "Analizando tu perfil de atleta...",
  "Los campeones se forjan en el gimnasio 🏆",
  "Diseñando ejercicios perfectos para ti...",
  "El dolor de hoy es la fuerza del mañana 🔥",
  "Calculando las mejores series y repeticiones...",
  "Cada repetición cuenta, cada día suma 📈",
  "Tu mejor versión está a punto de nacer ⭐",
];

// ——————————————————————————————————————————
// Component Props
// ——————————————————————————————————————————

interface OnboardingWizardProps {
  user: FirebaseUser;
  onComplete: () => void;
  onSkip: () => void;
}

// ——————————————————————————————————————————
// Main Component
// ——————————————————————————————————————————

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const { saveProfile } = useProfile(user);
  const { createRoutine } = useRoutines(user);

  const [formData, setFormData] = useState<ProfileFormData>({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    experienceLevel: "intermediate",
    goal: "muscle_gain",
    availableDays: FREE_MAX_DAYS,
    dailyTimeMinutes: 60,
    equipment: ["gym_full"],
    dietType: "balanced",
    injuries: "",
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Rotate motivational phrases
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleChange = (field: keyof ProfileFormData, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (value: EquipmentOption) => {
    const current = formData.equipment;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    handleChange("equipment", next);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!(formData.weight && formData.height && formData.age);
      case 1:
        return !!(formData.goal && formData.experienceLevel);
      case 2:
        return formData.equipment.length > 0 && formData.availableDays >= 2;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
    }
    if (step === TOTAL_STEPS - 2) {
      // Entering the generation step → auto-generate
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationComplete(false);

    try {
      // 1. Save the profile initially (without completion flag yet)
      setGenerationProgress("Guardando tu perfil...");
      await saveProfile(formData);

      // 2. Generate the routine
      setGenerationProgress("Generando programa con IA...");
      const daysToGenerate = formData.availableDays || 3;

      const program = await generateFullProgram({
        weight: parseFloat(formData.weight) || 70,
        height: parseFloat(formData.height) || 170,
        age: parseFloat(formData.age) || 30,
        gender: formData.gender,
        dietType: formData.dietType,
        experienceLevel: formData.experienceLevel,
        goal: formData.goal,
        equipment: formatEquipment(formData.equipment),
        injuries: formData.injuries,
        dailyTimeMinutes:
          typeof formData.dailyTimeMinutes === "string"
            ? parseInt(formData.dailyTimeMinutes)
            : formData.dailyTimeMinutes || 60,
        availableDays: daysToGenerate,
        dayNumber: 1,
        totalDays: daysToGenerate,
      });

      // 3. Save each day as a routine
      const programId = `prog_${Date.now()}`;
      for (let i = 0; i < program.days.length; i++) {
        const dayRoutine = program.days[i];
        setGenerationProgress(`Guardando día ${i + 1}: ${dayRoutine.title}...`);

        const titleParts =
          dayRoutine.title?.replace(/^Día \d+[:\s-]*/, "").trim() ||
          dayRoutine.focus ||
          `Rutina ${i + 1}`;
        const cleanTitle = `${program.programName || "Programa"}: ${titleParts}`;

        await createRoutine(cleanTitle, {
          ...dayRoutine,
          title: cleanTitle,
          programId: programId,
          active: false,
          dayNumber: i + 1,
          totalDays: program.days.length,
        });
      }

      // 4. Mark onboarding as completed ONLY after everything else succeeded
      setGenerationProgress("Finalizando...");
      await saveProfile({ ...formData, onboardingCompleted: true });

      logEvent("Onboarding", "Completed", `${daysToGenerate} days`);
      setGenerationComplete(true);
      setGenerationProgress("¡Tu plan está listo!");
    } catch (error) {
      console.error("Onboarding generation error:", error);
      if (error instanceof AiError && error.code === "quota_exceeded") {
        setGenerationError("Límite de IA alcanzado. Tu perfil se ha guardado correctamente.");
      } else {
        setGenerationError("Error generando la rutina. Tu perfil se ha guardado.");
      }
      // Profile was saved at least
    } finally {
      setIsGenerating(false);
    }
  };

  // ——————————————————
  // Progress Bar
  // ——————————————————

  const renderProgressBar = () => (
    <div className='flex items-center gap-2 mb-8'>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < step
              ? "bg-cyan-400"
              : i === step
                ? "bg-linear-to-r from-cyan-400 to-purple-400"
                : "bg-slate-800"
          }`}
        />
      ))}
    </div>
  );

  // ——————————————————
  // Step 0: Personal Data
  // ——————————————————

  const renderStepPersonalData = () => (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4'>
          <User
            size={32}
            className='text-cyan-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>Cuéntanos de ti</h2>
        <p className='text-sm text-slate-400'>
          Necesitamos algunos datos para personalizar tu experiencia
        </p>
      </div>

      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
              <Weight size={12} /> Peso (kg)
            </label>
            <input
              type='number'
              inputMode='decimal'
              value={formData.weight}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("weight", e.target.value)
              }
              className='w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:border-cyan-400/60 outline-none transition-colors'
              placeholder='75'
            />
          </div>
          <div>
            <label className='text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
              <Ruler size={12} /> Altura (cm)
            </label>
            <input
              type='number'
              inputMode='decimal'
              value={formData.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("height", e.target.value)
              }
              className='w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:border-cyan-400/60 outline-none transition-colors'
              placeholder='180'
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-xs text-slate-400 mb-1.5 block font-medium'>Edad</label>
            <input
              type='number'
              inputMode='numeric'
              value={formData.age}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("age", e.target.value)}
              className='w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:border-cyan-400/60 outline-none transition-colors'
              placeholder='30'
            />
          </div>
          <div>
            <label className='text-xs text-slate-400 mb-1.5 block font-medium'>Género</label>
            <select
              value={formData.gender}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleChange("gender", e.target.value)
              }
              className='w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:border-cyan-400/60 outline-none transition-colors'
            >
              <option value='male'>Hombre</option>
              <option value='female'>Mujer</option>
              <option value='other'>Otro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // ——————————————————
  // Step 1: Goals
  // ——————————————————

  const renderStepGoals = () => (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4'>
          <Target
            size={32}
            className='text-amber-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>¿Qué quieres conseguir?</h2>
        <p className='text-sm text-slate-400'>Selecciona tu objetivo principal y tu nivel</p>
      </div>

      <div className='space-y-6'>
        {/* Goal selection — big visual cards */}
        <div className='grid grid-cols-2 gap-3'>
          {goalOptions.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() => handleChange("goal", option.value)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                formData.goal === option.value
                  ? "border-amber-400/70 bg-amber-500/10 shadow-lg shadow-amber-900/10 scale-[1.02]"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              <span className='text-2xl block mb-2'>{option.emoji}</span>
              <span className='text-sm font-bold text-white block'>{option.label}</span>
              <span className='text-[11px] text-slate-400 block mt-0.5'>{option.desc}</span>
            </button>
          ))}
        </div>

        {/* Experience level */}
        <div>
          <label className='text-xs text-slate-400 mb-2 block font-medium'>
            Nivel de experiencia
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {levelOptions.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleChange("experienceLevel", option.value)}
                className={`py-3 px-2 rounded-xl border text-center transition-all duration-200 ${
                  formData.experienceLevel === option.value
                    ? "border-amber-400/70 bg-amber-500/10 text-white"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className='text-xs font-bold block'>{option.label}</span>
                <span className='text-[10px] text-slate-500 block mt-0.5'>{option.years}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ——————————————————
  // Step 2: Equipment & Schedule
  // ——————————————————

  const renderStepEquipment = () => (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4'>
          <Dumbbell
            size={32}
            className='text-blue-400'
          />
        </div>
        <h2 className='text-2xl font-bold text-white mb-2'>¿Con qué cuentas?</h2>
        <p className='text-sm text-slate-400'>Tu equipo y disponibilidad semanal</p>
      </div>

      <div className='space-y-6'>
        {/* Equipment chips */}
        <div>
          <label className='text-xs text-slate-400 mb-2 block font-medium'>
            Equipamiento disponible
          </label>
          <div className='flex flex-wrap gap-2'>
            {equipmentOptions.map((option) => {
              const isSelected = formData.equipment.includes(option.value);
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => toggleEquipment(option.value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all select-none ${
                    isSelected
                      ? "border-cyan-400/70 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <span className='flex flex-col gap-0.5 text-left'>
                    <span className='text-xs font-semibold'>{option.label}</span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-cyan-200/70" : "text-slate-500"}`}
                    >
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Days available — free users limited to 2 */}
        <div>
          <label className='text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium'>
            <Calendar size={12} /> Días por semana
          </label>
          <div className='flex items-center gap-2'>
            {[2, 3, 4, 5, 6].map((days) => {
              const isLocked = days > FREE_MAX_DAYS;
              return (
                <button
                  key={days}
                  type='button'
                  onClick={() => !isLocked && handleChange("availableDays", days)}
                  disabled={isLocked}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all relative ${
                    isLocked
                      ? "bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                      : formData.availableDays === days
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  {days}
                  {isLocked && (
                    <Crown
                      size={8}
                      className='absolute top-1 right-1 text-amber-500/70'
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className='text-[10px] text-amber-500/70 mt-2 flex items-center gap-1'>
            <Crown size={10} /> Rutinas de 3+ días disponibles con Pro
          </p>
        </div>

        {/* Time per session */}
        <div>
          <label className='text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-medium'>
            <Clock size={12} /> Minutos por sesión
          </label>
          <div className='flex items-center gap-2'>
            {[30, 45, 60, 75, 90].map((time) => (
              <button
                key={time}
                type='button'
                onClick={() => handleChange("dailyTimeMinutes", time)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                  formData.dailyTimeMinutes === time
                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Injuries */}
        <div>
          <label className='text-xs text-slate-400 mb-1.5 flex items-center gap-1.5 font-medium'>
            <AlertCircle size={12} /> Lesiones / Limitaciones (opcional)
          </label>
          <textarea
            value={formData.injuries}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("injuries", e.target.value)
            }
            className='w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:border-cyan-400/60 outline-none h-16 resize-none transition-colors'
            placeholder='Ej. Dolor lumbar, hombro derecho sensible...'
          />
        </div>
      </div>
    </div>
  );

  // ——————————————————
  // Step 3: Generation
  // ——————————————————

  const renderStepGeneration = () => (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center min-h-[400px] text-center'>
      {/* Generating State */}
      {isGenerating && (
        <>
          <div className='relative mb-8'>
            <div className='w-24 h-24 rounded-full bg-linear-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center'>
              <Dumbbell
                size={40}
                className='text-blue-400 animate-pulse'
              />
            </div>
            <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin' />
          </div>

          <p className='text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400 mb-4 min-h-12 transition-all duration-500'>
            {MOTIVATIONAL_PHRASES[phraseIndex]}
          </p>

          <p className='text-sm text-slate-400 mb-6'>
            {generationProgress || "Iniciando generación..."}
          </p>

          <div className='w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden'>
            <div className='h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse w-full' />
          </div>

          <p className='text-xs text-slate-500 mt-6'>Esto puede tardar hasta 30 segundos</p>
        </>
      )}

      {/* Success State */}
      {generationComplete && !isGenerating && (
        <>
          <div className='w-24 h-24 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6'>
            <Check
              size={48}
              className='text-green-400'
            />
          </div>

          <h2 className='text-2xl font-bold text-white mb-2'>¡Tu plan está listo! 🎉</h2>
          <p className='text-sm text-slate-400 mb-8 max-w-sm'>
            Hemos creado {formData.availableDays} rutinas personalizadas basadas en tu perfil. ¡Es
            hora de entrenar!
          </p>

          <button
            onClick={onComplete}
            className='px-8 py-4 rounded-2xl font-bold text-sm bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30 transition-all transform active:scale-95 flex items-center gap-2'
          >
            Empezar a entrenar <ArrowRight size={18} />
          </button>
        </>
      )}

      {/* Error State */}
      {generationError && !isGenerating && !generationComplete && (
        <>
          <div className='w-24 h-24 rounded-full bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6'>
            <AlertCircle
              size={48}
              className='text-amber-400'
            />
          </div>

          <h2 className='text-xl font-bold text-white mb-2'>Perfil guardado</h2>
          <p className='text-sm text-slate-400 mb-2 max-w-sm'>{generationError}</p>
          <p className='text-xs text-slate-500 mb-8'>
            Puedes generar tu primera rutina desde el Coach IA
          </p>

          <div className='flex gap-3'>
            <button
              onClick={() => {
                setGenerationError(null);
                handleGenerate();
              }}
              className='px-6 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors'
            >
              Reintentar
            </button>
            <button
              onClick={onComplete}
              className='px-6 py-3 rounded-xl font-bold text-sm bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg transition-all'
            >
              Continuar
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ——————————————————
  // Render
  // ——————————————————

  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return renderStepPersonalData();
      case 1:
        return renderStepGoals();
      case 2:
        return renderStepEquipment();
      case 3:
        return renderStepGeneration();
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-(--bg-0) text-slate-200 font-sans selection:bg-cyan-500/30'>
      {/* Background effects */}
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[110px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[110px]' />
      </div>

      <div className='relative z-10 max-w-lg mx-auto px-4 py-8'>
        {/* Logo / Brand header + skip button */}
        <div className='flex items-center justify-between mb-6'>
          <div />
          <h1 className='text-lg font-black tracking-tight'>
            <span className='text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400'>
              FITT
            </span>
            <span className='text-transparent bg-clip-text bg-linear-to-r from-amber-300 to-orange-400'>
              WIZ
            </span>
          </h1>
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={onSkip}
              className='text-slate-500 hover:text-slate-300 transition-colors p-1'
              title='Saltar onboarding'
            >
              <X size={20} />
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Progress bar */}
        {step < TOTAL_STEPS - 1 && renderProgressBar()}

        {/* Step content */}
        {renderCurrentStep()}

        {/* Navigation buttons (not shown on generation step) */}
        {step < TOTAL_STEPS - 1 && (
          <div className='flex gap-3 mt-8'>
            {step > 0 && (
              <button
                onClick={handleBack}
                className='px-4 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-1'
              >
                <ChevronLeft size={16} /> Atrás
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95 ${
                canProceed()
                  ? step === TOTAL_STEPS - 2
                    ? "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-purple-900/40"
                    : "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/30"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              {step === TOTAL_STEPS - 2 ? (
                <>
                  <Sparkles size={18} /> Crear mi rutina con IA
                </>
              ) : (
                <>
                  Siguiente <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step counter */}
        {step < TOTAL_STEPS - 1 && (
          <p className='text-center text-[11px] text-slate-600 mt-4'>
            Paso {step + 1} de {TOTAL_STEPS - 1}
          </p>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
