import { ConfigAlert } from "@/components/config-alert";
import { getDashboardData } from "@/lib/firestore-data";
import { upsertTeacherAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const data = await getDashboardData();
  return (
    <>
      <section className="hero">
        <div className="brand-kicker">Guru</div>
        <h1 className="hero-title">Data guru penerima lisensi dan spreadsheet.</h1>
        <div className="hero-copy">
          Nanti halaman ini menjadi pusat data email Google guru, nomor WhatsApp, sekolah, dan relasi ke spreadsheet hasil provisioning.
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      <section className="card">
        <h2 className="card-title">Tambah / Perbarui Guru</h2>
        <p className="card-copy">Gunakan form ini untuk menyimpan data guru nyata ke Firestore.</p>
        <form action={upsertTeacherAction} className="grid-2">
          <label className="field">
            <span>Nama Guru</span>
            <input name="teacherName" placeholder="Nama guru" />
          </label>
          <label className="field">
            <span>Email Guru</span>
            <input name="email" type="email" placeholder="guru@sekolah.id" />
          </label>
          <label className="field">
            <span>Nama Sekolah</span>
            <input name="schoolName" placeholder="Nama sekolah" />
          </label>
          <label className="field">
            <span>No. WhatsApp</span>
            <input name="phone" placeholder="08xxxxxxxxxx" />
          </label>
          <label className="field">
            <span>License Key</span>
            <input name="licenseKey" placeholder="SG-2026-XXXXXX" />
          </label>
          <div>
            <button type="submit" className="button primary">
              Simpan Guru
            </button>
          </div>
        </form>
      </section>

      <section className="table-card">
        <div className="table-head">
          <h2 className="table-title">Daftar Guru</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Sekolah</th>
              <th>WhatsApp</th>
              <th>Lisensi</th>
              <th>Spreadsheet</th>
            </tr>
          </thead>
          <tbody>
            {data.teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.name || "-"}</td>
                <td>{teacher.email || "-"}</td>
                <td>{teacher.school || "-"}</td>
                <td>{teacher.phone || "-"}</td>
                <td>{teacher.licenseKey || "-"}</td>
                <td>{teacher.spreadsheetId ? "Siap" : "Belum"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.teachers.length ? (
          <div className="empty-state">Belum ada data guru di Firestore.</div>
        ) : null}
      </section>
    </>
  );
}
