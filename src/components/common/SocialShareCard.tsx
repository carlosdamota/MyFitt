import React from "react";
import { Dumbbell, Trophy, Timer, Activity } from "lucide-react";
import type { WorkoutLogEntry } from "../../types";

interface SocialShareCardProps {
  date: string;
  logs: (WorkoutLogEntry & { exercise: string; volume: number })[];
  totalVolume: number;
  totalExercises: number;
  duration: string;
}

export const SocialShareCard = React.forwardRef<HTMLDivElement, SocialShareCardProps>(
  ({ date, logs, totalVolume, totalExercises, duration }, ref) => {
    // Helper to format date like "Monday, 12 Oct"
    const formatDate = (dateString: string) => {
      try {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return dateString;
      }
    };

    return (
      <div
        ref={ref}
        id='social-share-card'
        style={{
          backgroundColor: "#121212",
          color: "#ffffff",
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
        // Using explicit styles + tailwind for basic text
        className='font-sans'
      >
        {/* Header Section */}
        <div
          style={{ marginBottom: "50px", borderBottom: "1px solid #27272a", paddingBottom: "30px" }}
        >
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
                  color: "#71717a",
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
                  color: "#e4e4e7",
                  lineHeight: 1.1,
                  fontSize: "48px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {formatDate(date)}
              </h1>
            </div>
            <div style={{ color: "#3b82f6" }}>
              <Activity size={56} />
            </div>
          </div>
        </div>

        {/* Big Stats Row */}
        <div style={{ display: "flex", gap: "80px", marginBottom: "50px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <h3
                style={{
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1,
                  fontSize: "110px",
                  fontWeight: "900",
                }}
              >
                {totalVolume > 0 ? (totalVolume / 1000).toFixed(1) + "k" : "0"}
              </h3>
              <span style={{ color: "#71717a", fontSize: "36px", fontWeight: "bold" }}>kg</span>
            </div>
            <p
              style={{
                color: "#52525b",
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
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1,
                  fontSize: "110px",
                  fontWeight: "900",
                }}
              >
                {totalExercises}
              </h3>
              <span style={{ color: "#71717a", fontSize: "36px", fontWeight: "bold" }}>Ex</span>
            </div>
            <p
              style={{
                color: "#52525b",
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

        {/* Exercise List */}
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
                {/* Icon */}
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
                    color='#a1a1aa'
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
                      color: "#f4f4f5",
                      lineHeight: "1.4",
                      marginBottom: "0px", // Removed bottom margin since no subtitle
                      fontSize: "28px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingBottom: "2px", // Prevent descender clipping
                    }}
                  >
                    {log.exercise}
                  </h3>
                </div>
              </div>

              {/* Stats Columns */}
              <div style={{ display: "flex", gap: "40px", flexShrink: 0, textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    minWidth: "90px",
                  }}
                >
                  <span style={{ color: "#ffffff", fontSize: "32px", fontWeight: "bold" }}>
                    {(log.weight ?? 0) > 0 ? log.weight : "BW"}
                  </span>
                  <span
                    style={{
                      color: "#52525b",
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
                  <span style={{ color: "#ffffff", fontSize: "32px", fontWeight: "bold" }}>
                    {log.sets} x {log.reps}
                  </span>
                  <span
                    style={{
                      color: "#52525b",
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
                color: "#52525b",
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

        {/* Footer */}
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
              backgroundColor: "#2563eb",
            }}
          ></div>

          <div style={{ textAlign: "right" }}>
            <h3
              className='text-3xl font-black italic uppercase tracking-tighter'
              style={{ color: "#ffffff" }}
            >
              FITTWIZ
            </h3>
            <p
              className='text-lg font-medium'
              style={{ color: "#52525b" }}
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
