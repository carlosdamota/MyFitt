import React from "react";
import type { Routine, RoutineData } from "../../types";
import { Button } from "../ui/Button";

interface RoutineTabsProps {
  routines: RoutineData;
  activeTab: string;
  onTabChange: (day: string) => void;
}

const RoutineTabs: React.FC<RoutineTabsProps> = ({ routines, activeTab, onTabChange }) => {
  return (
    <nav
      className='flex overflow-x-auto gap-4 mb-4 p-2 no-scrollbar snap-x'
      aria-label='Seleccionar día de rutina'
    >
      {(() => {
        // Deduplicate routines by dayNumber
        // If multiple routines exist for "Day 1", prefer the user-created one (!isDefault)
        // Standalone routines (no dayNumber) are always shown
        const uniqueRoutinesMap = new Map<string | number, { id: string; routine: Routine }>();
        const standaloneRoutines: { id: string; routine: Routine }[] = [];

        Object.entries(routines).forEach(([id, routine]) => {
          if (routine.dayNumber) {
            const existing = uniqueRoutinesMap.get(routine.dayNumber);
            if (!existing) {
              uniqueRoutinesMap.set(routine.dayNumber, { id, routine });
            } else {
              // If we already have a routine for this day, check if current one is "better"
              // Better = !isDefault (User created) vs isDefault (System)
              if (existing.routine.isDefault && !routine.isDefault) {
                uniqueRoutinesMap.set(routine.dayNumber, { id, routine });
              }
            }
          } else {
            standaloneRoutines.push({ id, routine });
          }
        });

        const sortedDays = Array.from(uniqueRoutinesMap.values()).sort(
          (a, b) => (a.routine.dayNumber || 0) - (b.routine.dayNumber || 0),
        );

        const allTabs = [...sortedDays, ...standaloneRoutines];

        return allTabs.map(({ id, routine }) => {
          // Determine label: Try to use a descriptive name from the title
          let label = `Día ${routine.dayNumber}`;

          if (routine.title) {
            // Remove "Día X: " or "Day X: " prefix to get the actual name (e.g. "Torso Global")
            const titleName = routine.title.replace(/^(Día|Day)\s*\d+[:\s-]*/i, "").trim();
            if (titleName) {
              // Truncate if too long (tabs shouldn't be huge)
              label = titleName.length > 15 ? titleName.substring(0, 15) + "..." : titleName;
              // If we have a day number, maybe prepend it briefly? e.g. "1. Torso"
              if (routine.dayNumber) {
                label = `${routine.dayNumber}. ${label}`;
              }
            }
          }

          // Visual indication if it's the active tab (or if the active tab is one of the duplicates for this day)
          // We check if the activeTab's dayNumber matches this tab's dayNumber
          const activeRoutine = routines[activeTab];
          const isActive =
            activeTab === id ||
            (activeRoutine?.dayNumber === routine.dayNumber && !!routine.dayNumber);

          return (
            <Button
              key={id}
              onClick={() => onTabChange(id)}
              variant={isActive ? "primary" : "secondary"}
              className={`shrink-0 snap-start rounded-xl text-sm font-bold ${
                isActive ? "shadow-[0_0_15px_rgba(6,182,212,0.5)] transform scale-105" : ""
              }`}
              aria-current={isActive ? "true" : undefined}
            >
              {label}
            </Button>
          );
        });
      })()}
    </nav>
  );
};

export default RoutineTabs;
