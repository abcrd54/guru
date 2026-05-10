import { ConfigAlert } from "@/components/config-alert";
import { getAppSettings } from "@/lib/firestore-data";
import { saveWhatsappSettingsAction, sendWhatsappTestAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function WhatsappPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; message?: string }>;
}) {
  const data = await getAppSettings();
  const params = searchParams ? await searchParams : undefined;
  const status = params?.status || "";
  const message = params?.message || "";

  return (
    <>
      <section className="hero">
        <div className="brand-kicker">WhatsApp</div>
        <h1 className="hero-title">Konfigurasi operasional WhatsApp untuk aktivasi guru.</h1>
        <div className="hero-copy">
          Gunakan halaman ini untuk menyimpan endpoint provider, token, dan nama template pesan tanpa mengubah env server.
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      {message ? (
        <section className="card">
          <h2 className="card-title">{status === "ok" ? "Tes WhatsApp Berhasil" : "Tes WhatsApp Gagal"}</h2>
          <p className="card-copy">{message}</p>
        </section>
      ) : null}

      <section className="card">
        <h2 className="card-title">Provider dan Template Pesan</h2>
        <p className="card-copy">
          Nilai ini disimpan di Firestore agar mudah diubah owner saat ada perubahan provider atau template.
        </p>
        <form action={saveWhatsappSettingsAction} className="grid-2">
          <label className="field">
            <span>Provider URL</span>
            <input name="whatsappProviderUrl" defaultValue={data.settings.whatsappProviderUrl} placeholder="https://provider-whatsapp.example/send" />
          </label>
          <label className="field">
            <span>Provider Token</span>
            <input name="whatsappProviderToken" defaultValue={data.settings.whatsappProviderToken} placeholder="token-provider" />
          </label>
          <label className="field">
            <span>Template Aktivasi</span>
            <input name="whatsappTemplateActivation" defaultValue={data.settings.whatsappTemplateActivation} placeholder="aktivasi_guru" />
          </label>
          <label className="field">
            <span>Template Spreadsheet Siap</span>
            <input name="whatsappTemplateReady" defaultValue={data.settings.whatsappTemplateReady} placeholder="spreadsheet_siap" />
          </label>
          <div>
            <button type="submit" className="button primary">
              Simpan Konfigurasi WhatsApp
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Tes Kirim WhatsApp</h2>
        <p className="card-copy">
          Gunakan form ini untuk memastikan konfigurasi Fonnte benar sebelum membuat lisensi guru.
        </p>
        <form action={sendWhatsappTestAction} className="grid-2">
          <label className="field">
            <span>Nomor WhatsApp Test</span>
            <input name="testPhone" placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx" />
          </label>
          <label className="field">
            <span>Pesan Test</span>
            <input name="testMessage" defaultValue="Tes koneksi WhatsApp dari SiapGuru Owner." />
          </label>
          <div>
            <button type="submit" className="button primary">
              Kirim Pesan Test
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
