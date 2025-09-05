"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatDateBR } from "@/utils/dateHelpers";
import Breadcrumb from "@/components/Breadcrumb";
import { AttendancesDropdown } from "@/components/AttendanceManagement/components";
import { getPatientById } from "@/api/patients";
import { transformSinglePatientFromApi } from "@/utils/apiTransformers";
import { IPatient } from "@/types/globals";

export default function PatientDetailPage() {
  const params = useParams();
  // TODO: We'll implement patient-specific attendances loading later
  // For now, we'll just show the patient details without attendances integration
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getPatientById(params.id as string);

        if (result.success && result.value) {
          const transformedPatient = transformSinglePatientFromApi(
            result.value
          );
          setPatient(transformedPatient);
        } else {
          setError(result.error || "Erro ao carregar paciente");
        }
      } catch {
        setError("Erro ao carregar paciente");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              { label: "Carregando...", isActive: true },
            ]}
          />
          <div className="card-shadow">
            <div className="p-8 text-center">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              { label: "Erro", isActive: true },
            ]}
          />
          <div className="card-shadow">
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <Link href="/patients" className="button button-primary">
                Voltar para Pacientes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              { label: "Não encontrado", isActive: true },
            ]}
          />
          <div className="card-shadow">
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">Paciente não encontrado.</div>
              <Link href="/patients" className="button button-primary">
                Voltar para Pacientes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TODO: Filter attendances for this patient when we have proper attendance structure
  const future: unknown[] = []; // Temporarily empty until we implement patient-specific attendance loading

  return (
    <div className="flex flex-col gap-8 my-16">
      <div className="max-w-4xl mx-auto w-full px-4">
        <Breadcrumb
          items={[
            { label: "Pacientes", href: "/patients" },
            { label: patient.name, isActive: true },
          ]}
        />
        <div className="card-shadow">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {patient.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detalhes do paciente
                </p>
              </div>
              <Link
                href={`/patients/${patient.id}/edit`}
                className="button button-secondary"
              >
                Editar
              </Link>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 text-sm text-gray-700">
              <div>
                <b>Registro:</b> {patient.id}
              </div>
              <div>
                <b>Data de nascimento:</b>{" "}
                {formatDateBR(
                  patient.birthDate?.toISOString?.() ??
                    String(patient.birthDate)
                )}
              </div>
              <div>
                <b>Telefone:</b> {patient.phone}
              </div>
              <div>
                <b>Prioridade:</b> {patient.priority}
              </div>
              <div>
                <b>Status:</b> {patient.status}
              </div>
              <div>
                <b>Queixa principal:</b> {patient.mainComplaint}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-[color:var(--primary)] mb-1">
                Consulta Espiritual
              </h3>
              <div className="text-sm">
                <div>
                  <b>Início:</b>{" "}
                  {formatDateBR(
                    patient.startDate.toISOString?.() ??
                      String(patient.startDate)
                  )}
                </div>
                <div>
                  <b>Próxima:</b>{" "}
                  {formatDateBR(
                    patient.nextAttendanceDates[0]?.date?.toISOString?.() ??
                      String(patient.nextAttendanceDates[0]?.date)
                  )}
                </div>
                <div>
                  <b>Alta:</b>{" "}
                  {formatDateBR(
                    patient.dischargeDate?.toISOString?.() ??
                      String(patient.dischargeDate)
                  ) || "-"}
                </div>
                <div>
                  <b>
                    Últimas Recomendações{" ("}
                    {patient.currentRecommendations.date.toLocaleDateString(
                      "pt-BR"
                    )}
                    {")"}:
                  </b>
                </div>
                <ul className="ml-4 list-disc">
                  <li>
                    <b>Alimentação:</b> {patient.currentRecommendations.food}
                  </li>
                  <li>
                    <b>Água:</b> {patient.currentRecommendations.water}
                  </li>
                  <li>
                    <b>Pomada:</b> {patient.currentRecommendations.ointment}
                  </li>
                  <li>
                    <b>Banho de luz:</b>{" "}
                    {patient.currentRecommendations.lightBath ? "Sim" : "Não"}
                  </li>
                  <li>
                    <b>Bastão:</b>{" "}
                    {patient.currentRecommendations.rod ? "Sim" : "Não"}
                  </li>
                  <li>
                    <b>Tratamento espiritual:</b>{" "}
                    {patient.currentRecommendations.spiritualTreatment
                      ? "Sim"
                      : "Não"}
                  </li>
                  <li>
                    <b>Retorno (semanas):</b>{" "}
                    {patient.currentRecommendations.returnWeeks}
                  </li>
                </ul>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-[color:var(--primary)] mb-1">
                Atendimentos Anteriores
              </h3>
              {patient.previousAttendances.length > 0 ? (
                <AttendancesDropdown
                  attendances={patient.previousAttendances}
                />
              ) : (
                <div className="text-sm text-gray-500">
                  Nenhum atendimento anterior.
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--primary)] mb-1">
                Próximos Atendimentos
              </h3>
              {future.length > 0 ? (
                <ul className="ml-4 list-disc text-sm">
                  {/* TODO: Update this when we have proper attendance structure */}
                  {/* {future.map((a, i) => (
                <li key={a.date.toISOString() + i}>
                  {formatDateBR(a.date.toISOString())} (
                  {a.type === "spiritual"
                    ? "Consulta Espiritual"
                    : "Banho de Luz/Bastão"}
                  )
                </li>
              ))} */}
                  <li>Atendimentos futuros serão exibidos aqui</li>
                </ul>
              ) : (
                <div className="text-sm text-gray-500">
                  Nenhum atendimento futuro.
                </div>
              )}
            </div>
            {/* Notes textarea at the bottom */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Notas sobre o paciente
              </label>
              <textarea
                className="input w-full min-h-[80px] resize-y"
                placeholder="Adicione observações ou informações importantes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
