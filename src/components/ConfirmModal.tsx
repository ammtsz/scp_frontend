import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] border border-[color:var(--border)]">
        {title && (
          <div className="mb-2 text-lg font-bold text-[color:var(--primary-dark)]">
            {title}
          </div>
        )}
        <div className="mb-4 text-[color:var(--primary-dark)] font-semibold">
          {message}
        </div>
        <div className="flex gap-4 justify-end">
          <button className="button button-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="button button-primary bg-red-600 hover:bg-red-700 border-red-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
