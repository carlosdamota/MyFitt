import type { SocialShareEngineResult, SocialShareGenerateParams } from "../types";

/**
 * Konva engine scaffold.
 *
 * This engine is intentionally not active yet: it will be implemented in the
 * next migration phase while keeping the DOM snapshot renderer as a fallback.
 */
export const generateWithKonvaEngine = async (
  _params: SocialShareGenerateParams,
): Promise<SocialShareEngineResult> => {
  throw new Error("konva_engine_not_ready");
};
