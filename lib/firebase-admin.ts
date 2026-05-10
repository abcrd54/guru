import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminConfig, hasFirebaseAdminEnv } from "@/lib/env";

export function getAdminDb() {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  if (!getApps().length) {
    const config = getFirebaseAdminConfig();
    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey
      })
    });
  }

  return getFirestore();
}
