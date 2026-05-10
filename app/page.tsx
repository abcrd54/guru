import Link from "next/link";
import { ConfigAlert } from "@/components/config-alert";
import { getDashboardData } from "@/lib/firestore-data";

export const dynamic = "force-dynamic";

const provisioningSteps = [
  "Admin membuat data guru dan license key.",
  "Sistem mengirim pesan WhatsApp berisi link aktivasi.",
  "Guru aktivasi sekali, lalu spreadsheet otomatis dibuat dari template.",
  "Spreadsheet dibagikan ke email guru dan status provisioning tercatat."
];

export default async function DashboardPage() {
  const data = await getDashboardData();
  const activeLicenses = data.licenses.filter((item) => item.status === "Aktif").length;
  const usedLicenses = data.licenses.filter((item) => item.status !== "Aktif").length;

  return (
    <>
      <section className="hero">
        <div className="brand-kicker">Lisensi</div>
        <h1 className="hero-title">Panel owner yang fokus ke pembuatan dan aktivasi lisensi.</h1>
        <div className="hero-copy">
          Halaman ini dipersempit agar fokus ke alur yang Anda butuhkan sekarang: membuat license,
          melihat status aktivasi, dan membuka link aktivasi guru.
        </div>
        <div className="hero-actions">
          <Link href="/licenses" className="button primary">
            Kelola Lisensi
          </Link>
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      <section className="grid-2">
        <article className="card">
          <div className="brand-kicker">Lisensi Aktif</div>
          <div style={{ fontSize: "34px", fontWeight: 800 }}>{activeLicenses}</div>
          <p className="card-copy">{usedLicenses} lisensi sudah dipakai atau nonaktif.</p>
        </article>
        <article className="card">
          <div className="brand-kicker">Log Provisioning</div>
          <div style={{ fontSize: "34px", fontWeight: 800 }}>{data.provisioningLogs.length}</div>
          <p className="card-copy">Log terbaru dari proses aktivasi dan pembuatan spreadsheet.</p>
        </article>
      </section>

      <section className="card">
        <h2 className="card-title">Alur yang Dipakai</h2>
        <div>
          {provisioningSteps.map((step, index) => (
            <p key={step} className="card-copy">
              <strong>{index + 1}.</strong> {step}
            </p>
          ))}
        </div>
      </section>

      <section className="table-card">
        <div className="table-head">
          <h2 className="table-title">Lisensi Terbaru</h2>
          <Link href="/licenses" className="button">
            Buka Halaman Lisensi
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>License Key</th>
              <th>Guru</th>
              <th>Sekolah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.licenses.slice(0, 8).map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.teacherName || "-"}</td>
                <td>{item.schoolName || "-"}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.licenses.length ? (
          <div className="empty-state">Belum ada data lisensi yang terbaca dari Firestore.</div>
        ) : null}
      </section>
    </>
  );
}
