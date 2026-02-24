import { toPng } from "html-to-image";

export type WorkoutImageFormat = "feed" | "story";

export interface WorkoutImageAsset {
  format: WorkoutImageFormat;
  blob: Blob;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}

interface GenerateWorkoutImageOptions {
  formats?: WorkoutImageFormat[];
  fileNameBase?: string;
  backgroundColor?: string;
  scale?: number;
}

const FORMAT_DIMENSIONS: Record<WorkoutImageFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  return response.blob();
};

/**
 * Pre-resolve all <img> elements to base64 so html-to-image doesn't fail
 * trying to fetch relative/absolute URLs from the off-screen container.
 */
async function inlineImages(node: HTMLElement): Promise<void> {
  const imgs = node.querySelectorAll<HTMLImageElement>("img");
  const tasks = Array.from(imgs).map(async (img) => {
    const src = img.src || img.getAttribute("src");
    if (!src || src.startsWith("data:")) return; // already inlined
    try {
      const resp = await fetch(src, { mode: "cors" });
      if (!resp.ok) throw new Error(`${resp.status}`);
      const blob = await resp.blob();
      const reader = new FileReader();
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          img.src = reader.result as string;
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // If we can't load the image, hide it gracefully rather than crash
      img.style.display = "none";
    }
  });
  await Promise.all(tasks);
}

export const generateWorkoutImage = async (
  target: HTMLElement,
  {
    formats = ["feed", "story"],
    fileNameBase = "workout-share",
    backgroundColor = "#121212",
    scale = 2,
  }: GenerateWorkoutImageOptions = {},
): Promise<Record<WorkoutImageFormat, WorkoutImageAsset>> => {
  const computedStyle = window.getComputedStyle(target);
  const width = parseInt(computedStyle.width, 10) || target.scrollWidth || 1080;
  const height = parseInt(computedStyle.height, 10) || target.scrollHeight || 1350;

  // Pre-inline all images to avoid cross-origin fetch failures inside html-to-image
  await inlineImages(target);

  const sourceDataUrl = await toPng(target, {
    width,
    height,
    backgroundColor,
    pixelRatio: scale,
    cacheBust: false, // disable — we already inlined everything
    skipAutoScale: true,
    canvasWidth: width * scale,
    canvasHeight: height * scale,
    skipFonts: false,
    // Silently skip any node that causes errors (e.g., external SVG filters)
    filter: (node) => {
      if (node instanceof HTMLElement) {
        // Skip link/meta elements that may cause issues
        if (["LINK", "META", "SCRIPT"].includes(node.tagName)) return false;
      }
      return true;
    },
  });

  const sourceImage = new Image();
  sourceImage.src = sourceDataUrl;
  await new Promise<void>((resolve, reject) => {
    sourceImage.onload = () => resolve();
    sourceImage.onerror = () => reject(new Error("unable_to_load_source_image"));
  });

  const assets = {} as Record<WorkoutImageFormat, WorkoutImageAsset>;

  for (const format of formats) {
    const { width: targetWidth, height: targetHeight } = FORMAT_DIMENSIONS[format];
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;

    const context = outputCanvas.getContext("2d");
    if (!context) throw new Error("unable_to_get_canvas_context");

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, targetWidth, targetHeight);

    const sourceRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
    const targetRatio = targetWidth / targetHeight;

    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    if (sourceRatio > targetRatio) {
      drawHeight = targetWidth / sourceRatio;
    } else {
      drawWidth = targetHeight * sourceRatio;
    }

    const offsetX = Math.round((targetWidth - drawWidth) / 2);
    const offsetY = Math.round((targetHeight - drawHeight) / 2);

    context.drawImage(sourceImage, offsetX, offsetY, drawWidth, drawHeight);

    const dataUrl = outputCanvas.toDataURL("image/png");
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], `${fileNameBase}-${format}.png`, { type: "image/png" });

    assets[format] = { format, blob, file, dataUrl, width: targetWidth, height: targetHeight };
  }

  return assets;
};
