import React, { useState, useEffect } from 'react';
import { User, Save, Ruler, Weight, Calendar, Dumbbell, Target, AlertCircle, Check, Zap, Loader, Clock, X } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { generateRoutine } from '../../api/gemini';
import { useRoutines } from '../../hooks/useRoutines';
import { useRateLimit } from '../../hooks/useRateLimit';
import RateLimitError from '../errors/RateLimitError';
import { logEvent } from '../../utils/analytics';

const ProfileEditor = ({ user, onClose }) => {
  const { profile, loading, saveProfile } = useProfile(user);
  const { saveRoutine } = useRoutines(user);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [showRateLimitError, setShowRateLimitError] = useState(false);
  
  // Rate limiting: 5 generaciones de rutinas por día
  const rateLimitRoutine = useRateLimit(user, 'generate_routine', 5);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
    setGenSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await saveProfile(formData);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleGenerateRoutine = async () => {
    if (!formData) return;
    setShowConfirmModal(true);
  };

  const confirmGeneration = async () => {
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
      const dayKeys = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6'];
      
      for (let i = 0; i < daysToGenerate; i++) {
        setGenerationProgress(`Generando día ${i + 1} de ${daysToGenerate}...`);
        const dayRoutine = await generateRoutine({ ...formData, dayNumber: i + 1, totalDays: daysToGenerate });
        if (dayRoutine) {
          await saveRoutine(dayKeys[i], dayRoutine);
        }
      }
      
      setGenSuccess(true);
      setGenerationProgress("¡Completado!");
      
      // Log analytics event
      logEvent('Routine', 'Generated', `${daysToGenerate} days`);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      alert("Error generando rutina: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !formData) return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;

  return (
    <>
      {/* Rate Limit Error Modal */}
      {showRateLimitError && (
        <RateLimitError 
          message={rateLimitRoutine.error || "Has alcanzado el límite de 5 generaciones de rutinas por día"}
          resetAt={rateLimitRoutine.resetAt}
          onClose={() => setShowRateLimitError(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Zap size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Generar Rutinas con IA</h3>
                <p className="text-sm text-slate-400">Esto creará {formData.availableDays} rutinas personalizadas basadas en tu perfil, sobrescribiendo las actuales.</p>
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-4">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Días:</span><span className="text-white font-bold">{formData.availableDays}</span></div>
                <div className="flex justify-between"><span>Tiempo/sesión:</span><span className="text-white font-bold">{formData.dailyTimeMinutes} min</span></div>
                <div className="flex justify-between"><span>Objetivo:</span><span className="text-white font-bold">{formData.goal === 'muscle_gain' ? 'Hipertrofia' : formData.goal === 'strength' ? 'Fuerza' : formData.goal === 'fat_loss' ? 'Pérdida de Grasa' : 'Resistencia'}</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmGeneration}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg transition-all"
              >
                Generar
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-xs font-bold">{generationProgress}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse w-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6 pb-20">
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><User size={16} /> Datos Personales</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Weight size={12} /> Peso (kg)</label>
            <input 
              type="number" 
              value={formData.weight} 
              onChange={(e) => handleChange('weight', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none" 
              placeholder="Ej. 75"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Ruler size={12} /> Altura (cm)</label>
            <input 
              type="number" 
              value={formData.height} 
              onChange={(e) => handleChange('height', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none" 
              placeholder="Ej. 180"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Edad</label>
            <input 
              type="number" 
              value={formData.age} 
              onChange={(e) => handleChange('age', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none" 
              placeholder="Ej. 30"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Género</label>
            <select 
              value={formData.gender} 
              onChange={(e) => handleChange('gender', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Target size={16} /> Objetivos y Contexto</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Objetivo Principal</label>
            <select 
              value={formData.goal} 
              onChange={(e) => handleChange('goal', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="muscle_gain">Ganar Músculo (Hipertrofia)</option>
              <option value="strength">Ganar Fuerza</option>
              <option value="fat_loss">Perder Grasa</option>
              <option value="endurance">Resistencia / Salud General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Nivel de Experiencia</label>
            <select 
              value={formData.experienceLevel} 
              onChange={(e) => handleChange('experienceLevel', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="beginner">Principiante (0-1 años)</option>
              <option value="intermediate">Intermedio (1-3 años)</option>
              <option value="advanced">Avanzado (3+ años)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Días Disponibles por Semana</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map(days => (
                <button 
                  key={days}
                  onClick={() => handleChange('availableDays', days)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.availableDays === days ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={12} /> Tiempo Disponible por Sesión (minutos)</label>
            <div className="flex gap-2">
              {[30, 45, 60, 75, 90].map(time => (
                <button 
                  key={time}
                  onClick={() => handleChange('dailyTimeMinutes', time)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${formData.dailyTimeMinutes === time ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><Dumbbell size={12} /> Equipamiento Disponible</label>
            <select 
              value={formData.equipment} 
              onChange={(e) => handleChange('equipment', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
            >
              <option value="gym_full">Gimnasio Completo</option>
              <option value="home_gym">Home Gym (Barra + Jaula)</option>
              <option value="dumbbells_only">Solo Mancuernas</option>
              <option value="bodyweight">Peso Corporal (Calistenia)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1"><AlertCircle size={12} /> Lesiones / Limitaciones</label>
            <textarea 
              value={formData.injuries} 
              onChange={(e) => handleChange('injuries', e.target.value)} 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none h-20 resize-none" 
              placeholder="Ej. Dolor lumbar, hombro derecho sensible..."
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleSubmit} 
          disabled={isSaving || isGenerating}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${savedSuccess ? 'bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
        >
          {isSaving ? "Guardando..." : savedSuccess ? <><Check size={18} /> Guardado</> : <><Save size={18} /> Guardar Perfil</>}
        </button>
        
        <button 
          onClick={handleGenerateRoutine} 
          disabled={isGenerating || isSaving}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
        >
          {isGenerating ? <Loader className="animate-spin" /> : <><Zap size={18} /> Generar Rutina IA</>}
        </button>
      </div>
      </div>
    </>
  );
};

export default ProfileEditor;
