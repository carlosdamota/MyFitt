import React, { useRef, useState } from "react";
import { X, Download, Share2, Loader2, Dumbbell } from "lucide-react";
import html2canvas from "html2canvas";
import { SocialShareCard } from "./SocialShareCard";
import type { WorkoutLogEntry } from "../../types";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  duration?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  date,
  logs,
  duration = "N/A",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const totalVolume = logs.reduce((acc, log) => acc + (log.volume || 0), 0);
  const totalExercises = logs.length;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 1, // 1080px width already
        useCORS: true,
        backgroundColor: "#121212",
        allowTaint: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `workout-${date.replace(/\//g, "-")}.png`;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#121212",
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "workout-share.png", { type: "image/png" });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Mi Entrenamiento en FITTWIZ",
            text:
              duration !== "N/A"
                ? `He completado un entrenamiento de ${totalExercises} ejercicios en ${duration} con ${totalVolume}kg de volumen!`
                : `He registrado ${totalExercises} ejercicios con ${totalVolume}kg de volumen total!`,
            files: [file],
          });
        } else {
          // Fallback to download if web share not supported
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "workout-share.png";
          link.click();
          alert(
            "Tu navegador no soporta compartir archivos directamente. Se ha descargado la imagen.",
          );
        }
      });
    } catch (err) {
      console.error("Error sharing:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <div className='bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-800'>
        {/* Header */}
        <div className='flex justify-between items-center p-4 border-b border-slate-800'>
          <h2 className='text-lg font-bold text-white flex items-center gap-2'>
            <Share2
              size={18}
              className='text-blue-400'
            />{" "}
            Compartir Entrenamiento
          </h2>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        {/* Start Hidden Card Container */}
        {/* This is rendered off-screen or hidden but accessible to html2canvas */}
        <div className='absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden h-0 w-0'>
          <SocialShareCard
            ref={cardRef}
            date={date}
            logs={logs}
            totalVolume={totalVolume}
            totalExercises={totalExercises}
            duration={duration}
          />
        </div>
        {/* End Hidden Card Container */}

        {/* Live Preview */}
        <div className='p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-950/50'>
          <p className='text-sm text-slate-400 mb-4'>Vista previa:</p>

          <div
            className='relative overflow-hidden rounded-lg shadow-2xl border border-slate-800'
            style={{ width: "280px", height: "350px" }}
          >
            <div
              style={{
                transform: "scale(0.259)", // 280 / 1080 ≈ 0.259
                transformOrigin: "top left",
                width: "1080px",
                height: "1350px",
              }}
            >
              <SocialShareCard
                date={date}
                logs={logs}
                totalVolume={totalVolume}
                totalExercises={totalExercises}
                duration={duration}
              />
            </div>
          </div>

          <p className='text-xs text-slate-500 mt-4 text-center px-4'>
            Se generará una imagen de alta calidad (1080x1350) optimizada para Stories y Posts.
          </p>
        </div>

        {/* Actions */}
        <div className='p-4 border-t border-slate-800 grid grid-cols-2 gap-3'>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className='flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50'
          >
            {isGenerating ? (
              <Loader2
                size={18}
                className='animate-spin'
              />
            ) : (
              <Download size={18} />
            )}
            Descargar
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50'
          >
            {isGenerating ? (
              <Loader2
                size={18}
                className='animate-spin'
              />
            ) : (
              <Share2 size={18} />
            )}
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
};
