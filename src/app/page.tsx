import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-3xl font-bold mb-6">
        MVP Center - Sistema de Atendimento
      </h1>
      <nav className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/patients">
          <span className="block w-full p-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-center">
            Pacientes
          </span>
        </Link>
        <Link href="/patients/new">
          <span className="block w-full p-4 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center">
            Novo Paciente
          </span>
        </Link>
        <Link href="/agenda">
          <span className="block w-full p-4 bg-purple-600 text-white rounded shadow hover:bg-purple-700 text-center">
            Agenda
          </span>
        </Link>
        <Link href="/attendance">
          <span className="block w-full p-4 bg-yellow-600 text-white rounded shadow hover:bg-yellow-700 text-center">
            Lista de Atendimentos
          </span>
        </Link>
        <Link href="/patients/history">
          <span className="block w-full p-4 bg-gray-600 text-white rounded shadow hover:bg-gray-700 text-center">
            Histórico de Atendimentos
          </span>
        </Link>
      </nav>
    </div>
  );
}
