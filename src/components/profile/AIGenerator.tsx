import React, { useState, useEffect } from "react";
import { Zap, Loader, Check, Dumbbell } from "lucide-react";
import { generateFullProgram } from "../../api/gemini";
import { logEvent } from "../../utils/analytics";
import RateLimitError from "../errors/RateLimitError";
import type { ProfileFormData } from "../../types";
import type { User as FirebaseUser } from "firebase/auth";
import { AiError } from "../../api/ai";
import { useEntitlement } from "../../hooks/useEntitlement";

// Motivational phrases for loading state
const MOTIVATIONAL_PHRASES = [
  "Preparando tu entrenamiento personalizado... 💪",
  "Analizando tu perfil de atleta...",
  "Los campeones se forjan en el gimnasio 🏆",
  "Diseñando ejercicios perfectos para ti...",
  "El dolor de hoy es la fuerza del mañana 🔥",
  "Calculando las mejores series y repeticiones...",
  "Cada repetición cuenta, cada día suma 📈",
  "Optimizando tu programa de entrenamiento...",
  "Tu mejor versión está a punto de nacer ⭐",
  "La constancia vence al talento",
  "Generando tu rutina con inteligencia artificial...",
  "No hay atajos hacia ningún lugar que valga la pena ir 🎯",
  "Personalizando ejercicios para tus objetivos...",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día",
];

interface AIGeneratorProps {
  user: FirebaseUser | null;
  formData: ProfileFormData;
  saveProfile: (data: any) => Promise<boolean>;
  createRoutine: (title: string, routine: any) => Promise<string | null>;
  isSaving: boolean;
  onSuccess: () => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
  savedSuccess: boolean;
  handleSubmit: (e: any) => Promise<void>;
  onRequireAuth?: () => void;
  onUpgrade?: () => void;
  showSaveButton?: boolean;
  isPro?: boolean;
}

const equipmentLabels: Record<string, string> = {
  gym_full: "Gimnasio completo",
  home_gym: "Home gym (Barra + jaula)",
  dumbbells_only: "Solo mancuernas",
  bodyweight: "Peso corporal",
  barbell_plates: "Barra y discos",
  pullup_bar: "Barra de dominadas",
  resistance_bands: "Bandas elásticas",
  bench: "Banco",
  kettlebells: "Kettlebells",
};

const formatEquipment = (equipment: ProfileFormData["equipment"]): string => {
  if (!equipment || equipment.length === 0) return "Peso corporal";
  return equipment.map((value) => equipmentLabels[value] ?? value).join(", ");
};

