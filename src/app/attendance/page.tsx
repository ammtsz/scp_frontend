"use client";

import AttendanceList from "@/components/AttendanceList";
import UnscheduledPatients from "@/components/UnscheduledPatients";
import { IPriority } from "@/types/globals";
import React, { useState } from "react";

export default function AttendancePage() {
  const [externalCheckIn, setExternalCheckIn] = useState<{
    name: string;
    types: string[];
    isNew: boolean;
    priority: IPriority;
  } | null>(null);

  return (
    <div className="flex flex-col gap-8 my-16">
      {/* Walk-in Patients Check-in */}
      <UnscheduledPatients
        onRegisterNewAttendance={(name, types, isNew, priority) =>
          setExternalCheckIn({ name, types, isNew, priority })
        }
      />

      {/* Attendance Management Board */}
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Quadro de Atendimentos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie o fluxo de atendimentos arrastando e soltando o nome dos
            pacientes. Use o botão{" "}
            <span className="font-bold text-red-700">x</span> para remover
            agendamentos.
          </p>
        </div>
        <div className="p-4">
          <AttendanceList
            externalCheckIn={externalCheckIn}
            onCheckInProcessed={() => setExternalCheckIn(null)}
          />
        </div>
      </div>
    </div>
  );
}
