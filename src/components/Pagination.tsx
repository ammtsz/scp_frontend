import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        className="button button-secondary px-2 py-1"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Anterior
      </button>
      <span className="text-sm">
        Página {page} de {totalPages}
      </span>
      <button
        className="button button-secondary px-2 py-1"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Próxima
      </button>
    </div>
  );
};

export default Pagination;
