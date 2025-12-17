import React from 'react';

/**
 * Horizontal scrollable tabs for selecting workout routines.
 * @param {object} props
 * @param {object} props.routines - Object containing all routines keyed by day.
 * @param {string} props.activeTab - Currently selected tab key.
 * @param {function} props.onTabChange - Callback when a tab is selected.
 */
const RoutineTabs = ({ routines, activeTab, onTabChange }) => {
  return (
    <nav className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar snap-x" aria-label="Seleccionar día de rutina">
      {Object.keys(routines).map((day) => (
        <button
          key={day}
          onClick={() => onTabChange(day)}
          className={`flex-shrink-0 snap-start px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
            activeTab === day
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transform scale-105'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
          }`}
          aria-current={activeTab === day ? 'true' : undefined}
          aria-label={`Día ${routines[day].title.split(':')[0]}`}
        >
          {routines[day].title.split(':')[0]}
        </button>
      ))}
    </nav>
  );
};

export default RoutineTabs;
