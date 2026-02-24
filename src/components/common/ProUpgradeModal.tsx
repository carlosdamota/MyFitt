import React, { useState } from "react";
import {
  Sparkles,
  Crown,
  X,
  Check,
  Zap,
  BarChart3,
  ChefHat,
  Loader,
  CreditCard,
} from "lucide-react";
import { createCheckoutSession } from "../../api/billing";
import { auth } from "../../config/firebase";
import { getIdToken } from "firebase/auth";
import { Button } from "../ui/Button";
import { useScrollLock } from "../../hooks/useScrollLock";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  feature?: string;
  context?:
    | "nutrition_photo"
    | "routine_generation"
    | "unlimited_usage"
    | "stats"
    | "ai_coach"
    | "general";
}

const PRO_BENEFITS = [
  {
    icon: Sparkles,
    title: "IA Ilimitada",
    description: "Chat con Coach y Análisis Nutricional sin restricciones",
  },
  {
    icon: ChefHat,
    title: "Foto a Macro (500/mes)",
    description: "Registra tus comidas al instante con una foto",
  },
  {
    icon: Zap,
    title: "Rutinas Pro (20/mes)",
    description: "Genera 20 programas mensuales de hasta 6 días",
  },
];

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  title = "Desbloquea FITTWIZ Pro",
  description = "Accede a todas las funciones premium y lleva tu entrenamiento al siguiente nivel.",
  feature,
  context = "general",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    const user = auth?.currentUser;
    if (!user) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getIdToken(user, true);
      const origin = window.location.origin;
      const url = await createCheckoutSession(origin, origin, "OmyEug7I");
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar el pago");
      setLoading(false);
    }
  };

  const getContextualMessage = () => {
    switch (context) {
      case "nutrition_photo":
        return {
          title: "Foto a Macro es exclusivo Pro",
          description: "Sube hasta 500 fotos al mes para calcular macros automáticamente.",
        };
      case "routine_generation":
        return {
          title: "Generación de rutinas Pro",
          description: "Crea rutinas de hasta 6 días y 20 programas nuevos cada mes.",
        };
      case "unlimited_usage":
        return {
          title: "Elimina los límites",
          description: "Disfruta de Coach y Análisis Nutricional ilimitados.",
        };
      case "stats":
        return {
          title: "Estadísticas avanzadas",
          description: "Gráficos detallados de volumen, fuerza y evolución.",
        };
      case "ai_coach":
        return {
          title: "Tu Coach AI Personal",
          description: "Chat ilimitado para análisis de progreso y recomendaciones.",
        };
      default:
        return { title: title, description: description };
    }
  };

  const contextualContent = getContextualMessage();

  return (
    <div
      className='fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-surface-950/95 backdrop-blur-sm animate-in fade-in duration-200 transition-colors'
      role='dialog'
      aria-modal='true'
      onClick={onClose}
    >
      <div
        className='bg-white dark:bg-surface-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-surface-800 shadow-xl dark:shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className='relative bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 p-6 text-center'>
          <button
            onClick={onClose}
            className='absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors'
            aria-label='Cerrar'
          >
            <X size={18} />
          </button>

          <div className='flex justify-center mb-4'>
            <div className='p-4 bg-white/15 rounded-2xl backdrop-blur-sm'>
              <Crown
                size={40}
                className='text-amber-300'
              />
            </div>
          </div>

          <h2 className='text-2xl font-black text-white mb-2'>{contextualContent.title}</h2>
          <p className='text-blue-100 text-sm font-medium'>{contextualContent.description}</p>
        </div>

        {/* Benefits */}
        <div className='p-6 space-y-4'>
          {PRO_BENEFITS.map((benefit, index) => (
            <div
              key={index}
              className='flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-800/50 border border-slate-200 dark:border-surface-700/50 transition-colors'
            >
              <div className='p-2 bg-blue-50 dark:bg-blue-500/20 rounded-lg shrink-0 transition-colors'>
                <benefit.icon
                  size={18}
                  className='text-blue-600 dark:text-blue-400 transition-colors'
                />
              </div>
              <div>
                <p className='text-sm font-bold text-slate-900 dark:text-white transition-colors'>
                  {benefit.title}
                </p>
                <p className='text-xs text-slate-600 dark:text-slate-400 transition-colors'>
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className='px-6 pb-6'>
          <div className='text-center mb-4'>
            <span className='text-4xl font-black text-slate-900 dark:text-white transition-colors'>
              2,99€
            </span>
            <span className='text-slate-500 dark:text-slate-400 text-sm ml-2 transition-colors'>
              /mes
            </span>
          </div>

          {error && (
            <p className='text-red-600 dark:text-red-400 text-sm text-center mb-3 transition-colors'>
              {error}
            </p>
          )}

          <Button
            variant='primary'
            size='lg'
            onClick={handleUpgrade}
            disabled={loading}
            className='w-full shadow-lg shadow-primary-900/30'
            leftIcon={
              loading ? (
                <Loader
                  size={20}
                  className='animate-spin'
                />
              ) : (
                <CreditCard size={20} />
              )
            }
          >
            {loading ? "Redirigiendo..." : "Desbloquear Pro Ahora"}
          </Button>

          <p className='text-center text-xs text-slate-500 mt-3'>
            Cancela cuando quieras. Sin compromisos.
          </p>
        </div>

        {/* Trust badges */}
        <div className='px-6 pb-12 flex justify-center gap-6 text-xs text-slate-500 bg-white dark:bg-surface-900 transition-colors'>
          <span className='flex items-center gap-1'>
            <Check
              size={14}
              className='text-green-600 dark:text-green-400 transition-colors'
            />
            Pago seguro
          </span>
          <span className='flex items-center gap-1'>
            <Check
              size={14}
              className='text-green-600 dark:text-green-400 transition-colors'
            />
            Cancelable
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProUpgradeModal;
