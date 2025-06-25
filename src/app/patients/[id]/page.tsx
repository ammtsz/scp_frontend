"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { mockPatients, mockAttendance } from "@/services/mockData";
import React, { useState } from "react";
import type { Attendance } from "@/types/patient";

export default function PatientDetailPage() {
  const params = useParams();
  const patient = mockPatients.find((p) => p.id === params.id);

  if (!patient) {
    return (
      <div>
        <Link href="/patients" className="button-link mb-4 inline-block w-auto">
          ← Voltar
        </Link>
        <div className="text-red-600">Paciente não encontrado.</div>
      </div>
    );
  }

  // Find previous and future attendances for this patient
  const allAttendances = mockAttendance.filter((a) =>
    a.patients.includes(patient.name)
  );
  const today = new Date().toISOString().slice(0, 10);
  const previous = allAttendances.filter((a) => a.date < today);
  const future = allAttendances.filter((a) => a.date >= today);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <Link href="/patients" className="button-link mb-4 inline-block w-auto">
        ← Voltar
      </Link>
      <h2 className="text-2xl font-bold mb-2 text-[color:var(--primary-dark)]">
        {patient.name}
      </h2>
      <div className="mb-4 text-sm text-gray-700">
        <div>
          <b>Registro:</b> {patient.registrationNumber}
        </div>
        <div>
          <b>Data de nascimento:</b> {patient.birthDate}
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
            <b>Início:</b> {patient.spiritualConsultation.startDate}
          </div>
          <div>
            <b>Próxima:</b> {patient.spiritualConsultation.nextDate}
          </div>
          <div>
            <b>Alta:</b> {patient.spiritualConsultation.dischargeDate || "-"}
          </div>
          <div>
            <b>Recomendações:</b>
          </div>
          <ul className="ml-4 list-disc">
            <li>
              <b>Alimentação:</b>{" "}
              {patient.spiritualConsultation.recommendations.food}
            </li>
            <li>
              <b>Água:</b> {patient.spiritualConsultation.recommendations.water}
            </li>
            <li>
              <b>Pomada:</b>{" "}
              {patient.spiritualConsultation.recommendations.ointment}
            </li>
            <li>
              <b>Banho de luz:</b>{" "}
              {patient.spiritualConsultation.recommendations.lightBath
                ? "Sim"
                : "Não"}
            </li>
            <li>
              <b>Bastão:</b>{" "}
              {patient.spiritualConsultation.recommendations.rod
                ? "Sim"
                : "Não"}
            </li>
            <li>
              <b>Tratamento espiritual:</b>{" "}
              {patient.spiritualConsultation.recommendations.spiritualTreatment
                ? "Sim"
                : "Não"}
            </li>
            <li>
              <b>Retorno (semanas):</b>{" "}
              {patient.spiritualConsultation.recommendations.returnWeeks}
            </li>
          </ul>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-[color:var(--primary)] mb-1">
          Atendimentos Anteriores
        </h3>
        {patient.attendances && patient.attendances.length > 0 ? (
          <AttendancesDropdown attendances={patient.attendances} />
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
                {a.date} (
                {a.type === "spiritual" ? "Espiritual" : "Banho de Luz/Bastão"})
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">
            Nenhum atendimento futuro.
          </div>
        )}
      </div>
    </div>
  );
}

// Dropdown component for attendances
function AttendancesDropdown({ attendances }: { attendances: Attendance[] }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const toggle = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  return (
    <ul className="ml-4 list-none text-sm">
      {attendances.map((att: Attendance, i: number) => (
        <li
          key={att.date + i}
          className="mb-2 border-b border-[color:var(--border)]"
        >
          <button
            type="button"
            className="w-full text-left py-2 px-2 bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)] rounded flex justify-between items-center"
            onClick={() => toggle(i)}
          >
            <span>
              <b>Data:</b> {att.date} <b>Status:</b> {att.status}
            </span>
            <span className="ml-2 text-[color:var(--primary)]">
              {openIndexes.includes(i) ? "▲" : "▼"}
            </span>
          </button>
          {openIndexes.includes(i) && (
            <div className="pl-4 py-2">
              {att.notes && (
                <div>
                  <b>Notas:</b> {att.notes}
                </div>
              )}
              {att.recommendations && (
                <div>
                  <b>Recomendações:</b>
                  <ul className="ml-4 list-disc">
                    <li>
                      <b>Alimentação:</b> {att.recommendations.food}
                    </li>
                    <li>
                      <b>Água:</b> {att.recommendations.water}
                    </li>
                    <li>
                      <b>Pomada:</b> {att.recommendations.ointment}
                    </li>
                    <li>
                      <b>Banho de luz:</b>{" "}
                      {att.recommendations.lightBath ? "Sim" : "Não"}
                    </li>
                    <li>
                      <b>Bastão:</b> {att.recommendations.rod ? "Sim" : "Não"}
                    </li>
                    <li>
                      <b>Tratamento espiritual:</b>{" "}
                      {att.recommendations.spiritualTreatment ? "Sim" : "Não"}
                    </li>
                    <li>
                      <b>Retorno (semanas):</b>{" "}
                      {att.recommendations.returnWeeks}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
