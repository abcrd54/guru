"use server";

import { revalidatePath } from "next/cache";
import { saveAppSettings } from "@/lib/firestore-data";

export async function saveWhatsappSettingsAction(formData: FormData) {
  await saveAppSettings({
    whatsappProviderUrl: String(formData.get("whatsappProviderUrl") || "").trim(),
    whatsappProviderToken: String(formData.get("whatsappProviderToken") || "").trim(),
    whatsappTemplateActivation: String(formData.get("whatsappTemplateActivation") || "").trim(),
    whatsappTemplateReady: String(formData.get("whatsappTemplateReady") || "").trim()
  });

  revalidatePath("/whatsapp");
}
