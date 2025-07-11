"use client";

import React from "react";
import { useAttendanceList } from "./useAttendanceList";

const AttendanceList: React.FC<{
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null;
}> = ({ externalCheckIn }) => {
  const { attendances } = useAttendanceList(externalCheckIn);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)] flex items-center gap-2">
        Atendimentos de{" "}
      </h2>
      <input
        type="date"
        className="input mb-4"
        value={undefined}
        onChange={() => {}}
        lang="pt-BR"
      />
      <div className="flex flex-col gap-8 w-full">
        {(["spiritual", "lightBath"] as const).map((type) => (
          <div key={type} className="w-full">
            <div className="flex flex-row gap-4 w-full">
              {/* Scheduled section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-yellow-700 text-center">
                  Agendados
                </div>
                <ul>
                  {attendances[0][type]["scheduled"].map((patient) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                      onDragEnd={() => {}}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-yellow-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none`}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
              {/* Checked-in section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-blue-700 text-center">
                  Sala de Espera
                </div>
                <ul>
                  {attendances[0][type]["checkedIn"].map((patient) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                      onDragEnd={() => {}}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-blue-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none`}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
              {/* OnGoing section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-purple-700 text-center">
                  Em Atendimento
                </div>
                <ul>
                  {attendances[0][type]["onGoing"].map((patient) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                      onDragEnd={() => {}}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-purple-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none `}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
              {/* Completed section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-green-700 text-center">
                  Atendidos
                </div>
                <ul>
                  {attendances[0][type]["completed"].map((patient) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() => {}}
                      onDragOver={() => {}}
                      onDrop={() => {}}
                      onDragEnd={() => {}}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-green-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none`}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceList;
