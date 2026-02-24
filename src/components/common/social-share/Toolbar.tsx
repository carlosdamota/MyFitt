import React from "react";
import { Palette, LayoutGrid, Smile, ChevronRight, ChevronLeft } from "lucide-react";
import { SidePanelTab } from "./types";

interface ToolbarProps {
  tab: SidePanelTab;
  setTab: (tab: SidePanelTab) => void;
  isToolbarOpen: boolean;
  setIsToolbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tab,
  setTab,
  isToolbarOpen,
  setIsToolbarOpen,
}) => {
  const toolButtons: { id: SidePanelTab; icon: React.ReactNode; label: string }[] = [
    { id: "theme", icon: <Palette size={22} />, label: "Tema" },
    { id: "format", icon: <LayoutGrid size={22} />, label: "Formato" },
    { id: "sticker", icon: <Smile size={22} />, label: "Sticker" },
  ];

  return (
    <div
      className={`absolute -right-4 inset-y-0 flex flex-col justify-center pointer-events-none z-20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isToolbarOpen ? "-translate-x-4" : "translate-x-full"
      }`}
    >
      <div className='relative flex flex-col gap-3 rounded-l-3xl border-y border-l border-slate-300/50 dark:border-white/10 bg-slate-200/50 dark:bg-black/20 backdrop-blur-sm p-3 pointer-events-auto shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.5)]'>
        {/* ─── Collapse Toggle ─── */}
        <button
          onClick={() => setIsToolbarOpen((prev) => !prev)}
          className='absolute top-1/2 -translate-y-1/2 -left-6 w-6 h-14 flex flex-col items-center justify-center bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm border-y border-l border-slate-300/50 dark:border-white/10 rounded-l-xl text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.05)] dark:shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.3)] group'
        >
          <div className='transition-transform duration-300 group-hover:scale-110'>
            {isToolbarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </div>
        </button>
        {toolButtons.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(tab === id ? null : id)}
            title={label}
            className={`flex items-center justify-center rounded-2xl h-12 w-12 transition-all ${
              tab === id
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                : "text-white/50 bg-black/10 hover:bg-black/30 hover:text-white"
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
};
