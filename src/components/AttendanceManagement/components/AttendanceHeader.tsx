import React from "react";

interface AttendanceHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  isDayFinalized?: boolean;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  selectedDate,
  onDateChange,
  isDayFinalized = false,
}) => {
  const handleTodayClick = () => {
    const today = new Date().toISOString().split("T")[0];
    onDateChange(today);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-lg mb-4 text-[color:var(--primary-dark)] flex items-center gap-2">
        Data selecionada:
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          className="input h-11 flex-1"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          lang="pt-BR"
        />
        <button
          type="button"
          className="button button-outline card-shadow"
          onClick={handleTodayClick}
        >
          Hoje
        </button>
      </div>

      {isDayFinalized && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 flex items-center gap-2">
          <span className="text-lg">📅</span>
          <div>
            <strong>Dia finalizado</strong>
            <p className="text-sm">
              Os cartões estão desabilitados para edição
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
