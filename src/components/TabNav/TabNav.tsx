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
            className={`button text-center px-6 py-2 rounded-b-none border-b-4 transition-all duration-150 ${
              isActive
                ? "button-primary border-b-[color:var(--primary-dark)] shadow-none"
                : "bg-transparent text-[color:var(--primary-dark)] border-b-transparent hover:bg-[color:var(--primary-light)]"
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
