import { notFound } from "next/navigation";
import { ConfigAlert } from "@/components/config-alert";
import { hasFirebaseAdminEnv, hasGoogleServiceAccountEnv } from "@/lib/env";
import { getLicenseByKey } from "@/lib/firestore-data";
import { activateLicenseAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ActivateLicensePage({
  params
}: {
  params: Promise<{ licenseKey: string }>;
}) {
  const { licenseKey } = await params;

  if (!hasFirebaseAdminEnv()) {
    return <ConfigAlert />;
  }

  const license = await getLicenseByKey(licenseKey);
  if (!license) {
    notFound();
  }

  if (!hasGoogleServiceAccountEnv()) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h1>Google service account belum siap</h1>
        <p>Isi env Google terlebih dahulu agar aktivasi bisa membuat spreadsheet otomatis.</p>
      </main>
    );
  }

  if (!license.isActive && license.spreadsheetUrl) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h1>License sudah pernah diaktivasi</h1>
        <p>
          Spreadsheet guru sudah tersedia.{" "}
          <a href={license.spreadsheetUrl} target="_blank" rel="noreferrer">
            Buka spreadsheet
          </a>
        </p>
      </main>
    );
  }

  const submit = activateLicenseAction.bind(null, licenseKey);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#eef4ff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", border: "1px solid #d6e4ff", borderRadius: 24, padding: 24, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1d4ed8", fontWeight: 700, marginBottom: 10 }}>
          Aktivasi License
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: 32, lineHeight: 1.1 }}>SiapGuru</h1>
        <p style={{ margin: "0 0 18px", color: "#5b6475", lineHeight: 1.6 }}>
          Masukkan data guru untuk mengaktifkan license dan membuat spreadsheet otomatis dari template master.
        </p>

        <form action={submit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="teacherName" style={{ fontWeight: 700 }}>Nama Guru</label>
            <input id="teacherName" name="teacherName" defaultValue={license.teacherName} style={{ minHeight: 44, borderRadius: 12, border: "1px solid #d6e4ff", padding: "10px 12px" }} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="schoolName" style={{ fontWeight: 700 }}>Nama Sekolah</label>
            <input id="schoolName" name="schoolName" defaultValue={license.schoolName} style={{ minHeight: 44, borderRadius: 12, border: "1px solid #d6e4ff", padding: "10px 12px" }} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="teacherEmail" style={{ fontWeight: 700 }}>Email Google Guru</label>
            <input id="teacherEmail" name="teacherEmail" type="email" defaultValue={license.userEmail} style={{ minHeight: 44, borderRadius: 12, border: "1px solid #d6e4ff", padding: "10px 12px" }} />
          </div>
          <button type="submit" style={{ minHeight: 46, border: 0, borderRadius: 14, background: "linear-gradient(180deg, #2b69ea 0%, #1d4ed8 100%)", color: "#fff", fontWeight: 700 }}>
            Aktivasi dan Buat Spreadsheet
          </button>
        </form>
      </div>
    </main>
  );
}
