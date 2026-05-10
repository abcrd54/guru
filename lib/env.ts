export function getRequiredEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function hasFirebaseAdminEnv() {
  return Boolean(
    getRequiredEnv("FIREBASE_PROJECT_ID") &&
      getRequiredEnv("FIREBASE_CLIENT_EMAIL") &&
      getRequiredEnv("FIREBASE_PRIVATE_KEY")
  );
}

export function getFirebaseAdminConfig() {
  return {
    projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
    clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
  };
}

export function hasGoogleServiceAccountEnv() {
  return Boolean(
    getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL") &&
      getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY") &&
      getRequiredEnv("GOOGLE_TEMPLATE_SPREADSHEET_ID")
  );
}

export function getGoogleServiceAccountConfig() {
  return {
    clientEmail: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL"),
    privateKey: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n"),
    templateSpreadsheetId: getRequiredEnv("GOOGLE_TEMPLATE_SPREADSHEET_ID")
  };
}
