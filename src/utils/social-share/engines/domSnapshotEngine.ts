import { generateWorkoutImage } from "../../generateWorkoutImage";
import type { SocialShareEngineResult, SocialShareGenerateParams } from "../types";

export const generateWithDomSnapshotEngine = async (
  params: SocialShareGenerateParams,
): Promise<SocialShareEngineResult> => {
  const { target, format, fileNameBase, scale } = params;
  const images = await generateWorkoutImage(target, {
    formats: [format],
    fileNameBase,
    scale,
  });

  return {
    engine: "dom",
    asset: images[format],
  };
};
