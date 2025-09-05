import React from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Carregando atendimentos...",
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg text-[color:var(--text-muted)]">{message}</div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  retryButtonText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  retryButtonText = "Tentar novamente",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-lg text-red-600">Erro ao carregar atendimentos</div>
      <div className="text-sm text-[color:var(--text-muted)]">{error}</div>
      <button
        className="px-4 py-2 bg-[color:var(--primary)] text-white rounded hover:bg-[color:var(--primary-dark)]"
        onClick={onRetry}
      >
        {retryButtonText}
      </button>
    </div>
  );
};
