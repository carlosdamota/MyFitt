import React from "react";
import { Share2, Download, ClipboardCopy, Check } from "lucide-react";
import { Button } from "../../ui/Button";

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
      <Button
        onClick={handleShare}
        isLoading={isGenerating}
        variant='primary'
        className='w-full py-4 text-sm font-bold shadow-lg shadow-blue-500/25 bg-blue-600'
        leftIcon={!isGenerating && <Share2 size={18} />}
      >
        {canShareFiles ? "Compartir" : "Guardar y Compartir"}
      </Button>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          onClick={handleDownload}
          isLoading={isGenerating}
          variant='secondary'
          size='sm'
          className='py-3 text-xs ring-1 ring-slate-200 dark:ring-white/10'
          leftIcon={!isGenerating && <Download size={14} />}
        >
          Descargar
        </Button>

        <Button
          onClick={handleCopy}
          isLoading={isGenerating}
          disabled={!canWriteClipboard}
          variant='secondary'
          size='sm'
          className='py-3 text-xs ring-1 ring-slate-200 dark:ring-white/10'
          leftIcon={
            !isGenerating &&
            (copied ? (
              <Check
                size={14}
                className='text-emerald-500 dark:text-emerald-400'
              />
            ) : (
              <ClipboardCopy size={14} />
            ))
          }
        >
          <span className={copied ? "text-emerald-500 dark:text-emerald-400" : ""}>
            {copied ? "Copiado" : "Copiar"}
          </span>
        </Button>
      </div>
    </div>
  );
};
