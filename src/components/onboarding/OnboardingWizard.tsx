import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";
import type { User as FirebaseUser } from "firebase/auth";
import { ProfileFormData, EquipmentOption } from "../../types";
import { useProfile } from "../../hooks/useProfile";
import { useRoutines } from "../../hooks/useRoutines";
import { generateFullProgram } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import { AiError } from "../../api/ai";
import { Button } from "../ui/Button";

import { TOTAL_STEPS, formatEquipment, MOTIVATIONAL_PHRASES, FREE_MAX_DAYS } from "./constants";
import { StepPersonalData } from "./steps/StepPersonalData";
import { StepGoals } from "./steps/StepGoals";
import { StepEquipment } from "./steps/StepEquipment";
import { StepStructure } from "./steps/StepStructure";
import { StepGeneration } from "./steps/StepGeneration";

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
    dailyTimeMinutes: 45,
    equipment: ["gym_full"],
    trainingSplit: "full_body",
    focusAreas: [],
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

  const handleChange = (field: keyof ProfileFormData, value: any) => {
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
      const saved = await saveProfile(formData);
      if (!saved) throw new Error("No se pudo guardar el perfil inicial");

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
        trainingSplit: formData.trainingSplit,
        focusAreas: formData.focusAreas,
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
      const completed = await saveProfile({ ...formData, onboardingCompleted: true });
      if (!completed) throw new Error("Error guardando estado de completado");

      logEvent("Onboarding", "Completed", `${daysToGenerate} days`);
      setGenerationComplete(true);
      setGenerationProgress("¡Tu plan está listo!");
    } catch (error) {
      console.error("Onboarding generation error:", error);
      if (error instanceof AiError && error.code === "quota_exceeded") {
        setGenerationError("Límite de IA alcanzado. Tu perfil se ha guardado correctamente.");
      } else {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        setGenerationError(`Error: ${msg}. Tu perfil se ha guardado.`);
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
              ? "bg-primary-400"
              : i === step
                ? "bg-linear-to-r from-primary-400 to-indigo-400"
                : "bg-surface-800"
          }`}
        />
      ))}
    </div>
  );

  // ——————————————————
  // Render
  // ——————————————————

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepPersonalData
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 1:
        return (
          <StepGoals
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <StepEquipment
            formData={formData}
            handleChange={handleChange}
            toggleEquipment={toggleEquipment}
          />
        );
      case 3:
        return (
          <StepStructure
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 4:
        return (
          <StepGeneration
            formData={formData}
            isGenerating={isGenerating}
            generationComplete={generationComplete}
            generationError={generationError}
            generationProgress={generationProgress}
            phraseIndex={phraseIndex}
            handleGenerate={handleGenerate}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-(--bg-0) text-slate-200 font-sans selection:bg-cyan-500/30'>
      {/* Background effects */}
      <div className='fixed inset-0 z-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[110px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-warning-500/10 blur-[110px]' />
      </div>

      <div className='relative z-10 max-w-lg mx-auto px-4 py-8'>
        {/* Logo / Brand header + skip button */}
        <div className='flex items-center justify-between mb-6'>
          <div />
          <h1 className='text-lg font-black tracking-tight'>
            <span className='text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-blue-400'>
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
        {renderStep()}

        {/* Navigation buttons (not shown on generation step) */}
        {step < TOTAL_STEPS - 1 && (
          <div className='flex gap-3 mt-8'>
            {step > 0 && (
              <Button
                variant='secondary'
                onClick={handleBack}
                className='px-4 py-3.5 rounded-xl font-bold text-sm flex items-center gap-1'
                leftIcon={<ChevronLeft size={16} />}
              >
                Atrás
              </Button>
            )}

            <Button
              className='flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2'
              onClick={handleNext}
              disabled={!canProceed()}
              variant={step === TOTAL_STEPS - 2 ? "primary" : "primary"}
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
            </Button>
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
