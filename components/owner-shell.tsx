import Link from "next/link";
import type { ReactNode } from "react";
import { ownerNavigation } from "@/lib/navigation";

type OwnerShellProps = {
  children: ReactNode;
};

function NavLink({ href, label, badge }: { href: string; label: string; badge?: string }) {
  return (
    <Link href={href} className="nav-link">
      <span>{label}</span>
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </Link>
  );
}

export function OwnerShell({ children }: OwnerShellProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-kicker">Owner Console</div>
          <div className="brand-title">SiapGuru Admin</div>
          <div className="brand-copy">
            Panel utama untuk lisensi, aktivasi guru, provisioning spreadsheet, dan otomasi operasional.
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section">Utama</div>
          {ownerNavigation.utama.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          <div className="nav-section">Operasional</div>
          {ownerNavigation.operasional.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
