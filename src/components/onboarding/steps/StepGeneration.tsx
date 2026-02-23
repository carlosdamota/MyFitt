import React from "react";
import { Dumbbell, Check, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../ui/Button";
import { ProfileFormData } from "../../../types";
import { MOTIVATIONAL_PHRASES } from "../constants";

interface StepGenerationProps {
  formData: ProfileFormData;
  isGenerating: boolean;
  generationComplete: boolean;
  generationError: string | null;
  generationProgress: string;
  phraseIndex: number;
  handleGenerate: () => void;
  onComplete: () => void;
}

export const StepGeneration: React.FC<StepGenerationProps> = ({
  formData,
  isGenerating,
  generationComplete,
  generationError,
  generationProgress,
  phraseIndex,
  handleGenerate,
  onComplete,
}) => {
  return (
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

          <div className='w-full max-w-xs h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden transition-colors'>
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

          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
            ¡Tu plan está listo! 🎉
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm'>
            Hemos creado {formData.availableDays} rutinas personalizadas basadas en tu perfil. ¡Es
            hora de entrenar!
          </p>

          <Button
            size='lg'
            onClick={onComplete}
            className='px-8 py-4 rounded-2xl font-bold text-sm w-full mx-auto max-w-sm flex items-center justify-center gap-2'
            rightIcon={<ArrowRight size={18} />}
          >
            Empezar a entrenar
          </Button>
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

          <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
            Perfil guardado
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-sm'>
            {generationError}
          </p>
          <p className='text-xs text-slate-500 mb-8'>
            Puedes generar tu primera rutina desde el Coach IA
          </p>

          <div className='flex gap-3 justify-center'>
            <Button
              variant='secondary'
              onClick={() => {
                handleGenerate();
              }}
              className='px-6 py-3 rounded-xl font-bold text-sm'
            >
              Reintentar
            </Button>
            <Button
              onClick={onComplete}
              className='px-6 py-3 rounded-xl font-bold text-sm'
            >
              Continuar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
