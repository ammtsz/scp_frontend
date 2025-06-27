import React from "react";

interface AttendanceSectionProps {
  title: string;
  color: string;
  border: string;
  patients: string[];
  emptyText: string;
  onDrop: () => void;
  renderPatient: (name: string, idx: number) => React.ReactNode;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  title,
  color,
  border,
  patients,
  emptyText,
  onDrop,
  renderPatient,
}) => (
  <div className={`mt-6`}>
    <h4
      className={`font-semibold text-base mb-2 text-${color}-700 text-center`}
    >
      {title}
    </h4>
    <div
      className={`flex flex-col gap-2 min-h-[40px] bg-[color:var(--surface)] rounded border border-dashed border-${border}-400 p-2`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {patients.length ? (
        patients.map(renderPatient)
      ) : (
        <div
          className={`text-sm text-gray-400 text-center min-h-[40px] flex items-center justify-center`}
        >
          {emptyText}
        </div>
      )}
    </div>
  </div>
);

export default AttendanceSection;
