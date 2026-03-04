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
  stravaLinked?: boolean;
  stravaSyncing?: boolean;
  stravaSynced?: boolean;
  onStravaSync?: () => Promise<void>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleShare,
  handleDownload,
  handleCopy,
  isGenerating,
  canShareFiles,
  canWriteClipboard,
  copied,
  stravaLinked,
  stravaSyncing,
  stravaSynced,
  onStravaSync,
}) => {
  return (
    <div className='space-y-2 pt-2'>
      <div className={stravaLinked && onStravaSync ? "grid grid-cols-2 gap-2" : ""}>
        <Button
          onClick={handleShare}
          isLoading={isGenerating}
          variant='primary'
          className='w-full py-4 text-sm font-bold shadow-lg shadow-blue-500/25 bg-blue-600'
          leftIcon={!isGenerating && <Share2 size={18} />}
        >
          {canShareFiles ? "Compartir" : "Guardar y Compartir"}
        </Button>

        {stravaLinked && onStravaSync && (
          <Button
            onClick={onStravaSync}
            isLoading={stravaSyncing}
            disabled={stravaSynced}
            className={`w-full py-3.5 text-sm font-bold shadow-lg shadow-[#FC4C02]/20 border-0 ${
              stravaSynced
                ? "bg-[#FC4C02]/20 text-[#FC4C02] opacity-80"
                : "bg-[#FC4C02] text-white hover:bg-[#e34402]"
            }`}
            leftIcon={
              !stravaSyncing &&
              (stravaSynced ? (
                <Check size={18} />
              ) : (
                <svg
                  viewBox='0 0 24 24'
                  className='w-[18px] h-[18px]'
                  fill='currentColor'
                >
                  <path d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169' />
                </svg>
              ))
            }
          >
            {stravaSynced ? "Sincronizado" : "Subir a Strava"}
          </Button>
        )}
      </div>

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
