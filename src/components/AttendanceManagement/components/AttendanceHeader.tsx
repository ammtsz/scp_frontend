import React from "react";
import { ChevronLeft, ChevronRight } from "react-feather";

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
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    onDateChange(today);
  };

  const handlePreviousDayClick = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay.toISOString().split("T")[0]);
  };

  const handleNextDayClick = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay.toISOString().split("T")[0]);
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
          onClick={handlePreviousDayClick}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="button button-outline card-shadow"
          onClick={handleNextDayClick}
        >
          <ChevronRight />
        </button>
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
