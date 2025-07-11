"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import { formatDateBR } from "@/utils/dateHelpers";
import AttendancesDropdown from "@/components/AttendancesDropdown/index";
// import { usePatients } from "@/contexts/PatientsContext";
import {
  mockPatient_1,
  mockPatient_2,
  mockPatient_3,
  mockPatient_4,
  mockPatient_5,
} from "@/services/mockData";
import { useAttendances } from "@/contexts/AttendancesContext";
import { IPatient } from "@/types/db";

const mockPatientById = {
  "1": mockPatient_1,
  "2": mockPatient_2,
  "3": mockPatient_3,
  "4": mockPatient_4,
  "5": mockPatient_5,
};

export default function PatientDetailPage() {
  const params = useParams();
  // const { patients } = usePatients();
  const { attendances } = useAttendances();
  // const patient = patients.find((p) => p.id === params.id);
  const patient: IPatient =
    mockPatientById[params.id as "1" | "2" | "3" | "4" | "5"];

  if (!patient) {
    return (
      <div>
        <Link href="/patients" className="button button-link">
          Voltar
        </Link>
        <div className="text-red-600">Paciente não encontrado.</div>
      </div>
    );
  }

  // Find previous and future attendances for this patient
  const allAttendances = attendances.filter((a) =>
    a.patients.includes(patient.name)
  );
  const today = new Date().toISOString().slice(0, 10);
  // const previous = allAttendances.filter((a) => a.date < today); // not used
  const future = allAttendances.filter((a) => a.date >= today);

  return (
    <>
      <Link href="/patients" className="button button-link mb-4 inline-block">
        Voltar
      </Link>
      <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-[color:var(--primary-dark)]">
            {patient.name}
          </h2>
          <Link
            href={`/patients/${patient.id}/edit`}
            className="button button-secondary"
          >
            Editar
          </Link>
        </div>
        <div className="mb-4 text-sm text-gray-700">
          <div>
            <b>Registro:</b> {patient.id}
          </div>
          <div>
            <b>Data de nascimento:</b>{" "}
            {formatDateBR(
              patient.birthDate?.toISOString?.() ?? String(patient.birthDate)
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
                patient.startDate.toISOString?.() ?? String(patient.startDate)
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
            <AttendancesDropdown attendances={patient.previousAttendances} />
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
              {future.map((a, i) => (
                <li key={a.date + i}>
                  {formatDateBR(a.date)} (
                  {a.type === "spiritual"
                    ? "Consulta Espiritual"
                    : "Banho de Luz/Bastão"}
                  )
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">
              Nenhum atendimento futuro.
            </div>
          )}
        </div>
        {/* Notes textarea at the bottom */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-[color:var(--primary-dark)] mb-1">
            Notas sobre o paciente
          </label>
          <textarea
            className="textarea w-full"
            rows={3}
            placeholder="Adicione observações ou informações importantes..."
          />
        </div>
      </div>
    </>
  );
}
