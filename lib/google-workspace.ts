import { google } from "googleapis";
import { getGoogleServiceAccountConfig, hasGoogleServiceAccountEnv } from "@/lib/env";

function getGoogleAuth() {
  if (!hasGoogleServiceAccountEnv()) {
    throw new Error("Google service account environment variables belum lengkap.");
  }

  const config = getGoogleServiceAccountConfig();
  return new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  });
}

export async function copyTemplateSpreadsheet(input: {
  teacherName: string;
  schoolName: string;
  teacherEmail: string;
}) {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });
  const config = getGoogleServiceAccountConfig();
  const targetName = `Guru Tools - ${input.teacherName} - ${input.schoolName}`;

  const copied = await drive.files.copy({
    fileId: config.templateSpreadsheetId,
    requestBody: {
      name: targetName
    },
    fields: "id,name,webViewLink"
  });

  const spreadsheetId = copied.data.id;
  if (!spreadsheetId) {
    throw new Error("Gagal mendapatkan spreadsheetId hasil copy.");
  }

  if (input.teacherEmail) {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: "user",
        role: "writer",
        emailAddress: input.teacherEmail
      },
      sendNotificationEmail: false
    });
  }

  const metadata = await drive.files.get({
    fileId: spreadsheetId,
    fields: "id,name,webViewLink"
  });

  return {
    spreadsheetId: metadata.data.id || spreadsheetId,
    spreadsheetUrl: metadata.data.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    spreadsheetName: metadata.data.name || targetName
  };
}
