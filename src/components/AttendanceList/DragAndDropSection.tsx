import React from "react";

interface DragAndDropSectionProps {
  title: string;
  color: string;
  patients: string[];
  emptyText: string;
  onDrop: () => void;
  renderPatient: (name: string, idx: number) => React.ReactNode;
  reorderButton?: React.ReactNode;
}

const DragAndDropSection: React.FC<DragAndDropSectionProps> = ({
  title,
  color,
  patients,
  emptyText,
  onDrop,
  renderPatient,
  reorderButton,
}) => (
  <div className={`mt-6`}>
    <div className="flex items-center justify-center gap-2 mb-2">
      <h4
        className={`font-semibold text-base text-${color}-700 text-center m-0`}
      >
        {title}
      </h4>
      {reorderButton && (
        <div className="relative group">
          {reorderButton}
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 whitespace-nowrap bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Reordenar lista
          </span>
        </div>
      )}
    </div>
    <div
      className={`flex flex-row flex-wrap gap-2 min-h-[104px] bg-[color:var(--surface)] rounded border border-dashed border-${color}-400 p-2`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {patients.length ? (
        patients.map(renderPatient)
      ) : (
        <div
          className={`text-sm text-gray-400 text-center min-h-[40px] flex items-center justify-center w-full`}
        >
          {emptyText}
        </div>
      )}
    </div>
  </div>
);

export default DragAndDropSection;
