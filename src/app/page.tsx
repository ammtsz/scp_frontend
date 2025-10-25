import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-blue-50">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            MVP Center - Sistema de Atendimento
          </h1>
          <div className="space-y-4">
            <Link
              href="/patients"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Pacientes
            </Link>
            <Link
              href="/patients/new"
              className="block w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              Novo Paciente
            </Link>
            <Link
              href="/agenda"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Agenda
            </Link>
            <Link
              href="/attendance"
              className="block w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
            >
              Atendimentos
            </Link>
            <Link
              href="/patients/history"
              className="block w-full bg-transparent text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Histórico
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
