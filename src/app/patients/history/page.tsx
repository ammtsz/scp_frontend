"use client";

import TreatmentHistory from "@/components/TreatmentHistory/TreatmentHistory";
import Link from "next/link";

export default function PatientHistoryPage() {
  return (
    <div>
      <Link href="/patients" className="button-link mb-4 inline-block w-auto">
        ← Voltar
      </Link>
      <TreatmentHistory />
    </div>
  );
}
