import { useEffect, useState } from "react";
import { doc, getDoc, writeBatch, collection, setDoc } from "firebase/firestore";
import { db, appId } from "../config/firebase";
import type { User } from "firebase/auth";
import type { WorkoutLogs, WorkoutLogEntry, WorkoutSession } from "../types";

export const useLegacyLogsMigration = (user: User | null) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [migrationDone, setMigrationDone] = useState(false);

  useEffect(() => {
    if (!user || !db || isMigrating || migrationDone) return;

    const performMigration = async () => {
      try {
        setIsMigrating(true);
        const legacyRef = doc(db!, "artifacts", appId, "users", user.uid, "app_data", "logs");
        const docSnap = await getDoc(legacyRef);

        if (!docSnap.exists()) {
          setMigrationDone(true);
          return;
        }

        const data = docSnap.data();

        // 1. Check if it's already migrated
        if (data.migratedToSessions) {
          setMigrationDone(true);
          return;
        }

        // 2. Extract logs (supporting both old structures)
        let legacyLogsToMigrate: WorkoutLogs = {};
        if (data.logs) {
          legacyLogsToMigrate = data.logs as WorkoutLogs;
        } else {
          // Filtrar metadatos para estructura legacy pura { ejercicio: [entries] }
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              legacyLogsToMigrate[key] = value as WorkoutLogEntry[];
            }
          });
        }

        if (Object.keys(legacyLogsToMigrate).length === 0) {
          // Only mark as migrated preserving coachAdvice
          const cleanMetadata = {
            coachAdvice: data.coachAdvice || null,
            migratedToSessions: true,
          };
          await setDoc(legacyRef, cleanMetadata);
          setMigrationDone(true);
          return;
        }

        // 3. Transform legacy `WorkoutLogs` map into individual `WorkoutSession`s grouped by Date String
        const sessionsByDate: Record<string, WorkoutSession> = {};

        Object.entries(legacyLogsToMigrate).forEach(([exerciseName, entries]) => {
          (entries as WorkoutLogEntry[]).forEach((entry) => {
            const dateStr = entry.date; // Use the raw date as unique daily identifier
            if (!dateStr) return;

            if (!sessionsByDate[dateStr]) {
              sessionsByDate[dateStr] = {
                id: new Date(dateStr).toISOString(),
                date: dateStr,
                logs: {},
              };
            }

            if (!sessionsByDate[dateStr].logs[exerciseName]) {
              sessionsByDate[dateStr].logs[exerciseName] = [];
            }
            sessionsByDate[dateStr].logs[exerciseName].push(entry);
          });
        });

        const sessionItems = Object.values(sessionsByDate);

        // 4. Batch Write Limits = 500 ops per batch.
        // We need to chunk. 1 create per session + 1 update for legacy Ref.
        const CHUNK_SIZE = 490;
        for (let i = 0; i < sessionItems.length; i += CHUNK_SIZE) {
          const batch = writeBatch(db!);
          const chunk = sessionItems.slice(i, i + CHUNK_SIZE);

          const sessionsCollection = collection(
            db!,
            "artifacts",
            appId,
            "users",
            user.uid,
            "workout_sessions",
          );

          chunk.forEach((session) => {
            // Document ID can be the ISO String format for clean chronological queries
            const sessionDocRef = doc(sessionsCollection, session.id);
            batch.set(sessionDocRef, session);
          });

          // In the VERY LAST chunk, we update the legacy `app_data/logs`
          if (i + CHUNK_SIZE >= sessionItems.length) {
            const cleanMetadata = {
              coachAdvice: data.coachAdvice || null,
              migratedToSessions: true,
            };
            batch.set(legacyRef, cleanMetadata);
          }

          await batch.commit();
        }

        setMigrationDone(true);
      } catch (error) {
        console.error("Error migrating legacy logs:", error);
        setMigrationError("Error procesando historial de entrenamientos antiguos.");
      } finally {
        setIsMigrating(false);
      }
    };

    performMigration();
  }, [user, isMigrating, migrationDone]);

  return { isMigrating, migrationError, migrationDone };
};
