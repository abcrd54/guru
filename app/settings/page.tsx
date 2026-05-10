import { ConfigAlert } from "@/components/config-alert";
import { getAppSettings } from "@/lib/firestore-data";
import { saveOwnerSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await getAppSettings();

  return (
    <>
      <section className="hero">
        <div className="brand-kicker">Pengaturan</div>
        <h1 className="hero-title">Konfigurasi operasional owner app.</h1>
        <div className="hero-copy">
          Halaman ini dipakai untuk pengaturan yang wajar diubah dari dashboard tanpa menyentuh <code>.env.local</code>.
        </div>
      </section>

      {!data.configured ? <ConfigAlert /> : null}

      <section className="card">
        <h2 className="card-title">Template dan Aktivasi</h2>
        <p className="card-copy">
          Simpan konfigurasi template spreadsheet master dan base URL aktivasi guru di Firestore collection <code>app_settings</code>.
        </p>
        <form action={saveOwnerSettingsAction} className="grid-2">
          <label className="field">
            <span>Template Spreadsheet ID</span>
            <input name="templateSpreadsheetId" defaultValue={data.settings.templateSpreadsheetId} placeholder="1xxxxxxxxxxxxxxxxxxxxxxxx" />
          </label>
          <label className="field">
            <span>Activation Base URL</span>
            <input name="activationBaseUrl" defaultValue={data.settings.activationBaseUrl} placeholder="https://domain-anda.com/activate" />
          </label>
          <div>
            <button type="submit" className="button primary">
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
