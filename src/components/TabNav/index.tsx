"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/attendance", label: "Atendimentos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/patients", label: "Pacientes" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex flex-row items-center justify-center py-4 px-2 bg-[color:var(--surface)] z-20 sticky top-0">
      <div className="flex gap-0 w-full border-b border-[color:var(--border)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab-button${
                isActive ? " active" : ""
              } flex-1 text-center`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
