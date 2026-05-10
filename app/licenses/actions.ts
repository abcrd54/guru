"use server";

import { revalidatePath } from "next/cache";
import { addProvisioningLog, createLicense } from "@/lib/firestore-data";
import { sendActivationWhatsapp } from "@/lib/whatsapp";

export async function createLicenseAction(formData: FormData) {
  const teacherName = String(formData.get("teacherName") || "").trim();
  const schoolName = String(formData.get("schoolName") || "").trim();
  const userEmail = String(formData.get("userEmail") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!teacherName || !schoolName || !userEmail) {
    throw new Error("Nama guru, sekolah, dan email wajib diisi.");
  }

  const { licenseKey } = await createLicense({
    teacherName,
    schoolName,
    userEmail,
    phone
  });

  if (phone) {
    const whatsappResult = await sendActivationWhatsapp({
      licenseKey,
      teacherName,
      schoolName,
      phone
    });

    await addProvisioningLog({
      licenseKey,
      teacherName,
      status: whatsappResult.sent ? "whatsapp_sent" : "whatsapp_skipped",
      message: whatsappResult.sent
        ? `Pesan aktivasi dikirim ke ${phone}.`
        : `Pesan aktivasi tidak terkirim: ${whatsappResult.reason || "cek konfigurasi Fonnte"}.${whatsappResult.response ? ` Response: ${JSON.stringify(whatsappResult.response)}` : ""}`
    });
  }

  revalidatePath("/");
  revalidatePath("/licenses");
  revalidatePath("/teachers");
  revalidatePath("/provisioning");
  revalidatePath("/whatsapp");
  revalidatePath("/settings");
}
