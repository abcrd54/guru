"use server";

import { redirect } from "next/navigation";
import { activateLicenseAndProvision, addProvisioningLog, getLicenseByKey } from "@/lib/firestore-data";
import { copyTemplateSpreadsheet } from "@/lib/google-workspace";
import { sendSpreadsheetReadyWhatsapp } from "@/lib/whatsapp";

export async function activateLicenseAction(licenseKey: string, formData: FormData) {
  const teacherName = String(formData.get("teacherName") || "").trim();
  const schoolName = String(formData.get("schoolName") || "").trim();
  const teacherEmail = String(formData.get("teacherEmail") || "").trim().toLowerCase();

  if (!teacherName || !schoolName || !teacherEmail) {
    throw new Error("Nama guru, sekolah, dan email wajib diisi.");
  }

  const license = await getLicenseByKey(licenseKey);
  if (!license) {
    throw new Error("License tidak ditemukan.");
  }

  if (!license.isActive && license.spreadsheetUrl) {
    redirect(license.spreadsheetUrl);
  }

  const spreadsheet = await copyTemplateSpreadsheet({
    teacherName,
    schoolName,
    teacherEmail
  });

  await activateLicenseAndProvision({
    licenseKey,
    teacherName,
    schoolName,
    teacherEmail,
    spreadsheetId: spreadsheet.spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl
  });

  if (license.phone) {
    const whatsappResult = await sendSpreadsheetReadyWhatsapp({
      licenseKey,
      teacherName,
      schoolName,
      phone: license.phone,
      spreadsheetUrl: spreadsheet.spreadsheetUrl
    });

    await addProvisioningLog({
      licenseKey,
      teacherName,
      status: whatsappResult.sent ? "whatsapp_ready_sent" : "whatsapp_ready_skipped",
      message: whatsappResult.sent
        ? `Pesan spreadsheet siap dikirim ke ${license.phone}.`
        : `Pesan spreadsheet siap tidak terkirim: ${whatsappResult.reason || "cek konfigurasi Fonnte"}.`
    });
  }

  redirect(spreadsheet.spreadsheetUrl);
}
