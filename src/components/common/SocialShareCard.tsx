import React from "react";
import { Dumbbell, Activity, Target, Zap, TrendingUp } from "lucide-react";
import type { WorkoutLogEntry } from "../../types";
import type { WorkoutImageFormat } from "../../utils/generateWorkoutImage";
import { iconLogo } from "../../branding/logoConfig";

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
  totalReps?: number;
  duration?: string;
  theme?: ShareCardTheme;
  format?: WorkoutImageFormat;
  sticker?: string | null;
  stickerPosition?: { x: number; y: number };
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
      theme = DEFAULT_THEME,
      format = "feed",
      sticker,
      stickerPosition = { x: 50, y: 50 },
    },
    ref,
  ) => {
    const totalVolume = logs.reduce((s, l) => s + (l.volume || 0), 0);
    const totalExercises = logs.length;
    const totalReps = logs.reduce((s, l) => s + (l.sets ?? 0) * (l.reps ?? 0), 0);

    const formatDate = (dateString: string) => {
      try {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    const getGradient = (bgColor: string) => {
      // Create a subtle gradient for depth
      return `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`;
    };

    return (
      <div
        ref={ref}
        id='social-share-card'
        style={{
          background: getGradient(theme.backgroundColor),
          color: theme.primaryTextColor,
          fontFamily: "'Inter', sans-serif",
          width: "1080px",
          height: format === "story" ? "1920px" : "1350px",
          display: "flex",
          flexDirection: "column",
          padding: format === "story" ? "80px 70px" : "55px 65px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
        className='font-sans'
      >
        {/* Subtle background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `${theme.accentColor}15`,
            filter: "blur(100px)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `${theme.accentColor}08`,
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />

        {sticker && (
          <div
            style={{
              position: "absolute",
              left: `${stickerPosition.x}%`,
              top: `${stickerPosition.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: "72px",
              lineHeight: 1,
              pointerEvents: "none",
              zIndex: 30,
            }}
          >
            {sticker}
          </div>
        )}

        {/* Header */}
        <div
          style={{
            marginBottom: "40px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}
              >
                <Activity
                  size={22}
                  color={theme.accentColor}
                />
                <span
                  style={{
                    color: theme.secondaryTextColor,
                    fontSize: "18px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                  }}
                >
                  RESUMEN DE SESIÓN
                </span>
              </div>
              <h1
                style={{
                  color: theme.primaryTextColor,
                  lineHeight: 1.1,
                  fontSize: "52px",
                  fontWeight: "900",
                  textTransform: "capitalize",
                  margin: 0,
                }}
              >
                {formatDate(date)}
              </h1>
            </div>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "28px",
                backgroundColor: `${theme.accentColor}15`,
                border: `1px solid ${theme.accentColor}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.accentColor,
              }}
            >
              <TrendingUp size={42} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "25px",
            marginBottom: "45px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Total Volume */}
          <div
            style={{
              backgroundColor: "#ffffff05",
              backdropFilter: "blur(10px)",
              border: "1px solid #ffffff10",
              borderRadius: "32px",
              padding: "25px 30px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}
            >
              <Zap
                size={20}
                color={theme.accentColor}
              />
              <span
                style={{
                  color: theme.secondaryTextColor,
                  fontSize: "16px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Volumen
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "68px", fontWeight: "900", lineHeight: 1 }}>
                {totalVolume > 0
                  ? totalVolume < 1000
                    ? totalVolume
                    : `${(totalVolume / 1000).toFixed(1)}k`
                  : "0"}
              </span>
              <span
                style={{ color: theme.secondaryTextColor, fontSize: "24px", fontWeight: "700" }}
              >
                KG
              </span>
            </div>
          </div>

          {/* Exercises */}
          <div
            style={{
              backgroundColor: "#ffffff05",
              backdropFilter: "blur(10px)",
              border: "1px solid #ffffff10",
              borderRadius: "32px",
              padding: "25px 30px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}
            >
              <Dumbbell
                size={20}
                color={theme.accentColor}
              />
              <span
                style={{
                  color: theme.secondaryTextColor,
                  fontSize: "16px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Ejercicios
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "68px", fontWeight: "900", lineHeight: 1 }}>
                {totalExercises}
              </span>
              <span
                style={{ color: theme.secondaryTextColor, fontSize: "24px", fontWeight: "700" }}
              >
                EX
              </span>
            </div>
          </div>

          {/* Total Reps */}
          <div
            style={{
              backgroundColor: "#ffffff05",
              backdropFilter: "blur(10px)",
              border: "1px solid #ffffff10",
              borderRadius: "32px",
              padding: "25px 30px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}
            >
              <Target
                size={20}
                color={theme.accentColor}
              />
              <span
                style={{
                  color: theme.secondaryTextColor,
                  fontSize: "16px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Reps
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "68px", fontWeight: "900", lineHeight: 1 }}>
                {totalReps >= 1000 ? `${(totalReps / 1000).toFixed(1)}k` : totalReps}
              </span>
              <span
                style={{ color: theme.secondaryTextColor, fontSize: "24px", fontWeight: "700" }}
              >
                TOT
              </span>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h3
            style={{
              color: theme.secondaryTextColor,
              fontSize: "18px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "2px",
            }}
          >
            Principales Ejercicios
          </h3>

          {logs.slice(0, 8).map((log, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                backgroundColor: "#ffffff03",
                borderRadius: "20px",
                border: "1px solid #ffffff08",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: `${theme.accentColor}10`,
                    padding: "10px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "20px",
                  }}
                >
                  <Dumbbell
                    size={24}
                    color={theme.accentColor}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      color: theme.primaryTextColor,
                      fontSize: "26px",
                      fontWeight: "800",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {log.exercise}
                  </h3>
                </div>
              </div>

              <div style={{ display: "flex", gap: "35px", alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ color: theme.primaryTextColor, fontSize: "28px", fontWeight: "900" }}
                  >
                    {log.sets}×{log.reps}
                  </div>
                  <div
                    style={{
                      color: theme.secondaryTextColor,
                      fontSize: "14px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Reps
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <div style={{ color: theme.accentColor, fontSize: "28px", fontWeight: "900" }}>
                    {(log.weight ?? 0) > 0 ? `${log.weight}kg` : "BW"}
                  </div>
                  <div
                    style={{
                      color: theme.secondaryTextColor,
                      fontSize: "14px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Peso
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logs.length > 8 && (
            <div
              style={{
                marginTop: "5px",
                textAlign: "center",
                padding: "10px",
                backgroundColor: "#ffffff03",
                borderRadius: "16px",
                border: "1px dashed #ffffff15",
              }}
            >
              <span
                style={{
                  color: theme.secondaryTextColor,
                  fontSize: "18px",
                  fontWeight: "600",
                  fontStyle: "italic",
                }}
              >
                + {logs.length - 8} ejercicios más en esta sesión
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "35px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                height: "5px",
                width: "140px",
                borderRadius: "3px",
                backgroundColor: theme.accentColor,
              }}
            ></div>
            <span
              style={{
                color: theme.secondaryTextColor,
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing: "0.1em",
              }}
            >
              GENERADO POR FITTWIZ
            </span>
          </div>

          <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <h3
                className='text-3xl font-black italic uppercase tracking-tighter'
                style={{ color: theme.primaryTextColor, margin: 0, lineHeight: 1 }}
              >
                FITTWIZ
              </h3>
              <p
                style={{
                  color: theme.secondaryTextColor,
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                fittwiz.app
              </p>
            </div>
            <img
              src={iconLogo.src}
              alt={iconLogo.alt}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                objectFit: "contain",
                backgroundColor: "#000",
                border: "2px solid #ffffff15",
                padding: "7px",
              }}
            />
          </div>
        </div>
      </div>
    );
  },
);

SocialShareCard.displayName = "SocialShareCard";
