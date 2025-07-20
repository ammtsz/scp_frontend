import React, { useState } from "react";
import { IRecommendations } from "@/types/globals";

interface CompleteAttendanceModalProps {
  open: boolean;
  patientName: string;
  onClose: () => void;
  onSubmit: (data: {
    notes: string;
    recommendations: IRecommendations;
  }) => void;
}

const initialRecommendations: IRecommendations = {
  food: "",
  water: "",
  ointment: "",
  lightBath: false,
  rod: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};

const CompleteAttendanceModal: React.FC<CompleteAttendanceModalProps> = ({
  open,
  patientName,
  onClose,
  onSubmit,
}) => {
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState<IRecommendations>(
    initialRecommendations
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-[color:var(--border)]">
        <div className="mb-4 text-lg font-bold text-[color:var(--primary-dark)]">
          Finalizar Atendimento: {patientName}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ notes, recommendations });
            setNotes("");
            setRecommendations(initialRecommendations);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              className="textarea w-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              required
            />
          </div>
          <fieldset className="border rounded p-3">
            <legend className="font-semibold text-sm mb-2">
              Recomendações
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">Alimentação</label>
                <input
                  className="input w-full"
                  value={recommendations.food}
                  onChange={(e) =>
                    setRecommendations((r) => ({ ...r, food: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Água</label>
                <input
                  className="input w-full"
                  value={recommendations.water}
                  onChange={(e) =>
                    setRecommendations((r) => ({ ...r, water: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Pomada</label>
                <input
                  className="input w-full"
                  value={recommendations.ointment}
                  onChange={(e) =>
                    setRecommendations((r) => ({
                      ...r,
                      ointment: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1">
                  Semanas para retorno
                </label>
                <input
                  className="input w-full"
                  type="number"
                  value={recommendations.returnWeeks}
                  onChange={(e) =>
                    setRecommendations((r) => ({
                      ...r,
                      returnWeeks: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recommendations.lightBath}
                  onChange={(e) =>
                    setRecommendations((r) => ({
                      ...r,
                      lightBath: e.target.checked,
                    }))
                  }
                />{" "}
                Banho de luz
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recommendations.rod}
                  onChange={(e) =>
                    setRecommendations((r) => ({ ...r, rod: e.target.checked }))
                  }
                />{" "}
                Bastão
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={recommendations.spiritualTreatment}
                  onChange={(e) =>
                    setRecommendations((r) => ({
                      ...r,
                      spiritualTreatment: e.target.checked,
                    }))
                  }
                />{" "}
                Tratamento espiritual
              </label>
            </div>
          </fieldset>
          <div className="flex gap-4 justify-end pt-2">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="button button-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteAttendanceModal;
