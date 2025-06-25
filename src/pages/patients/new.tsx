import PatientForm from "@/components/PatientForm/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="bg-amber-400 m-6 p-6 rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-4">New Patient</div>
      <PatientForm />
    </div>
  );
}
