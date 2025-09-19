"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/attendance", label: "Atendimentos" },
  { href: "/agenda", label: "Agenda" },
  { href: "/patients", label: "Pacientes" },
  { href: "/treatment-tracking", label: "Tratamentos" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="w-full flex flex-row items-center justify-center py-4 px-2 bg-[color:var(--surface)] z-20 sticky top-0">
      <div className="flex w-full bg-gray-50 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e2e8f0] z-0"></div>
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
