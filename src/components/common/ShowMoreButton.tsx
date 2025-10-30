import React from "react";

interface ShowMoreButtonProps {
  onClick: () => void;
  totalItems: number;
  visibleCount: number;
  itemLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const ShowMoreButton: React.FC<ShowMoreButtonProps> = ({
  onClick,
  totalItems,
  visibleCount,
  itemLabel = "itens",
  className = "",
  disabled = false,
}) => {
  const remainingItems = totalItems - visibleCount;

  if (remainingItems <= 0) {
    return null;
  }

  return (
    <div className={`flex justify-center pt-4 ${className}`}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>📄</span>
        <span>
          Mostrar mais {Math.min(10, remainingItems)} {itemLabel}
        </span>
        <span className="text-xs text-blue-500 bg-blue-200 px-2 py-0.5 rounded-full">
          +{remainingItems}
        </span>
      </button>
    </div>
  );
};

export default ShowMoreButton;
