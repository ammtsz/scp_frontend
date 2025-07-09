"use client";

import AttendanceList from "@/components/AttendanceList";
import CheckIn from "@/components/CheckIn";
import React, { useState } from "react";

export default function AttendancePage() {
  const [externalCheckIn, setExternalCheckIn] = useState<{
    name: string;
    types: string[];
    isNew: boolean;
  } | null>(null);

  return (
    <div className="flex">
      <div className="flex w-full flex-col gap-8">
        <CheckIn
          onCheckIn={(name, types, isNew) =>
            setExternalCheckIn({ name, types, isNew })
          }
        />
        <div className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
          Em atendimento
          <div>Consulta Espiritual</div>
          <div>Banho de Luz/Bastão</div>
        </div>
        <div className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
          Próximo na fila
          <div>Consulta Espiritual</div>
          <div>Banho de Luz/Bastão</div>
        </div>
      </div>
      <AttendanceList externalCheckIn={externalCheckIn} />
    </div>
  );
}
