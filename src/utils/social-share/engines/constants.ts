import { type WorkoutImageFormat } from "../../generateWorkoutImage";
export type { WorkoutImageFormat };

export const FORMAT_DIMENSIONS: Record<WorkoutImageFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export const ICON_PATHS = {
  zap: "M13 2 L3 14 h9 l-1 8 10-12 h-9 l1-8 z",
  dumbbell:
    "M6 15 h11 M18 7 c1.1 0 2 .9 2 2 v6 c0 1.1-.9 2-2 2 h-2 M6 7 c-1.1 0-2 .9-2 2 v6 c0 1.1.9 2 2 2 h2 m2-10 v10 m4-10 v10",
  target:
    "M12 22 c5.5 0 10-4.5 10-10 S17.5 2 12 2 2 6.5 2 12 s4.5 10 10 10 z M12 16 c2.2 0 4-1.8 4-4 s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4 z M12 12 v.01",
  activity: "M22 12 h-4 l-3 9-6-18-3 9 h-4",
  trendingUp: "M23 6 L13.5 15.5 L8.5 10.5 L1 18 M17 6 h6 v6",
};

export const LAYOUT = {
  getPadding: (format: WorkoutImageFormat) => ({
    x: format === "story" ? 70 : 65,
    y: format === "story" ? 80 : 55,
  }),
  statsGap: 25,
  cardHeight: 160,
  itemHeight: 85,
  itemGap: 12,
};

export const formatDate = (dateString: string) => {
  try {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
