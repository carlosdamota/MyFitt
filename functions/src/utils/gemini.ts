export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }
  | { inlineData: { mimeType: string; data: string } };

export type GeminiTool = {
  google_search?: Record<string, never>;
};

export const getImagePart = (rawImage: unknown, rawMimeType?: unknown): GeminiPart | null => {
  let data = "";
  let mimeType = typeof rawMimeType === "string" && rawMimeType ? rawMimeType : "image/jpeg";

  if (typeof rawImage === "string") {
    const dataUriMatch = rawImage.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      data = dataUriMatch[2];
    } else {
      data = rawImage;
    }
  } else if (rawImage && typeof rawImage === "object") {
    const imageObject = rawImage as { data?: unknown; base64?: unknown; mimeType?: unknown };
    const candidateData =
      typeof imageObject.data === "string"
        ? imageObject.data
        : typeof imageObject.base64 === "string"
          ? imageObject.base64
          : "";

    if (typeof imageObject.mimeType === "string" && imageObject.mimeType) {
      mimeType = imageObject.mimeType;
    }

    const dataUriMatch = candidateData.match(/^data:(image\/[\w.+-]+);base64,(.+)$/i);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      data = dataUriMatch[2];
    } else {
      data = candidateData;
    }
  }

  if (!data) return null;
  return {
    inline_data: {
      mime_type: mimeType,
      data,
    },
  };
};

export const callGemini = async ({
  geminiApiKey,
  geminiDefaultModel,
  parts,
  systemInstruction = "",
  model,
  tools,
}: {
  geminiApiKey: string;
  geminiDefaultModel: string;
  parts: GeminiPart[];
  systemInstruction?: string;
  model?: string;
  tools?: GeminiTool[];
}) => {
  if (!geminiApiKey) throw new Error("gemini_key_missing");
  const targetModel = model || geminiDefaultModel;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiApiKey}`;
  const payload: {
    contents: Array<{ parts: GeminiPart[] }>;
    systemInstruction: { parts: Array<{ text: string }> };
    tools?: GeminiTool[];
  } = {
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  if (tools && tools.length > 0) payload.tools = tools;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`gemini_error:${response.status}:${msg}`);
  }
  const result = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter((part): part is string => typeof part === "string")
      .join("\n") ?? "";
  if (!text) throw new Error("gemini_empty");
  return text;
};
