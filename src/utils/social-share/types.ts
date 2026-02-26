import type { WorkoutImageAsset, WorkoutImageFormat } from "../generateWorkoutImage";
import type { SocialShareEngine } from "../../config/socialShare";

import type { WorkoutLogEntry } from "../../types";
import type { ShareCardTheme } from "../../components/common/SocialShareCard";

export interface StickerData {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface SocialShareData {
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  totalVolume: number;
  totalExercises: number;
  totalReps: number;
  duration: string;
  theme: ShareCardTheme;
  stickers: StickerData[];
}

export interface SocialShareGenerateParams {
  target: HTMLElement;
  format: WorkoutImageFormat;
  fileNameBase?: string;
  scale: number;
  data?: SocialShareData;
}

export interface SocialShareEngineResult {
  engine: SocialShareEngine;
  asset: WorkoutImageAsset;
}

export interface SocialShareRenderer {
  engine: SocialShareEngine;
  generate(params: SocialShareGenerateParams): Promise<SocialShareEngineResult>;
}
