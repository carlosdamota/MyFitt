import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Config ---
const APP_ID = process.env.FITTWIZ_APP_ID || process.env.FITMANUAL_APP_ID || "fitmanual-default";

// Read Service Account
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, "..", "serviceAccount.json");
  const sf = readFileSync(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(sf);
} catch (error) {
  console.error(
    "❌ No se pudo encontrar o leer el archivo serviceAccount.json en la carpeta functions/",
  );
  process.exit(1);
}

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: "myfitt-5ddf6",
  });
} catch (error) {
  console.error("❌ Error inicializando Firebase Admin:", error);
  process.exit(1);
}

const db = getFirestore();

/**
 * Backfill script: iterate through all users and aggregate their
 * workout_sessions into a single stats document.
 */
async function backfillStats() {
  const usersRef = db.collection(`artifacts/${APP_ID}/users`);
  const usersSnap = await usersRef.listDocuments();

  console.log(`🔍 Encontrados ${usersSnap.length} usuarios. Iniciando backfill...`);

  let processed = 0;
  let skipped = 0;

  for (const userDocRef of usersSnap) {
    const userId = userDocRef.id;
    const sessionsRef = db.collection(`artifacts/${APP_ID}/users/${userId}/workout_sessions`);
    const sessionsSnap = await sessionsRef.get();

    if (sessionsSnap.empty) {
      skipped++;
      continue;
    }

    // 1. Fetch Legacy Logs from app_data/logs
    const legacyLogsRef = db.doc(`artifacts/${APP_ID}/users/${userId}/app_data/logs`);
    const legacyLogsSnap = await legacyLogsRef.get();
    const legacyLogsData = legacyLogsSnap.exists ? legacyLogsSnap.data()?.logs || {} : {};

    // Build the stats object from scratch
    const stats = {
      totalSessions: 0,
      totalVolume: 0,
      totalExercises: 0,
      workoutDates: [],
      personalBests: {},
      dailyVolume: [],
    };

    const allExerciseNames = new Set();
    const dailyVolumeMap = {}; // { "2025-01-15": 1234 }

    // --- Helper to process a set of logs for a given date ---
    const processLogs = (logs, date) => {
      const dateKey = date.split("T")[0];
      if (!stats.workoutDates.includes(dateKey)) {
        stats.workoutDates.push(dateKey);
      }

      let logVolume = 0;
      for (const [exerciseName, entries] of Object.entries(logs)) {
        if (!entries || !Array.isArray(entries)) continue;
        allExerciseNames.add(exerciseName);

        if (!stats.personalBests[exerciseName]) {
          stats.personalBests[exerciseName] = {};
        }

        for (const entry of entries) {
          const eDate = entry.date || date;
          const eDateKey = eDate.split("T")[0];

          // Legacy check: some logs might have different dates than the session/container
          if (!stats.workoutDates.includes(eDateKey)) {
            stats.workoutDates.push(eDateKey);
          }

          const weight = parseFloat(String(entry.weight || 0));
          const reps = parseInt(String(entry.reps || 0));
          const sets = parseInt(String(entry.sets || 1));
          const vol = weight * reps * sets;
          logVolume += vol;

          // Aggregar al mapa de volumen diario basado en la fecha del log
          dailyVolumeMap[eDateKey] = (dailyVolumeMap[eDateKey] || 0) + vol;

          // Categorize PB
          let category = null;
          if (reps >= 1 && reps <= 5) category = "low";
          else if (reps >= 6 && reps <= 12) category = "mid";
          else if (reps > 12) category = "high";

          if (category) {
            const currentPB = stats.personalBests[exerciseName][category];
            if (
              !currentPB ||
              weight > currentPB.weight ||
              (weight === currentPB.weight && reps > currentPB.reps)
            ) {
              stats.personalBests[exerciseName][category] = {
                weight,
                reps,
                date: eDate,
              };
            }
          }
        }
      }
      stats.totalVolume += logVolume;
    };

    // --- A. Process Legacy Logs ---
    // In legacy logs, multiple exercises are mixed. We'll group them by date to count "sessions".
    const legacyDates = new Set();
    Object.values(legacyLogsData).forEach((entries) => {
      entries.forEach((e) => {
        if (e.date) legacyDates.add(e.date.split("T")[0]);
      });
    });

    // Total sessions from legacy is roughly the number of unique days
    stats.totalSessions += legacyDates.size;

    // Process the legacy logs data
    processLogs(legacyLogsData, new Date().toISOString());

    // --- B. Process modern Workout Sessions ---
    for (const sessionDoc of sessionsSnap.docs) {
      const sessionData = sessionDoc.data();
      if (!sessionData.logs) continue;

      const sessionDate =
        sessionData.date ||
        sessionDoc.createTime?.toDate().toISOString() ||
        new Date().toISOString();
      const sessionDateKey = sessionDate.split("T")[0];

      // If this date was already in legacy, we don't increment totalSessions again (avoid double counting if migrated)
      if (!legacyDates.has(sessionDateKey)) {
        stats.totalSessions++;
      }

      processLogs(sessionData.logs, sessionDate);
    }

    stats.totalExercises = allExerciseNames.size;
    stats.workoutDates.sort((a, b) => b.localeCompare(a));

    // Convert dailyVolume map to sorted array, keep last 100 days
    stats.dailyVolume = Object.entries(dailyVolumeMap)
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-100);

    // Write stats document
    const statsRef = db.doc(`artifacts/${APP_ID}/users/${userId}/app_data/stats`);
    await statsRef.set(stats, { merge: true });

    processed++;
    console.log(
      `  ✅ ${userId}: ${stats.totalSessions} sesiones, ${stats.totalVolume.toFixed(0)} kg volumen total, ${stats.totalExercises} ejercicios`,
    );
  }

  console.log(
    `\n🏁 Backfill completado: ${processed} usuarios procesados, ${skipped} sin sesiones.`,
  );
}

backfillStats()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error en backfill:", err);
    process.exit(1);
  });
