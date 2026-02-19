import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Ideally we'd use application default credentials if available locally
// or the user would need to provide a service account key.
// Since we are in an environment where `firebase deploy` worked,
// we might be able to use default credentials if gcloud auth application-default login was run.
// If not, this script might fail.
// However, the user can run this.

initializeApp();
// If this fails, we'll ask the user to create the doc via console.

const db = getFirestore();
const appId = "fitmanual-default"; // Hardcoded for this test
const testUserId = "TEST_USER_" + Date.now();
const testEmail = "cdamota.Cd@gmail.com"; // User's email from logs

async function triggerWelcome() {
  console.log(`Creating test profile for ${testUserId} with email ${testEmail}...`);
  try {
    await db
      .collection("artifacts")
      .doc(appId)
      .collection("users")
      .doc(testUserId)
      .collection("app_data")
      .doc("profile")
      .set({
        email: testEmail,
        displayName: "Test User",
        onboardingCompleted: true,
        createdAt: new Date(),
        // Add other required fields if necessary to avoid validation errors?
        // Rules might require them.
        // Based on previous rules analysis:
        weight: 70,
        height: 175,
        age: 30,
        gender: "male",
        experienceLevel: "beginner",
        goal: "muscle_gain",
        availableDays: 3,
        dailyTimeMinutes: 45,
        equipment: ["gym_full"],
        dietType: "balanced",
        injuries: "",
        activeRoutineId: "none",
        lastWorkoutDate: null,
      });
    console.log("Profile created successfully. Check logs for function execution.");
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

triggerWelcome();
