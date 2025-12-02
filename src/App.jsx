import React, { useState } from 'react';
import { Activity, Cloud, BarChart2, AlertCircle, Clock, CheckCircle, Circle, Info, ChevronDown, RotateCcw, Pause, Play, Flame, Zap, Dumbbell, Loader, Utensils, X, User } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useWorkoutLogs } from './hooks/useWorkoutLogs';
import { useTimer } from './hooks/useTimer';
import { useRoutines } from './hooks/useRoutines';
import ExerciseIcon from './components/icons/ExerciseIcons';
import RoutineEditor from './components/routines/RoutineEditor';
import { Edit } from 'lucide-react';
import ExerciseTracker from './components/tracker/ExerciseTracker';
import GlobalStats from './components/stats/GlobalStats';
import NutritionDashboard from './components/nutrition/NutritionDashboard';
import ProfileEditor from './components/profile/ProfileEditor';

export default function App() {
  const [activeTab, setActiveTab] = useState('day1');
  const [showStats, setShowStats] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);
  const [completedExercises, setCompletedExercises] = useState({});
  const [expandedExercise, setExpandedExercise] = useState(null);
  
  // Custom Hooks
  const { user, authError } = useAuth();
  const { workoutLogs, saveLog, deleteLog, dbError, streak } = useWorkoutLogs(user);
  const { timer, isTimerRunning, resetTimer, toggleTimer } = useTimer(60);
  const { routines, loading: routinesLoading, saveRoutine, shareRoutine, importSharedRoutine } = useRoutines(user);

  // Verificar si hay una rutina compartida en la URL al cargar
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('shareId');
    
    if (shareId && user && !routinesLoading) {
      // Preguntar al usuario si quiere importar
      if (window.confirm("¿Quieres importar esta rutina compartida a tu colección?")) {
        // Por defecto, importamos en el tab activo o creamos uno nuevo si pudiéramos (por ahora sobrescribe el activo o usa uno libre)
        // Simplificación: Importar en el tab activo
        importSharedRoutine(shareId, activeTab).then(success => {
          if (success) {
            alert("¡Rutina importada con éxito!");
            // Limpiar URL
            window.history.replaceState({}, document.title, "/");
          } else {
            alert("Error al importar la rutina. Verifica que el enlace sea correcto.");
          }
        });
      }
    }
  }, [user, routinesLoading, activeTab]);

  const handleSaveRoutine = async (updatedRoutine) => {
    const success = await saveRoutine(activeTab, updatedRoutine);
    if (success) {
      setShowRoutineEditor(false);
    }
  };

  const handleShareRoutine = async (routineToShare) => {
    return await shareRoutine(activeTab, routineToShare);
  };

  const toggleComplete = (day, exerciseName) => { 
    const key = `${day}-${exerciseName}`; 
    setCompletedExercises(prev => ({...prev, [key]: !prev[key]})); 
  };

  if (routinesLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500"><Loader className="animate-spin" size={32} /></div>;
  }

  // Asegurar que activeTab sea válido con las rutinas cargadas
  const currentRoutine = routines[activeTab] || Object.values(routines)[0];
  // Si activeTab no existe en las nuevas rutinas, cambiarlo al primero disponible
  if (!routines[activeTab] && Object.keys(routines).length > 0) {
    setActiveTab(Object.keys(routines)[0]);
  }

  // TEST DATA GENERATOR
  const generateTestData = async () => {
    if (!user) return;
    const days = ['day1', 'day2', 'day3', 'day4', 'day5'];
    const now = new Date();
    
    alert("Generando datos... espera unos segundos.");
    
    for (let i = 0; i < days.length; i++) {
      const dayKey = days[i];
      const dayRoutine = routines[dayKey] || routineData[dayKey]; // Support both custom and default
      if (!dayRoutine) continue;

      // Fake date: today minus (5 - i) days
      const date = new Date(now);
      date.setDate(date.getDate() - (5 - i));
      const dateStr = date.toISOString();

      for (const block of dayRoutine.blocks) {
        for (const exercise of block.exercises) {
          // Log 3 sets per exercise
          await saveLog({
            exercise: exercise.name,
            weight: 20, // Dummy weight
            reps: 10,   // Dummy reps
            sets: 3,
            rpe: 8,
            date: dateStr
          });
        }
      }
    }
    alert("Datos generados! Abre las estadísticas.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      {showStats && <GlobalStats logs={workoutLogs} onClose={() => setShowStats(false)} />}
      {showNutrition && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Utensils size={20} className="text-green-400"/> Nutrición</h2>
            <button onClick={() => setShowNutrition(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <NutritionDashboard user={user} />
          </div>
        </div>
      )}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950 animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><User size={20} className="text-blue-400"/> Perfil de Atleta</h2>
            <button onClick={() => setShowProfile(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProfileEditor user={user} onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
      {showRoutineEditor && <RoutineEditor initialData={currentRoutine} onSave={handleSaveRoutine} onCancel={() => setShowRoutineEditor(false)} onShare={handleShareRoutine} />}
      
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2"><Activity size={22} className="text-blue-400" />FitManual <span className="text-xs bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded border border-blue-800">Cloud</span></h1>
          {streak > 0 && (
            <div className="flex items-center gap-1 mt-1 animate-in slide-in-from-left-2">
              <Flame size={12} className="text-orange-500 fill-orange-500/20" />
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">{streak} Días Racha</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={generateTestData} className="text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-800">TEST DATA</button>
          <div className="flex items-center gap-1">{(dbError || authError) && <AlertCircle size={16} className="text-red-500" />}<Cloud size={16} className={user ? "text-green-400" : "text-slate-600"} /></div>
          <button onClick={() => setShowProfile(true)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"><User size={18} /></button>
          <button onClick={() => setShowNutrition(true)} className="p-2 bg-slate-800 rounded-full text-green-400 hover:bg-slate-700 border border-slate-700 transition-colors"><Utensils size={18} /></button>
          <button onClick={() => setShowStats(true)} className="p-2 bg-slate-800 rounded-full text-blue-400 hover:bg-slate-700 border border-slate-700 transition-colors"><BarChart2 size={18} /></button>
        </div>
      </header>

      <main className="p-4 relative z-10">
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar snap-x">
          {Object.keys(routines).map((day) => (
            <button key={day} onClick={() => setActiveTab(day)} className={`flex-shrink-0 snap-start px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${activeTab === day ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>{routines[day].title.split(':')[0]}</button>
          ))}
        </div>
        <div className={`p-5 rounded-2xl border mb-6 ${currentRoutine.bg} ${currentRoutine.border} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10"><Dumbbell size={80} /></div>
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-2xl font-bold text-white">{currentRoutine.title}</h2>
            <button onClick={() => setShowRoutineEditor(true)} className="p-2 bg-slate-900/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><Edit size={16} /></button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-4"><Activity size={14} /><span>{currentRoutine.focus}</span></div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${currentRoutine.mode === 'heavy' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-green-500/20 border-green-500/50 text-green-400'}`}>{currentRoutine.mode === 'heavy' ? <Flame size={14} /> : <Zap size={14} />}{currentRoutine.weight}</div>
        </div>

        <div className="space-y-4">
          {currentRoutine.blocks.map((block) => (
            <div key={block.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800/50 px-4 py-3 flex justify-between items-center border-b border-slate-800">
                <span className="text-sm font-bold text-slate-400 tracking-wider">BLOQUE {block.id} (SUPERSERIE)</span>
                <button onClick={() => resetTimer(block.rest)} className="group flex items-center gap-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-700 hover:border-blue-500"><Clock size={14} /><span>DESCANSAR {block.rest}s</span></button>
              </div>
              <div className="divide-y divide-slate-800">
                {block.exercises.map((ex, i) => {
                  const isCompleted = completedExercises[`${activeTab}-${ex.name}`];
                  const isExpanded = expandedExercise === ex.name;
                  return (
                    <div key={i} className={`transition-colors duration-300 ${isCompleted ? 'bg-slate-900/50 opacity-50' : 'bg-transparent'}`}>
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          <button onClick={(e) => { e.stopPropagation(); toggleComplete(activeTab, ex.name); }} className={`shrink-0 transition-all duration-200 ${isCompleted ? 'text-green-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>{isCompleted ? <CheckCircle size={28} fill="rgba(34, 197, 94, 0.2)" /> : <Circle size={28} />}</button>
                          <div className="flex-1 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : ex.name)}>
                            <div className="flex justify-between items-start">
                              <div><h3 className={`font-bold text-base ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{ex.name}</h3><p className="text-sm text-blue-400 font-mono mt-0.5">{ex.reps}</p></div>
                              <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-slate-600" /></div>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-4 pl-11 animate-in slide-in-from-top-2 duration-200">
                            <div className="w-full h-48 bg-slate-800 rounded-xl border border-slate-700 mb-3 overflow-hidden relative group flex items-center justify-center p-2"><ExerciseIcon type={ex.svg} /><div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" /></div>
                            <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-900/30 p-3 rounded-lg mb-3"><Info size={18} className="text-blue-400 shrink-0 mt-0.5" /><p className="text-sm text-slate-300 leading-relaxed">{ex.note}</p></div>
                            <ExerciseTracker 
                              exerciseName={ex.name} 
                              onSave={saveLog} 
                              onDelete={deleteLog} 
                              history={workoutLogs[ex.name] || []}
                              onTimerReset={resetTimer}
                              restTime={block.rest}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="h-20" />
      </main>

      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 ${isTimerRunning || timer < 60 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-md mx-auto flex items-center justify-between px-2">
          <div className="flex flex-col"><span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Descanso Restante</span><span className={`text-4xl font-mono font-bold tracking-tighter ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timer}<span className="text-lg text-slate-600">s</span></span></div>
          <div className="flex items-center gap-3">
             <button onClick={() => resetTimer(60)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"><RotateCcw size={20} /></button>
            <button onClick={toggleTimer} className={`w-14 h-14 flex items-center justify-center rounded-full text-white shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 ${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-500'}`}>{isTimerRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
