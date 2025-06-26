import PatientList from "@/components/PatientList";
import Link from "next/link";

export default function PatientsPage() {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Link href="/patients/new" className="button button-secondary">
          Novo Paciente
        </Link>
        <Link href="/patients/history" className="button button-primary">
          Histórico
        </Link>
      </div>
      <PatientList />
    </div>
  );
}
