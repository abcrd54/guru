import { ConfigAlert } from "@/components/config-alert";
import { getDashboardData } from "@/lib/firestore-data";

export const dynamic = "force-dynamic";

export default async function ProvisioningPage() {
  const data = await getDashboardData();
  return (
    <>
      <section className="hero">
        <div className="brand-kicker">Provisioning</div>
        <h1 className="hero-title">Monitor aktivasi guru dan pembuatan spreadsheet otomatis.</h1>
        <div className="hero-copy">
          Halaman ini akan menampung log aktivasi, hasil copy template, status share spreadsheet, dan retry jika ada proses gagal.
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      <section className="table-card">
        <div className="table-head">
          <h2 className="table-title">Log Provisioning</h2>
          <div className="stats-row">
            <span className="pill success">Data nyata</span>
            <span className="pill">Firestore</span>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>License</th>
              <th>Guru</th>
              <th>Status</th>
              <th>Pesan</th>
            </tr>
          </thead>
          <tbody>
            {data.provisioningLogs.map((item) => (
              <tr key={item.id}>
                <td>{item.createdAt}</td>
                <td>{item.licenseKey || "-"}</td>
                <td>{item.teacherName || "-"}</td>
                <td>{item.status || "-"}</td>
                <td>{item.message || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.provisioningLogs.length ? (
          <div className="empty-state">
            Belum ada log provisioning. Jika koleksi <code>provisioning_logs</code> belum dibuat, halaman ini akan kosong.
          </div>
        ) : null}
      </section>
    </>
  );
}
