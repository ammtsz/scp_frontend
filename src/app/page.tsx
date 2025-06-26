import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 bg-[color:var(--background)]">
      <h1 className="text-3xl font-bold mb-6 text-[color:var(--primary-dark)]">
        MVP Center - Sistema de Atendimento
      </h1>
      <nav className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/patients">
          <span className="button button-primary">Pacientes</span>
        </Link>
        <Link href="/patients/new">
          <span className="button button-secondary">Novo Paciente</span>
        </Link>
        <Link href="/agenda">
          <span className="button button-primary">Agenda</span>
        </Link>
        <Link href="/attendance">
          <span className="button button-secondary">Atendimentos</span>
        </Link>
        <Link href="/patients/history">
          <span className="button button-link">Histórico</span>
        </Link>
      </nav>
    </div>
  );
}
