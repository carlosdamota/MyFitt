import React from "react";
import { Dumbbell, Activity } from "lucide-react";
import type { WorkoutLogEntry } from "../../types";

export interface ShareCardTheme {
  backgroundColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentColor: string;
}

interface SocialShareCardProps {
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  totalVolume: number;
  totalExercises: number;
  duration?: string;
  theme?: ShareCardTheme;
  sticker?: string | null;
  stickerPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const DEFAULT_THEME: ShareCardTheme = {
  backgroundColor: "#121212",
  primaryTextColor: "#ffffff",
  secondaryTextColor: "#71717a",
  accentColor: "#3b82f6",
};

export const SocialShareCard = React.forwardRef<HTMLDivElement, SocialShareCardProps>(
  (
    {
      date,
      logs,
      totalVolume,
      totalExercises,
      theme = DEFAULT_THEME,
      sticker,
      stickerPosition = "top-left",
    },
    ref,
  ) => {
    const stickerPositionStyles: Record<
      NonNullable<SocialShareCardProps["stickerPosition"]>,
      Record<string, string>
    > = {
      "top-left": { top: "40px", left: "46px" },
      "top-right": { top: "40px", right: "46px" },
      "bottom-left": { bottom: "180px", left: "46px" },
      "bottom-right": { bottom: "180px", right: "46px" },
    };
    const formatDate = (dateString: string) => {
      try {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    return (
      <div
        ref={ref}
        id='social-share-card'
        style={{
          backgroundColor: theme.backgroundColor,
          color: theme.primaryTextColor,
          fontFamily: "'Inter', sans-serif",
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
        className='font-sans'
      >
        {sticker && (
          <div
            style={{
              position: "absolute",
              ...stickerPositionStyles[stickerPosition],
              fontSize: "72px",
              lineHeight: 1,
            }}
          >
            {sticker}
          </div>
        )}

        <div style={{ marginBottom: "50px", borderBottom: "1px solid #27272a", paddingBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  color: theme.secondaryTextColor,
                  marginBottom: "8px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Session Summary
              </h2>
              <h1
                style={{
                  color: theme.primaryTextColor,
                  lineHeight: 1.1,
                  fontSize: "48px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {formatDate(date)}
              </h1>
            </div>
            <div style={{ color: theme.accentColor }}>
              <Activity size={56} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "80px", marginBottom: "50px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <h3
                style={{
                  color: theme.primaryTextColor,
                  margin: 0,
                  lineHeight: 1,
                  fontSize: "110px",
                  fontWeight: "900",
                }}
              >
                {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : "0"}
              </h3>
              <span style={{ color: theme.secondaryTextColor, fontSize: "36px", fontWeight: "bold" }}>
                kg
              </span>
            </div>
            <p
              style={{
                color: theme.secondaryTextColor,
                fontSize: "24px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "8px",
              }}
            >
              Total Volume
            </p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <h3
                style={{
                  color: theme.primaryTextColor,
                  margin: 0,
                  lineHeight: 1,
                  fontSize: "110px",
                  fontWeight: "900",
                }}
              >
                {totalExercises}
              </h3>
              <span style={{ color: theme.secondaryTextColor, fontSize: "36px", fontWeight: "bold" }}>
                Ex
              </span>
            </div>
            <p
              style={{
                color: theme.secondaryTextColor,
                fontSize: "24px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "8px",
              }}
            >
              Exercises
            </p>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          {logs.slice(0, 7).map((log, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "24px",
                borderBottom: "1px solid #27272a",
                minHeight: "80px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  overflow: "hidden",
                  marginRight: "32px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#18181b",
                    padding: "16px",
                    borderRadius: "16px",
                    flexShrink: 0,
                  }}
                >
                  <Dumbbell
                    size={32}
                    color={theme.secondaryTextColor}
                  />
                </div>

                <div
                  style={{
                    marginLeft: "24px",
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h3
                    style={{
                      color: theme.primaryTextColor,
                      lineHeight: "1.4",
                      marginBottom: "0px",
                      fontSize: "28px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingBottom: "2px",
                    }}
                  >
                    {log.exercise}
                  </h3>
                </div>
              </div>

              <div style={{ display: "flex", gap: "40px", flexShrink: 0, textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    minWidth: "90px",
                  }}
                >
                  <span style={{ color: theme.primaryTextColor, fontSize: "32px", fontWeight: "bold" }}>
                    {(log.weight ?? 0) > 0 ? log.weight : "BW"}
                  </span>
                  <span
                    style={{
                      color: theme.secondaryTextColor,
                      fontSize: "14px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    kg
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    minWidth: "120px",
                  }}
                >
                  <span style={{ color: theme.primaryTextColor, fontSize: "32px", fontWeight: "bold" }}>
                    {log.sets} x {log.reps}
                  </span>
                  <span
                    style={{
                      color: theme.secondaryTextColor,
                      fontSize: "14px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Sets x Reps
                  </span>
                </div>
              </div>
            </div>
          ))}

          {logs.length > 7 && (
            <p
              style={{
                color: theme.secondaryTextColor,
                fontSize: "24px",
                fontStyle: "italic",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              + {logs.length - 7} more exercises...
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "8px",
              width: "120px",
              borderRadius: "4px",
              backgroundColor: theme.accentColor,
            }}
          ></div>

          <div style={{ textAlign: "right" }}>
            <h3
              className='text-3xl font-black italic uppercase tracking-tighter'
              style={{ color: theme.primaryTextColor }}
            >
              FITTWIZ
            </h3>
            <p
              className='text-lg font-medium'
              style={{ color: theme.secondaryTextColor }}
            >
              fittwiz.app
            </p>
          </div>
        </div>
      </div>
    );
  },
);

SocialShareCard.displayName = "SocialShareCard";
