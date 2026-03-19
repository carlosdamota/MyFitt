const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const userId = 'ZB9LtE8gqqQtrOWMcLrcuUoLSHT2';
const appId = 'fitmanual-default';

async function debug() {
  console.log(`Checking data for user: ${userId}`);
  
  // 1. Get stats document
  const statsRef = db.doc(`artifacts/${appId}/users/${userId}/app_data/stats`);
  const statsSnap = await statsRef.get();
  
  if (!statsSnap.exists) {
    console.log('Stats document does not exist.');
  } else {
    const stats = statsSnap.data();
    console.log('--- Gamification State ---');
    console.log(JSON.stringify(stats.gamification, null, 2));
    console.log('--- Workout Dates (Last 10) ---');
    console.log(stats.workoutDates.slice(0, 10));
  }

  // 2. Get workout sessions from week of March 9th (2026-03-09 to 2026-03-15)
  console.log('\n--- Workout Sessions (March 9th - March 15th) ---');
  const sessionsRef = db.collection(`artifacts/${appId}/users/${userId}/workout_sessions`);
  const sessionsSnap = await sessionsRef
    .where('date', '>=', '2026-03-09')
    .where('date', '<=', '2026-03-15T23:59:59Z')
    .get();

  if (sessionsSnap.empty) {
    console.log('No sessions found for this week.');
  } else {
    sessionsSnap.forEach(doc => {
      const data = doc.data();
      console.log(`Session ID: ${doc.id}`);
      console.log(`Date: ${data.date}`);
      console.log(`Has Logs: ${!!data.logs}`);
      if (data.logs) {
        console.log(`Log Exercise Count: ${Object.keys(data.logs).length}`);
      }
      console.log('---');
    });
  }
}

debug().catch(console.error);
