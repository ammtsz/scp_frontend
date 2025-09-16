"use client";

import PatientForm from "@/components/PatientForm";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function NewPatientPage() {
  const breadcrumbItems = [
    { label: "Pacientes", href: "/patients" },
    { label: "Cadastro de Paciente", isActive: true },
  ];

  return (
    <div className="flex flex-col gap-8 my-16">
      <div className="max-w-4xl mx-auto w-full px-4">
        <Breadcrumb items={breadcrumbItems} />
        <PatientForm />
      </div>
    </div>
  );
}
