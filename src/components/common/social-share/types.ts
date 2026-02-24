import { ShareCardTheme } from "../SocialShareCard";

export type SidePanelTab = "theme" | "format" | "sticker" | null;

export interface ThemePreset extends ShareCardTheme {
  preview: string;
  label: string;
}
