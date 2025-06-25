"use client";

import React, { useState, useEffect } from "react";
import { Patient } from "@/types/patient";
import Link from "next/link";
import { mockPatients } from "@/services/mockData";

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Patient | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setPatients(mockPatients);
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key: keyof Patient) => {
    if (sortBy === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (aValue === bValue) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortAsc ? aValue - bValue : bValue - aValue;
    }
    return sortAsc
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)]">
        Pacientes
      </h2>
      <input
        className="input mb-4"
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="table w-full text-blue-900">
        <thead>
          <tr className="bg-[color:var(--primary-light)] text-blue-900">
            <th
              className="cursor-pointer"
              onClick={() => handleSort("registrationNumber")}
            >
              Registro{" "}
              {sortBy === "registrationNumber" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="cursor-pointer" onClick={() => handleSort("name")}>
              Nome {sortBy === "name" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="cursor-pointer" onClick={() => handleSort("phone")}>
              Telefone {sortBy === "phone" && (sortAsc ? "▲" : "▼")}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort("priority")}
            >
              Prioridade {sortBy === "priority" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="cursor-pointer" onClick={() => handleSort("status")}>
              Status {sortBy === "status" && (sortAsc ? "▲" : "▼")}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.id}
              className="transition-colors hover:bg-[color:var(--primary-light)]/40 cursor-pointer"
            >
              <td>{p.registrationNumber}</td>
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.priority}</td>
              <td>{p.status}</td>
              <td>
                <Link
                  href={`/patients/${p.id}`}
                  className="button-link py-1 px-2 w-auto min-w-0 text-sm"
                >
                  + detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Status Legend */}
      <div className="mt-6 p-3 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] text-sm flex flex-wrap gap-4 items-center">
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
      <div className="mt-2 p-3 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] text-sm flex flex-wrap gap-4 items-center">
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
    </div>
  );
};

export default PatientList;
