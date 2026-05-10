import { ConfigAlert } from "@/components/config-alert";
import { buildActivationUrl } from "@/lib/activation";
import { getAppSettings, getDashboardData } from "@/lib/firestore-data";
import { createLicenseAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const [data, appSettings] = await Promise.all([getDashboardData(), getAppSettings()]);
  const activationBaseUrl = appSettings.settings.activationBaseUrl;
  return (
    <>
      <section className="hero">
        <div className="brand-kicker">Lisensi</div>
        <h1 className="hero-title">Kelola pembuatan, status, dan aktivasi license guru.</h1>
        <div className="hero-copy">
          Halaman ini nanti menjadi tempat admin membuat batch license, menghubungkannya ke data guru,
          dan memicu pesan aktivasi WhatsApp.
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      <section className="card">
        <h2 className="card-title">Buat Lisensi Baru</h2>
        <p className="card-copy">Sekali submit, sistem membuat dokumen lisensi dan menyimpan data guru dasar ke Firestore.</p>
        {activationBaseUrl ? (
          <p className="card-copy">
            Link aktivasi akan dibentuk dari: <strong>{activationBaseUrl}</strong>
          </p>
        ) : (
          <p className="card-copy">
            Activation base URL belum diisi di halaman <strong>Pengaturan</strong>.
          </p>
        )}
        <form action={createLicenseAction} className="grid-2">
          <label className="field">
            <span>Nama Guru</span>
            <input name="teacherName" placeholder="Nama guru" />
          </label>
          <label className="field">
            <span>Nama Sekolah</span>
            <input name="schoolName" placeholder="Nama sekolah" />
          </label>
          <label className="field">
            <span>Email Guru</span>
            <input name="userEmail" type="email" placeholder="guru@sekolah.id" />
          </label>
          <label className="field">
            <span>No. WhatsApp</span>
            <input name="phone" placeholder="08xxxxxxxxxx" />
          </label>
          <div>
            <button type="submit" className="button primary">
              Buat Lisensi
            </button>
          </div>
        </form>
      </section>

      <section className="table-card">
        <div className="table-head">
          <h2 className="table-title">Daftar Lisensi</h2>
          <div className="stats-row">
            <span className="pill success">Data nyata</span>
            <span className="pill">Firestore</span>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>License Key</th>
              <th>Guru</th>
              <th>Sekolah</th>
              <th>Status</th>
              <th>Aktivasi</th>
              <th>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {data.licenses.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.teacherName || "-"}</td>
                <td>{item.schoolName || "-"}</td>
                <td>{item.status}</td>
                <td>
                  {activationBaseUrl ? (
                    <a href={buildActivationUrl(activationBaseUrl, item.id)} target="_blank" rel="noreferrer">
                      Buka Link
                    </a>
                  ) : (
                    <span className="muted">Belum diatur</span>
                  )}
                </td>
                <td>
                  {item.phone ? (
                    <span>{item.phone}</span>
                  ) : (
                    <span className="muted">Belum ada nomor</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.licenses.length ? (
          <div className="empty-state">Belum ada data lisensi di Firestore.</div>
        ) : null}
      </section>
    </>
  );
}
