"use server";

import { revalidatePath } from "next/cache";
import { saveAppSettings } from "@/lib/firestore-data";

export async function saveOwnerSettingsAction(formData: FormData) {
  await saveAppSettings({
    templateSpreadsheetId: String(formData.get("templateSpreadsheetId") || "").trim(),
    activationBaseUrl: String(formData.get("activationBaseUrl") || "").trim()
  });

  revalidatePath("/settings");
}
