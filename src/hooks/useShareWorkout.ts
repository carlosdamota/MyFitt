import { useCallback, useMemo, useState } from "react";
import { resolveSocialShareEngine } from "../config/socialShare";
import { trackSocialShareGeneration } from "../utils/socialShareTelemetry";
import { type WorkoutImageAsset, type WorkoutImageFormat } from "../utils/generateWorkoutImage";
import { generateSocialShareAsset } from "../utils/social-share/renderer";

interface SharePayload {
  title: string;
  text: string;
}

interface GenerateOptions {
  mode?: "preview" | "export";
}

export const useShareWorkout = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const engine = useMemo(() => resolveSocialShareEngine(), []);

  const capabilities = useMemo(() => {
    const canUseNavigatorShare = typeof navigator !== "undefined" && !!navigator.share;
    const canShareFiles =
      canUseNavigatorShare &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [new File([""], "x.txt", { type: "text/plain" })] });

    const canWriteClipboard =
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof ClipboardItem !== "undefined";

    return {
      canUseNavigatorShare,
      canShareFiles,
      canWriteClipboard,
      isMobile:
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(max-width: 768px)").matches,
    };
  }, []);

  const generate = useCallback(
    async (
      target: HTMLElement,
      format: WorkoutImageFormat,
      fileNameBase?: string,
      options: GenerateOptions = {},
    ) => {
      setError(null);
      setIsGenerating(true);
      const startedAt = performance.now();
      const mode = options.mode ?? "preview";
      const scale = mode === "preview" ? 1.25 : 2;

      try {
        const result = await generateSocialShareAsset(
          { target, format, fileNameBase, scale },
          engine,
        );
        const image = result.asset;
        setPreviewImage(image.dataUrl);

        trackSocialShareGeneration({
          engine: result.engine,
          format,
          mode,
          durationMs: Math.round(performance.now() - startedAt),
        });

        return image;
      } catch (err) {
        setError(err instanceof Error ? err.message : "unknown_generation_error");
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [engine],
  );

  const download = useCallback((asset: WorkoutImageAsset) => {
    const link = document.createElement("a");
    link.href = asset.dataUrl;
    link.download = asset.file.name;
    link.click();
  }, []);

  const copyToClipboard = useCallback(
    async (asset: WorkoutImageAsset): Promise<"copied" | "failed"> => {
      try {
        if (!capabilities.canWriteClipboard) {
          return "failed";
        }
        const item = new ClipboardItem({ "image/png": asset.blob });
        await navigator.clipboard.write([item]);
        return "copied";
      } catch {
        return "failed";
      }
    },
    [capabilities.canWriteClipboard],
  );

  const share = useCallback(
    async (asset: WorkoutImageAsset, payload: SharePayload) => {
      if (capabilities.canShareFiles && navigator.share) {
        await navigator.share({ ...payload, files: [asset.file] });
        return "shared" as const;
      }

      download(asset);
      return "downloaded" as const;
    },
    [capabilities.canShareFiles, download],
  );

  return {
    isGenerating,
    error,
    previewImage,
    capabilities,
    generate,
    share,
    download,
    copyToClipboard,
  };
};
