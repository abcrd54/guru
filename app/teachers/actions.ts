"use server";

import { revalidatePath } from "next/cache";
import { upsertTeacher } from "@/lib/firestore-data";

export async function upsertTeacherAction(formData: FormData) {
  const teacherName = String(formData.get("teacherName") || "").trim();
  const schoolName = String(formData.get("schoolName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const licenseKey = String(formData.get("licenseKey") || "").trim();

  if (!teacherName || !schoolName || !email) {
    throw new Error("Nama guru, sekolah, dan email wajib diisi.");
  }

  await upsertTeacher({
    teacherName,
    schoolName,
    email,
    phone,
    licenseKey
  });

  revalidatePath("/");
  revalidatePath("/teachers");
}
