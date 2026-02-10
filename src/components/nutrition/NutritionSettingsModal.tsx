import React, { ChangeEvent } from "react";
import { X, Utensils, Check, Loader } from "lucide-react";
import type { ProfileFormData } from "../../types";
import { useProfile } from "../../hooks/useProfile";
import type { User } from "firebase/auth";

interface NutritionSettingsModalProps {
  user: User | null;
  onClose: () => void;
}

const NutritionSettingsModal: React.FC<NutritionSettingsModalProps> = ({ user, onClose }) => {
  const { profile, saveProfile } = useProfile(user);
  const [formData, setFormData] = React.useState<ProfileFormData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setFormData(profile as ProfileFormData);
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    await saveProfile(formData);
    setIsSaving(false);
    onClose();
  };

  if (!formData) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50'>
          <h3 className='font-bold text-white flex items-center gap-2'>
            <Utensils
              size={18}
              className='text-blue-400'
            />{" "}
            Configuración Nutricional
          </h3>
          <button
            onClick={onClose}
            className='p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className='p-5 space-y-4'>
          <div>
            <label className='text-xs font-bold text-slate-400 uppercase mb-2 block'>
              Tipo de Dieta
            </label>
            <div className='relative'>
              <select
                value={formData.dietType || "balanced"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleChange("dietType", e.target.value)
                }
                className='w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none appearance-none'
              >
                <option value='balanced'>Equilibrada (Estándar)</option>
                <option value='high_protein'>Alta en Proteína</option>
                <option value='keto'>Keto (Cetogénica)</option>
                <option value='paleo'>Paleo</option>
                <option value='low_carb'>Baja en Carbohidratos</option>
              </select>
              <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500'>
                <svg
                  width='10'
                  height='6'
                  viewBox='0 0 10 6'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M1 1L5 5L9 1'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>
            <p className='text-[11px] text-slate-500 mt-2'>
              Esto ajustará automáticamente tus objetivos de macronutrientes (proteínas, grasas y
              carbohidratos).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors'
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isSaving ? (
              <>
                <Loader
                  size={16}
                  className='animate-spin'
                />{" "}
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionSettingsModal;
