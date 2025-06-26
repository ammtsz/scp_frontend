"use client";

import TreatmentHistory from "@/components/TreatmentHistory/TreatmentHistory";
import Link from "next/link";

export default function PatientHistoryPage() {
  return (
    <div>
      <Link href="/patients" className="button button-link">
        Voltar
      </Link>
      <TreatmentHistory />
    </div>
  );
}
