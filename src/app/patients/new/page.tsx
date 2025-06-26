"use client";

import PatientForm from "@/components/PatientForm";
import Link from "next/link";

export default function NewPatientPage() {
  return (
    <div>
      <Link href="/patients" className="button button-link">
        Voltar
      </Link>
      <PatientForm />
    </div>
  );
}
