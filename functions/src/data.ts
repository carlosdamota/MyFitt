import type { Firestore } from "firebase-admin/firestore";

export const billingCollection = (db: Firestore, appId: string, uid: string) =>
  db.collection("artifacts").doc(appId).collection("users").doc(uid).collection("billing");
