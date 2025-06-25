"use client";

import PatientForm from "@/components/PatientForm/PatientForm";
import Link from "next/link";

export default function NewPatientPage() {
  return (
    <div>
      <Link href="/patients" className="button-link mb-4 inline-block w-auto">
        ← Voltar
      </Link>
      <PatientForm />
    </div>
  );
}