const AIGenerator: React.FC<AIGeneratorProps> = ({
  user,
  formData,
  saveProfile,
  createRoutine,
  isSaving,
  onSuccess,
  isGenerating,
  setIsGenerating,
  savedSuccess,
  handleSubmit,
  onRequireAuth,
  onUpgrade,
  showSaveButton = true,
  isPro,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [showRateLimitError, setShowRateLimitError] = useState<boolean>(false);
  const [genSuccess, setGenSuccess] = useState<boolean>(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaMessage, setQuotaMessage] = useState<string>("Límite de IA alcanzado");
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const { plan } = useEntitlement(user);

  // Determine effective status
  const effectiveIsPro = isPro !== undefined ? isPro : plan === "pro";
  const isFree = !effectiveIsPro;

  // Rotate motivational phrases every 3 seconds during generation
  useEffect(() => {
    if (!isGenerating) {
      setCurrentPhraseIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const confirmGeneration = async (): Promise<void> => {
    if (!formData) return;
    setShowConfirmModal(false);

    if (!user) {
      onRequireAuth?.();
      return;
    }

    // Primero guardar el perfil con los datos actuales
    await saveProfile(formData);

    setIsGenerating(true);
    setGenSuccess(false);
    setQuotaMessage("Límite de IA alcanzado");
    setQuotaResetAt(null);
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
        equipment: formatEquipment(formData.equipment),
        injuries: formData.injuries,
        trainingSplit: formData.trainingSplit,
        focusAreas: formData.focusAreas,
        dailyTimeMinutes:
          typeof formData.dailyTimeMinutes === "string"
            ? parseInt(formData.dailyTimeMinutes)
            : formData.dailyTimeMinutes || 60,
        availableDays: daysToGenerate,
        dayNumber: 1,
        totalDays: daysToGenerate,
      });

      const programId = `prog_${Date.now()}`;

      // Save each day
      for (let i = 0; i < program.days.length; i++) {
        const dayRoutine = program.days[i];
        setGenerationProgress(`Guardando día ${i + 1}: ${dayRoutine.title}...`);

        // Extract focus from title if it contains "Día X:" pattern
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

      setGenSuccess(true);
      setGenerationProgress("¡Plan Completado!");
      logEvent("Routine", "Generated Program", `${daysToGenerate} days`);

      setTimeout(() => {
        setGenSuccess(false);
        onSuccess();
      }, 1500);
    } catch (error) {
      if (error instanceof AiError && error.code === "quota_exceeded") {
        setQuotaMessage(error.message);
        setQuotaResetAt(error.resetAt ?? null);
        setShowRateLimitError(true);
      } else if (error instanceof AiError && error.code === "auth_required") {
        onRequireAuth?.();
      } else {
        console.error(error);
        alert("Error generando rutina: " + (error as Error).message);
      }
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      {/* Rate Limit Error Modal */}
      {showRateLimitError && (
        <RateLimitError
          message={quotaMessage}
          resetAt={quotaResetAt}
          onClose={() => setShowRateLimitError(false)}
          onUpgrade={onUpgrade}
          upgradeContext='routine_generation'
          isPro={effectiveIsPro}
        />
      )}

      {/* Fullscreen Loading Modal with Motivational Phrases */}
      {isGenerating && (
        <div className='fixed inset-0 z-100 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300'>
          <div className='flex flex-col items-center max-w-md text-center'>
            {/* Animated Icon */}
            <div className='relative mb-8'>
              <div className='w-24 h-24 rounded-full bg-linear-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center'>
                <Dumbbell
                  size={40}
                  className='text-blue-400 animate-pulse'
                />
              </div>
              <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin' />
            </div>

            {/* Motivational Phrase */}
            <p className='text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400 mb-4 min-h-12 transition-all duration-500 ease-in-out'>
              {MOTIVATIONAL_PHRASES[currentPhraseIndex]}
            </p>

            {/* Progress Info */}
            <p className='text-sm text-slate-400 mb-6'>
              {generationProgress || "Iniciando generación..."}
            </p>

            {/* Progress Bar */}
            <div className='w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden'>
              <div
                className='h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full animate-pulse'
                style={{ width: "100%" }}
              />
            </div>

            {/* Tip */}
            <p className='text-xs text-slate-500 mt-6'>
              La IA está creando un programa único para ti. Esto puede tardar hasta 30 segundos.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300'>
          <div className='bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 duration-200 shadow-2xl'>
            <div className='flex items-start gap-3 mb-4'>
              <div className='p-2 bg-blue-600/20 rounded-lg'>
                <Zap
                  size={24}
                  className='text-blue-400'
                />
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-bold text-white mb-1'>Generar Programa con IA</h3>
                <p className='text-sm text-slate-400'>
                  Esto creará {formData.availableDays} rutinas personalizadas basadas en tu perfil.
                </p>
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
                className='flex-1 py-2.5 rounded-xl font-bold text-sm bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg transition-all active:scale-95'
              >
                Generar
              </button>
            </div>

            {isGenerating && (
              <div className='mt-4 text-center'>
                <div className='flex items-center justify-center gap-2 text-blue-400 mb-2 font-bold text-xs'>
                  <Loader
                    size={16}
                    className='animate-spin'
                  />
                  <span>{generationProgress}</span>
                </div>
                <div className='h-1.5 bg-slate-800 rounded-full overflow-hidden'>
                  <div className='h-full bg-blue-500 animate-pulse w-full'></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3'>
        {showSaveButton && (
          <button
            onClick={handleSubmit}
            disabled={isSaving || isGenerating}
            className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
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
        )}

        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isGenerating || isSaving}
          className={`bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all transform active:scale-95 ${
            showSaveButton ? "flex-1" : "w-full"
          }`}
        >
          {isGenerating ? (
            <Loader
              size={18}
              className='animate-spin'
            />
          ) : genSuccess ? (
            <Check size={18} />
          ) : (
            <>
              <Zap size={18} /> Generar Rutina IA
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default AIGenerator;
