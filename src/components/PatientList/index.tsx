"use client";

import React from "react";
import { usePatientList } from "./usePatientList";
import Link from "next/link";

const PatientList: React.FC = () => {
  const {
    search,
    setSearch,
    sortBy,
    sortAsc,
    loaderRef,
    filtered,
    handleSort,
    paginated,
    statusLegend,
    priorityLegend,
  } = usePatientList();

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[color:var(--primary-dark)]">
            Pacientes <span>({filtered.length})</span>
          </h2>
          <Link href="/patients/new" className="button button-primary ml-4">
            + Novo Paciente
          </Link>
        </div>
        <div className="sticky top-[73px] z-20 bg-[color:var(--surface)] pb-2">
          <input
            className="input mb-2 mt-4"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="table w-full text-primary-dark mt-4">
          <thead className="h-10 sticky top-[146px] z-10 bg-[color:var(--surface)]">
            <tr className="bg-[color:var(--light)]">
              <th className="cursor-pointer" onClick={() => handleSort("id")}>
                Registro {sortBy === "id" && (sortAsc ? "▲" : "▼")}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("name")}>
                Nome {sortBy === "name" && (sortAsc ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("phone")}
              >
                Telefone {sortBy === "phone" && (sortAsc ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                Prioridade {sortBy === "priority" && (sortAsc ? "▲" : "▼")}
              </th>
              <th
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {sortBy === "status" && (sortAsc ? "▲" : "▼")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr
                key={p.id}
                className="transition-colors hover:bg-[color:var(--primary-light)]/40 cursor-pointer h-8"
                onClick={() => (window.location.href = `/patients/${p.id}`)}
              >
                <td className="text-center">{p.id}</td>
                <td>{p.name}</td>
                <td className="text-center">{p.phone}</td>
                <td className="text-center">
                  <span className="relative group">
                    {p.priority}
                    <span className="legend-tag">
                      {priorityLegend[p.priority]}
                    </span>
                  </span>
                </td>
                <td className="text-center">
                  <span className="relative group">
                    {p.status}
                    <span className="legend-tag">{statusLegend[p.status]}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={loaderRef}></div>
      </div>
      {/* Status Legend */}
      <div className="max-w-2xl mx-auto mt-6 p-3 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] text-sm flex flex-wrap gap-4 items-center">
        <span className="font-semibold text-[color:var(--primary-dark)]">
          Legenda de Status:
        </span>
        <span>
          <span className="font-bold">N</span>: Novo
        </span>
        <span>
          <span className="font-bold">I</span>: Inativo
        </span>
        <span>
          <span className="font-bold">A</span>: Ativo
        </span>
        <span>
          <span className="font-bold">T</span>: Tratamento
        </span>
        <span>
          <span className="font-bold">F</span>: Finalizado
        </span>
      </div>
      {/* Priority Legend */}
      <div className="max-w-2xl mx-auto mt-2 p-3 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] text-sm flex flex-wrap gap-4 items-center mb-12">
        <span className="font-semibold text-[color:var(--primary-dark)]">
          Legenda de Prioridade:
        </span>
        <span>
          <span className="font-bold">N</span>: Normal
        </span>
        <span>
          <span className="font-bold">I</span>: Idoso
        </span>
        <span>
          <span className="font-bold">E</span>: Emergência
        </span>
      </div>
    </>
  );
};

export default PatientList;
