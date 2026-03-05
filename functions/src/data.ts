import type { Firestore } from "firebase-admin/firestore";

export const billingCollection = (db: Firestore, appId: string, uid: string) =>
  db.collection("artifacts").doc(appId).collection("users").doc(uid).collection("billing");

export const integrationsCollection = (db: Firestore, appId: string, uid: string) =>
  db.collection("artifacts").doc(appId).collection("users").doc(uid).collection("integrations");

export const profileDoc = (db: Firestore, appId: string, uid: string) =>
  db
    .collection("artifacts")
    .doc(appId)
    .collection("users")
    .doc(uid)
    .collection("app_data")
    .doc("profile");

export const monitoringEventsCollection = (db: Firestore, appId: string) =>
  db.collection("artifacts").doc(appId).collection("monitoring_alert_events");
