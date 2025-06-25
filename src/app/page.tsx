import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-[color:var(--background)]">
      <h1 className="text-3xl font-bold mb-6 text-[color:var(--primary-dark)]">
        MVP Center - Sistema de Atendimento
      </h1>
      <nav className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/patients">
          <span className="button button-primary text-center">Pacientes</span>
        </Link>
        <Link href="/patients/new">
          <span className="button button-secondary text-center">
            Novo Paciente
          </span>
        </Link>
        <Link href="/agenda">
          <span className="button button-primary text-center">Agenda</span>
        </Link>
        <Link href="/attendance">
          <span className="button button-secondary text-center">
            Lista de Atendimentos
          </span>
        </Link>
        <Link href="/patients/history">
          <span className="button text-[color:var(--primary-dark)] bg-[color:var(--surface)] border border-[color:var(--border)] text-center">
            Histórico de Atendimentos
          </span>
        </Link>
      </nav>
    </div>
  );
}
