import React from "react";
import type { RoutineData } from "../../types";

interface RoutineTabsProps {
  routines: RoutineData;
  activeTab: string;
  onTabChange: (day: string) => void;
}

const RoutineTabs: React.FC<RoutineTabsProps> = ({ routines, activeTab, onTabChange }) => {
  return (
    <nav
      className='flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar snap-x'
      aria-label='Seleccionar día de rutina'
    >
      {Object.entries(routines)
        .sort(
          ([, a], [, b]) =>
            (a.dayNumber || 0) - (b.dayNumber || 0) || a.title.localeCompare(b.title),
        )
        .map(([day, routine]) => {
          // Determine label: Use dayNumber if available, or fallback to parsing title
          let label = `Día ${routine.dayNumber}`;
          if (!routine.dayNumber) {
            const splitTitle = routine.title.split(/[:\-]/)[0].trim();
            label = splitTitle.length < 10 ? splitTitle : "Rutina";
          }

          // Legacy support for "day1", "day2" keys if no dayNumber
          if (!routine.dayNumber && day.startsWith("day")) {
            label = `Día ${day.replace("day", "")}`;
          }

          return (
            <button
              key={day}
              onClick={() => onTabChange(day)}
              className={`flex-shrink-0 snap-start px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeTab === day
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-105"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
              aria-current={activeTab === day ? "true" : undefined}
            >
              {label}
            </button>
          );
        })}
    </nav>
  );
};

export default RoutineTabs;
