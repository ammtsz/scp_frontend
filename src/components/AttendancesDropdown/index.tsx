import React, { useState } from "react";
import Link from "next/link";
import { formatDateBR } from "@/utils/dateHelpers";
import { IPreviousAttendance } from "@/types/db";

interface AttendancesDropdownProps {
  attendances: IPreviousAttendance[];
}

const AttendancesDropdown: React.FC<AttendancesDropdownProps> = ({
  attendances,
}) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const toggle = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  return (
    <ul className="ml-4 list-none text-sm">
      {attendances.map((att: IPreviousAttendance, i: number) => (
        <li
          key={att.date.toISOString() + i}
          className="mb-2 border-b border-[color:var(--border)]"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="w-full text-left py-2 px-2 bg-[color:var(--surface)] hover:bg-[color:var(--surface-hover)] rounded flex justify-between items-center"
              onClick={() => toggle(i)}
            >
              <span>
                <b>Data:</b> {formatDateBR(att.date.toISOString())}
              </span>
              <span className="ml-2 text-[color:var(--primary)]">
                {openIndexes.includes(i) ? "▲" : "▼"}
              </span>
            </button>
            <Link
              href={`#`}
              className="button button-xs button-outline ml-2 cursor-not-allowed opacity-60"
              title="Editar atendimento (mock)"
              tabIndex={-1}
              aria-disabled="true"
            >
              Editar
            </Link>
          </div>
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
};

export default AttendancesDropdown;
