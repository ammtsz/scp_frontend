"use client";

import React from "react";
import { usePatientList } from "./usePatientList";
import Link from "next/link";
import { ChevronUp, ChevronDown, Filter } from "react-feather";

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
    loading,
    error,
    refreshPatients,
  } = usePatientList();

  if (loading) {
    return (
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Pacientes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Carregando lista de pacientes...
          </p>
        </div>
        <div className="p-8 text-center">Carregando pacientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Pacientes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Erro ao carregar lista de pacientes
          </p>
        </div>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => refreshPatients()}
            className="button button-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Pacientes{" "}
                <span className="text-sm text-gray-600">
                  ({filtered.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie e visualize todos os pacientes cadastrados
              </p>
            </div>
            <Link href="/patients/new" className="button button-primary">
              + Novo Paciente
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <input
              className="input w-full"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full text-primary-dark">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="cursor-pointer text-center p-3"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Registro
                      {sortBy === "id" ? (
                        sortAsc ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <Filter size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer text-left p-3"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Nome
                      {sortBy === "name" ? (
                        sortAsc ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <Filter size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer text-center p-3"
                    onClick={() => handleSort("phone")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Telefone
                      {sortBy === "phone" ? (
                        sortAsc ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <Filter size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer text-center p-3"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Prioridade
                      {sortBy === "priority" ? (
                        sortAsc ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <Filter size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer text-center p-3"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Status
                      {sortBy === "status" ? (
                        sortAsc ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <Filter size={16} className="text-gray-400" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => (window.location.href = `/patients/${p.id}`)}
                  >
                    <td className="p-3 text-center">{p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3 text-center">{p.phone}</td>
                    <td className="p-3 text-center">
                      <span className="relative group">
                        {p.priority}
                        <span className="legend-tag">
                          {priorityLegend[p.priority]}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="relative group">
                        {p.status}
                        <span className="legend-tag">
                          {statusLegend[p.status]}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div ref={loaderRef}></div>
        </div>
      </div>

      {/* Legends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Legend */}
        <div className="card-shadow">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Legenda de Status:
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <span className="font-bold">T</span>: Em Tratamento
              </span>
              <span>
                <span className="font-bold">A</span>: Alta Médica
              </span>
              <span>
                <span className="font-bold">F</span>: Faltas Consecutivas
              </span>
            </div>
          </div>
        </div>

        {/* Priority Legend */}
        <div className="card-shadow">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Legenda de Prioridade:
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <span className="font-bold">1</span>: Exceção
              </span>
              <span>
                <span className="font-bold">2</span>: Idoso/crianças
              </span>
              <span>
                <span className="font-bold">3</span>: Padrão
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientList;
