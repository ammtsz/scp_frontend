import React from "react";
import {
  Patient,
  TreatmentHistory as TreatmentHistoryType,
} from "@/types/patient";

// Mock data for demonstration
const mockHistory: TreatmentHistoryType[] = [
  // Add mock treatment history objects as needed
];

const TreatmentHistory: React.FC<{ patient?: Patient }> = ({ patient }) => {
  // TODO: Replace with real data from patient prop or API
  const history = patient?.history || mockHistory;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)]">
        Histórico de Atendimentos
      </h2>
      {history.length === 0 ? (
        <div>Nenhum atendimento anterior.</div>
      ) : (
        <ul className="list-disc pl-6">
          {history.map((h, idx) => (
            <li key={idx}>
              Atendimento #{idx + 1} {/* TODO: Show details */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TreatmentHistory;
