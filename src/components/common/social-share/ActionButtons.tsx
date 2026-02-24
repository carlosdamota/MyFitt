import React from "react";
import { Share2, Download, ClipboardCopy, Check, Loader2 } from "lucide-react";

interface ActionButtonsProps {
  handleShare: () => Promise<void>;
  handleDownload: () => Promise<void>;
  handleCopy: () => Promise<void>;
  isGenerating: boolean;
  canShareFiles: boolean;
  canWriteClipboard: boolean;
  copied: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleShare,
  handleDownload,
  handleCopy,
  isGenerating,
  canShareFiles,
  canWriteClipboard,
  copied,
}) => {
  return (
    <div className='space-y-2 pt-2'>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className='flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 dark:hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all'
      >
        {isGenerating ? (
          <Loader2
            className='animate-spin'
            size={18}
          />
        ) : (
          <Share2 size={18} />
        )}
        {canShareFiles ? "Compartir" : "Guardar y Compartir"}
      </button>
      <div className='grid grid-cols-2 gap-2'>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className='flex items-center justify-center gap-2 rounded-xl bg-slate-200/50 dark:bg-white/5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 transition-all'
        >
          <Download size={14} /> Descargar
        </button>
        <button
          onClick={handleCopy}
          disabled={isGenerating || !canWriteClipboard}
          className='flex items-center justify-center gap-2 rounded-xl bg-slate-200/50 dark:bg-white/5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-white/10 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 transition-all'
        >
          {copied ? (
            <>
              <Check
                size={14}
                className='text-emerald-500 dark:text-emerald-400'
              />
              <span className='text-emerald-500 dark:text-emerald-400'>Copiado</span>
            </>
          ) : (
            <>
              <ClipboardCopy size={14} /> Copiar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
