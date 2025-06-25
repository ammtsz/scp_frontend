"use client";

import React, { useState } from "react";

// Mock agenda data
const mockAgenda = [
  { date: "2025-07-01", type: "spiritual", patients: ["Maria Silva"] },
  { date: "2025-07-01", type: "lightBath", patients: ["Maria Silva"] },
];

const AgendaCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [agenda] = useState(mockAgenda);

  // TODO: Replace with real calendar and API integration
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Agenda</h2>
      <input
        type="date"
        className="input input-bordered mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <div>
        {agenda
          .filter((a) => !selectedDate || a.date === selectedDate)
          .map((a, idx) => (
            <div key={idx} className="mb-2 p-2 border rounded">
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

export default AgendaCalendar;
