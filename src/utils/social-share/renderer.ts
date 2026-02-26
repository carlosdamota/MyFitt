import type { SocialShareEngine } from "../../config/socialShare";
import { generateWithDomSnapshotEngine } from "./engines/domSnapshotEngine";
import { generateWithKonvaEngine } from "./engines/konvaEngine";
import type { SocialShareEngineResult, SocialShareGenerateParams, SocialShareRenderer } from "./types";

const domRenderer: SocialShareRenderer = {
  engine: "dom",
  generate: generateWithDomSnapshotEngine,
};

const konvaRenderer: SocialShareRenderer = {
  engine: "konva",
  generate: generateWithKonvaEngine,
};

export const getSocialShareRenderer = (engine: SocialShareEngine): SocialShareRenderer => {
  return engine === "konva" ? konvaRenderer : domRenderer;
};

export const generateSocialShareAsset = async (
  params: SocialShareGenerateParams,
  preferredEngine: SocialShareEngine,
): Promise<SocialShareEngineResult> => {
  const renderer = getSocialShareRenderer(preferredEngine);

  try {
    return await renderer.generate(params);
  } catch {
    if (preferredEngine === "dom") {
      throw new Error("social_share_dom_generation_failed");
    }

    return domRenderer.generate(params);
  }
};
