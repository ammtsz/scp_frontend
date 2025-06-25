"use client";

import React, { useState } from "react";

// Mock attendance list data
const mockAttendance = [
  { date: "2025-07-01", type: "spiritual", patients: ["Maria Silva"] },
  { date: "2025-07-01", type: "lightBath", patients: ["Maria Silva"] },
];

const AttendanceList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance] = useState(mockAttendance);

  // TODO: Replace with real logic and API integration
  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)]">
        Lista de Atendimentos
      </h2>
      <input
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div>
        {attendance
          .filter((a) => !selectedDate || a.date === selectedDate)
          .map((a, idx) => (
            <div
              key={idx}
              className="mb-2 p-2 border rounded border-[color:var(--border)] bg-[color:var(--surface)]"
            >
              <div>
                <b>Data:</b> {a.date}
              </div>
              <div>
                <b>Tipo:</b>{" "}
                {a.type === "spiritual"
                  ? "Consulta Espiritual"
                  : "Banho de Luz/Bastão"}
              </div>
              <div>
                <b>Pacientes:</b> {a.patients.join(", ")}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AttendanceList;
