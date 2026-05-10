import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { OwnerShell } from "@/components/owner-shell";

export const metadata: Metadata = {
  title: "SiapGuru Owner",
  description: "Dashboard owner/admin untuk provisioning guru dan spreadsheet."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <OwnerShell>{children}</OwnerShell>
      </body>
    </html>
  );
}
