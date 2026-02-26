import type { WorkoutImageAsset, WorkoutImageFormat } from "../generateWorkoutImage";
import type { SocialShareEngine } from "../../config/socialShare";

export interface SocialShareGenerateParams {
  target: HTMLElement;
  format: WorkoutImageFormat;
  fileNameBase?: string;
  scale: number;
}

export interface SocialShareEngineResult {
  engine: SocialShareEngine;
  asset: WorkoutImageAsset;
}

export interface SocialShareRenderer {
  engine: SocialShareEngine;
  generate(params: SocialShareGenerateParams): Promise<SocialShareEngineResult>;
}
