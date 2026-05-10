export type NavItem = {
  href: string;
  label: string;
  badge?: string;
};

export const ownerNavigation = {
  utama: [
    { href: "/", label: "Dashboard" },
    { href: "/licenses", label: "Lisensi", badge: "Core" }
  ],
  operasional: [
    { href: "/whatsapp", label: "WhatsApp" },
    { href: "/settings", label: "Pengaturan" }
  ]
};
