import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { hasFirebaseAdminEnv } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase-admin";

export type LicenseRecord = {
  id: string;
  teacherName: string;
  schoolName: string;
  userEmail: string;
  phone: string;
  status: string;
  spreadsheetUrl: string;
  createdAt: string;
};

export type TeacherRecord = {
  id: string;
  name: string;
  email: string;
  school: string;
  phone: string;
  licenseKey: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
};

export type ProvisioningRecord = {
  id: string;
  licenseKey: string;
  teacherName: string;
  status: string;
  message: string;
  createdAt: string;
};

export type AppSettingsRecord = {
  templateSpreadsheetId: string;
  activationBaseUrl: string;
  whatsappProviderUrl: string;
  whatsappProviderToken: string;
  whatsappTemplateActivation: string;
  whatsappTemplateReady: string;
};

function toIso(value: unknown) {
  if (!value) return "-";
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return "-";
}

export function createLicenseKey() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SG-${new Date().getFullYear()}-${suffix}`;
}

export async function getDashboardData() {
  if (!hasFirebaseAdminEnv()) {
    return {
      configured: false,
      licenses: [] as LicenseRecord[],
      teachers: [] as TeacherRecord[],
      provisioningLogs: [] as ProvisioningRecord[]
    };
  }

  const db = getAdminDb();
  const [licensesSnap, teachersSnap, provisioningSnap] = await Promise.all([
    db.collection("licenses").limit(50).get(),
    db.collection("teachers").limit(50).get(),
    db.collection("provisioning_logs").orderBy("createdAt", "desc").limit(20).get().catch(() => null)
  ]);

  const licenses = licensesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      teacherName: String(data.teacherName || ""),
      schoolName: String(data.schoolName || ""),
      userEmail: String(data.userEmail || ""),
      phone: String(data.phone || ""),
      status: data.isActive === false ? "Sudah Dipakai" : "Aktif",
      spreadsheetUrl: String(data.spreadsheetUrl || ""),
      createdAt: toIso(data.usedAt || data.createdAt)
    };
  });

  const teachers = teachersSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: String(data.teacherName || data.name || ""),
      email: String(data.email || ""),
      school: String(data.schoolName || ""),
      phone: String(data.phone || ""),
      licenseKey: String(data.licenseKey || ""),
      spreadsheetId: String(data.spreadsheetId || ""),
      spreadsheetUrl: String(data.spreadsheetUrl || "")
    };
  });

  const provisioningLogs = (provisioningSnap?.docs || []).map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      licenseKey: String(data.licenseKey || ""),
      teacherName: String(data.teacherName || ""),
      status: String(data.status || ""),
      message: String(data.message || ""),
      createdAt: toIso(data.createdAt)
    };
  });

  return {
    configured: true,
    licenses,
    teachers,
    provisioningLogs
  };
}

export async function getAppSettings() {
  if (!hasFirebaseAdminEnv()) {
    return {
      configured: false,
      settings: {
        templateSpreadsheetId: "",
        activationBaseUrl: "",
        whatsappProviderUrl: "",
        whatsappProviderToken: "",
        whatsappTemplateActivation: "",
        whatsappTemplateReady: ""
      } as AppSettingsRecord
    };
  }

  const db = getAdminDb();
  const snapshot = await db.collection("app_settings").doc("owner").get();
  const data = snapshot.data() || {};

  return {
    configured: true,
    settings: {
      templateSpreadsheetId: String(data.templateSpreadsheetId || ""),
      activationBaseUrl: String(data.activationBaseUrl || ""),
      whatsappProviderUrl: String(data.whatsappProviderUrl || ""),
      whatsappProviderToken: String(data.whatsappProviderToken || ""),
      whatsappTemplateActivation: String(data.whatsappTemplateActivation || ""),
      whatsappTemplateReady: String(data.whatsappTemplateReady || "")
    } as AppSettingsRecord
  };
}

export async function saveAppSettings(input: Partial<AppSettingsRecord>) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  await db.collection("app_settings").doc("owner").set(
    {
      ...input,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function createLicense(input: {
  teacherName: string;
  schoolName: string;
  userEmail: string;
  phone?: string;
}) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  const licenseKey = createLicenseKey();
  const email = input.userEmail.trim().toLowerCase();
  const teacherDocId = email || `teacher-${Date.now()}`;

  await db.collection("licenses").doc(licenseKey).set({
    licenseKey,
    teacherName: input.teacherName.trim(),
    schoolName: input.schoolName.trim(),
    userEmail: email,
    phone: String(input.phone || "").trim(),
    isActive: true,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    spreadsheetId: "",
    spreadsheetUrl: ""
  });

  await db.collection("teachers").doc(teacherDocId).set({
    teacherName: input.teacherName.trim(),
    email,
    schoolName: input.schoolName.trim(),
    phone: String(input.phone || "").trim(),
    licenseKey,
    spreadsheetId: "",
    spreadsheetUrl: "",
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection("provisioning_logs").add({
    licenseKey,
    teacherName: input.teacherName.trim(),
    status: "license_created",
    message: "License berhasil dibuat dari owner dashboard.",
    createdAt: FieldValue.serverTimestamp()
  });

  return { licenseKey };
}

export async function addProvisioningLog(input: {
  licenseKey: string;
  teacherName: string;
  status: string;
  message: string;
}) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  await db.collection("provisioning_logs").add({
    licenseKey: input.licenseKey,
    teacherName: input.teacherName,
    status: input.status,
    message: input.message,
    createdAt: FieldValue.serverTimestamp()
  });
}

export async function upsertTeacher(input: {
  teacherName: string;
  email: string;
  schoolName: string;
  phone?: string;
  licenseKey?: string;
}) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error("Email guru wajib diisi.");
  }

  await db.collection("teachers").doc(email).set({
    teacherName: input.teacherName.trim(),
    email,
    schoolName: input.schoolName.trim(),
    phone: String(input.phone || "").trim(),
    licenseKey: String(input.licenseKey || "").trim(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

export async function activateLicenseAndProvision(input: {
  licenseKey: string;
  teacherName: string;
  schoolName: string;
  teacherEmail: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
}) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  const email = input.teacherEmail.trim().toLowerCase();

  await db.collection("licenses").doc(input.licenseKey).set({
    teacherName: input.teacherName.trim(),
    schoolName: input.schoolName.trim(),
    userEmail: email,
    isActive: false,
    status: "provisioned",
    usedAt: FieldValue.serverTimestamp(),
    spreadsheetId: input.spreadsheetId,
    spreadsheetUrl: input.spreadsheetUrl
  }, { merge: true });

  await db.collection("teachers").doc(email || `teacher-${Date.now()}`).set({
    teacherName: input.teacherName.trim(),
    email,
    schoolName: input.schoolName.trim(),
    licenseKey: input.licenseKey,
    spreadsheetId: input.spreadsheetId,
    spreadsheetUrl: input.spreadsheetUrl,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await db.collection("provisioning_logs").add({
    licenseKey: input.licenseKey,
    teacherName: input.teacherName.trim(),
    status: "provisioned",
    message: "Spreadsheet berhasil dibuat dari template dan dibagikan ke guru.",
    createdAt: FieldValue.serverTimestamp()
  });
}

export async function getLicenseByKey(licenseKey: string) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error("Firebase Admin environment variables belum lengkap.");
  }

  const db = getAdminDb();
  const snapshot = await db.collection("licenses").doc(licenseKey).get();
  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    teacherName: String(data.teacherName || ""),
    schoolName: String(data.schoolName || ""),
    userEmail: String(data.userEmail || ""),
    phone: String(data.phone || ""),
    isActive: data.isActive !== false,
    spreadsheetUrl: String(data.spreadsheetUrl || "")
  };
}
