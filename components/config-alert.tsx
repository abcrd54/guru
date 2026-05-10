export function ConfigAlert() {
  return (
    <section className="card">
      <h2 className="card-title">Firebase Admin belum terhubung</h2>
      <p className="card-copy">
        Isi environment di <code>.env.local</code> dengan <code>FIREBASE_PROJECT_ID</code>,{" "}
        <code>FIREBASE_CLIENT_EMAIL</code>, dan <code>FIREBASE_PRIVATE_KEY</code> agar halaman owner menampilkan data nyata.
      </p>
    </section>
  );
}
