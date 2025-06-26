"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/agenda", label: "Agenda" },
  { href: "/attendance", label: "Atendimentos" },
  { href: "/patients", label: "Pacientes" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex flex-row gap-2 items-center justify-center py-4 px-2 bg-[color:var(--surface)] border-b border-[color:var(--border)] z-20 sticky top-0">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`button ${
              isActive ? "button-primary" : "button-secondary"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
