import html2canvas from "html2canvas";

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

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("unable_to_generate_blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
};

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

export const generateWorkoutImage = async (
  target: HTMLElement,
  {
    formats = ["feed", "story"],
    fileNameBase = "workout-share",
    backgroundColor = "#121212",
    scale = 2,
  }: GenerateWorkoutImageOptions = {},
): Promise<Record<WorkoutImageFormat, WorkoutImageAsset>> => {
  const rect = target.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  const captureRoot = document.createElement("div");
  captureRoot.style.position = "fixed";
  captureRoot.style.left = "-10000px";
  captureRoot.style.top = "0";
  captureRoot.style.pointerEvents = "none";
  captureRoot.style.opacity = "0";
  captureRoot.style.width = `${width}px`;
  captureRoot.style.height = `${height}px`;
  captureRoot.style.background = backgroundColor;

  const clone = target.cloneNode(true) as HTMLElement;
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.transform = "none";

  captureRoot.appendChild(clone);
  document.body.appendChild(captureRoot);

  try {
    const sourceCanvas = await html2canvas(clone, {
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      scale,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      logging: false,
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

      const sourceRatio = sourceCanvas.width / sourceCanvas.height;
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

      context.drawImage(sourceCanvas, offsetX, offsetY, drawWidth, drawHeight);

      const dataUrl = outputCanvas.toDataURL("image/png");
      const blob = (await canvasToBlob(outputCanvas).catch(async () => dataUrlToBlob(dataUrl))) as Blob;
      const file = new File([blob], `${fileNameBase}-${format}.png`, { type: "image/png" });

      assets[format] = {
        format,
        blob,
        file,
        dataUrl,
        width: targetWidth,
        height: targetHeight,
      };
    }

    return assets;
  } finally {
    document.body.removeChild(captureRoot);
  }
};
