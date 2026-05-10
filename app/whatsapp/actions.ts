"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveAppSettings } from "@/lib/firestore-data";
import { sendTestWhatsapp } from "@/lib/whatsapp";

export async function saveWhatsappSettingsAction(formData: FormData) {
  await saveAppSettings({
    whatsappProviderUrl: String(formData.get("whatsappProviderUrl") || "").trim(),
    whatsappProviderToken: String(formData.get("whatsappProviderToken") || "").trim(),
    whatsappTemplateActivation: String(formData.get("whatsappTemplateActivation") || "").trim(),
    whatsappTemplateReady: String(formData.get("whatsappTemplateReady") || "").trim()
  });

  revalidatePath("/whatsapp");
}

export async function sendWhatsappTestAction(formData: FormData) {
  const phone = String(formData.get("testPhone") || "").trim();
  const message = String(formData.get("testMessage") || "").trim();

  if (!phone || !message) {
    redirect("/whatsapp?status=error&message=Nomor%20dan%20pesan%20test%20wajib%20diisi");
  }

  const result = await sendTestWhatsapp({ phone, message });
  const status = result.sent ? "ok" : "error";
  const messageText = result.sent
    ? "Pesan test berhasil dikirim ke provider"
    : `Pesan test gagal: ${result.reason || "cek konfigurasi Fonnte"}`;

  redirect(`/whatsapp?status=${encodeURIComponent(status)}&message=${encodeURIComponent(messageText)}`);
}
