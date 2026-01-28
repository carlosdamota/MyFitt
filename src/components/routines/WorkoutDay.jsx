import React, { useState } from "react";
import {
  Activity,
  Dumbbell,
  Flame,
  Zap,
  Clock,
  CheckCircle,
  Circle,
  ChevronDown,
  Info,
  Edit,
  Shield,
  Smile,
} from "lucide-react";
import ExerciseIcon from "../icons/ExerciseIcons";
import ExerciseTracker from "../tracker/ExerciseTracker";

/**
 * Displays a single workout day with routine info and exercise blocks.
 * @param {object} props
 * @param {object} props.routine - The routine data for this day.
 * @param {string} props.dayKey - The key for this day (e.g., 'day1').
 * @param {object} props.completedExercises - Map of completed exercises.
 * @param {function} props.onToggleComplete - Callback to toggle exercise completion.
 * @param {function} props.onEditRoutine - Callback to open routine editor.
 * @param {function} props.onResetTimer - Callback to reset the rest timer.
 * @param {function} props.onSaveLog - Callback to save a workout log.
 * @param {function} props.onDeleteLog - Callback to delete a workout log.
 * @param {object} props.workoutLogs - Map of workout logs by exercise name.
 * @param {object} props.user - Current user object.
 */
const WorkoutDay = ({
  routine,
  dayKey,
  completedExercises,
  onToggleComplete,
  onEditRoutine,
  onResetTimer,
  onSaveLog,
  onDeleteLog,
  workoutLogs,
  user,
}) => {
  const [expandedExercise, setExpandedExercise] = useState(null);

  return (
    <>
      {/* Routine Header Card */}
      <div
        className={`p-5 rounded-2xl border mb-6 ${routine.bg} ${routine.border} relative overflow-hidden`}
      >
        <div className='absolute top-0 right-0 p-4 opacity-10'>
          <Dumbbell size={80} />
        </div>
        <div className='flex justify-between items-start mb-1'>
          <h2 className='text-2xl font-bold text-white'>{routine.title}</h2>
          <button
            onClick={onEditRoutine}
            className='p-2 bg-slate-900/50 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors'
            aria-label='Editar rutina'
          >
            <Edit size={16} />
          </button>
        </div>
        <div className='flex items-center gap-2 text-sm text-slate-300 mb-4'>
          <Activity size={14} />
          <span>{routine.focus}</span>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${
            routine.mode === "heavy"
              ? "bg-red-500/20 border-red-500/50 text-red-400"
              : "bg-green-500/20 border-green-500/50 text-green-400"
          }`}
        >
          {routine.mode === "heavy" ? <Flame size={14} /> : <Zap size={14} />}
          {routine.weight}
        </div>
      </div>

      {/* Warmup Section */}
      {routine.warmup && (
        <div className='bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-6 flex items-start gap-4'>
          <div className='p-2 bg-blue-500/10 rounded-xl text-blue-400'>
            <Flame size={20} />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-1'>
              Calentamiento
            </h3>
            <p className='text-slate-300 text-sm leading-relaxed'>{routine.warmup.text}</p>
          </div>
        </div>
      )}

      {/* Exercise Blocks */}
      <div className='space-y-4'>
        {routine.blocks.map((block) => (
          <div
            key={block.id}
            className='bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'
          >
            <div className='bg-slate-800/50 px-4 py-3 flex justify-between items-center border-b border-slate-800'>
              <span className='text-sm font-bold text-slate-400 tracking-wider'>
                BLOQUE {block.id} (SUPERSERIE)
              </span>
              <button
                onClick={() => onResetTimer(block.rest)}
                className='group flex items-center gap-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-700 hover:border-blue-500'
                aria-label={`Descansar ${block.rest} segundos`}
              >
                <Clock size={14} />
                <span>DESCANSAR {block.rest}s</span>
              </button>
            </div>
            <div className='divide-y divide-slate-800'>
              {block.exercises.map((ex, i) => {
                const exerciseKey = `${dayKey}-${ex.name}`;
                const isCompleted = completedExercises[exerciseKey];
                const isExpanded = expandedExercise === ex.name;

                return (
                  <div
                    key={i}
                    className={`transition-colors duration-300 ${isCompleted ? "bg-slate-900/50 opacity-50" : "bg-transparent"}`}
                  >
                    <div className='p-4'>
                      <div className='flex items-center gap-4'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(dayKey, ex.name);
                          }}
                          className={`shrink-0 transition-all duration-200 ${isCompleted ? "text-green-500 scale-110" : "text-slate-600 hover:text-slate-400"}`}
                          aria-label={
                            isCompleted
                              ? `Marcar ${ex.name} como no completado`
                              : `Marcar ${ex.name} como completado`
                          }
                        >
                          {isCompleted ? (
                            <CheckCircle
                              size={28}
                              fill='rgba(34, 197, 94, 0.2)'
                            />
                          ) : (
                            <Circle size={28} />
                          )}
                        </button>
                        <div
                          className='flex-1 cursor-pointer'
                          onClick={() => setExpandedExercise(isExpanded ? null : ex.name)}
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <h3
                                className={`font-bold text-base ${isCompleted ? "text-slate-500 line-through" : "text-slate-200"}`}
                              >
                                {ex.name}
                              </h3>
                              <p className='text-sm text-blue-400 font-mono mt-0.5'>{ex.reps}</p>
                            </div>
                            <div
                              className={`transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <ChevronDown
                                size={20}
                                className='text-slate-600'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className='mt-4 pl-11 animate-in slide-in-from-top-2 duration-200'>
                          <div className='w-full h-48 bg-slate-800 rounded-xl border border-slate-700 mb-3 overflow-hidden relative group flex items-center justify-center p-2'>
                            <ExerciseIcon type={ex.svg} />
                            <div className='absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none' />
                          </div>
                          <div className='flex items-start gap-3 bg-blue-900/20 border border-blue-900/30 p-3 rounded-lg mb-3'>
                            <Info
                              size={18}
                              className='text-blue-400 shrink-0 mt-0.5'
                            />
                            <p className='text-sm text-slate-300 leading-relaxed'>{ex.note}</p>
                          </div>
                          <ExerciseTracker
                            exerciseName={ex.name}
                            onSave={onSaveLog}
                            onDelete={onDeleteLog}
                            history={workoutLogs[ex.name] || []}
                            onTimerReset={onResetTimer}
                            restTime={block.rest}
                            user={user}
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

      {/* Cooldown Section */}
      {routine.cooldown && (
        <div className='bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mt-8 flex items-start gap-4'>
          <div className='p-2 bg-green-500/10 rounded-xl text-green-400'>
            <Shield size={20} />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-1'>
              Vuelta a la Calma
            </h3>
            <p className='text-slate-300 text-sm leading-relaxed'>{routine.cooldown.text}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutDay;
