"use client";

import React, { useState } from "react";
import { mockAgenda } from "@/services/mockData";

const TABS = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

const AgendaCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [agenda] = useState(mockAgenda);
  const [activeTab, setActiveTab] = useState("spiritual");

  const filteredAgenda = agenda.filter(
    (a) => a.type === activeTab && (!selectedDate || a.date === selectedDate)
  );

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)]">
        Agenda
      </h2>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`button px-4 py-2 rounded-t font-semibold transition-colors duration-150 ${
              activeTab === tab.key
                ? "button-primary bg-[color:var(--primary-light)] border-b-2 border-[color:var(--primary)]"
                : "button-secondary bg-[color:var(--surface-light)] border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      {/* Tab Content */}
      <div>
        {filteredAgenda.length > 0 ? (
          filteredAgenda.map((a, idx) => (
            <div
              key={a.date + "-" + activeTab + "-" + idx}
              className="mb-2 p-2 border rounded border-[color:var(--border)] bg-[color:var(--surface)]"
            >
              <div>
                <b>Data:</b> {a.date}
              </div>
              <div>
                <b>Pacientes:</b> {a.patients.join(", ")}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">
            {activeTab === "spiritual"
              ? "Nenhuma consulta espiritual encontrada."
              : "Nenhum banho de luz/bastão encontrado."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCalendar;
