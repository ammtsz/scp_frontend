import React from "react";
import { IAttendanceStatusDetail } from "@/types/globals";

interface AbsenceJustification {
  attendanceId: number;
  patientName: string;
  justified: boolean;
  notes: string;
}

interface AbsenceJustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledAbsences: IAttendanceStatusDetail[];
  onSubmit: (justifications: AbsenceJustification[]) => void;
}

export const AbsenceJustificationModal: React.FC<
  AbsenceJustificationModalProps
> = ({ isOpen, onClose, scheduledAbsences, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [justifications, setJustifications] = React.useState<
    AbsenceJustification[]
  >([]);
  const [currentJustified, setCurrentJustified] = React.useState(false);
  const [currentNotes, setCurrentNotes] = React.useState("");

  const currentPatient = scheduledAbsences[currentIndex];
  const isLastPatient = currentIndex === scheduledAbsences.length - 1;

  const handleNext = () => {
    // Save current justification
    const newJustifications = [...justifications];
    newJustifications[currentIndex] = {
      attendanceId: currentPatient.attendanceId!,
      patientName: currentPatient.name,
      justified: currentJustified,
      notes: currentNotes,
    };
    setJustifications(newJustifications);

    if (isLastPatient) {
      // Submit all justifications
      onSubmit(newJustifications);
    } else {
      // Move to next patient
      setCurrentIndex(currentIndex + 1);
      // Load existing justification if any
      const existingJustification = newJustifications[currentIndex + 1];
      if (existingJustification) {
        setCurrentJustified(existingJustification.justified);
        setCurrentNotes(existingJustification.notes);
      } else {
        setCurrentJustified(false);
        setCurrentNotes("");
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Load existing justification
      const existingJustification = justifications[currentIndex - 1];
      if (existingJustification) {
        setCurrentJustified(existingJustification.justified);
        setCurrentNotes(existingJustification.notes);
      }
    }
  };

  const handleSkipAll = () => {
    // Mark all as unjustified
    const allUnjustified = scheduledAbsences.map((patient) => ({
      attendanceId: patient.attendanceId!,
      patientName: patient.name,
      justified: false,
      notes: "",
    }));
    onSubmit(allUnjustified);
  };

  if (!isOpen || scheduledAbsences.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Justificar Faltas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Paciente {currentIndex + 1} de {scheduledAbsences.length}
            </span>
            <span>
              {Math.round(
                ((currentIndex + 1) / scheduledAbsences.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentIndex + 1) / scheduledAbsences.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentPatient.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Este paciente estava agendado mas não compareceu ao atendimento. A
            falta foi justificada?
          </p>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="justified"
                name="justification"
                checked={currentJustified}
                onChange={() => setCurrentJustified(true)}
                className="mr-2"
              />
              <label htmlFor="justified" className="text-gray-700">
                Falta justificada
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="unjustified"
                name="justification"
                checked={!currentJustified}
                onChange={() => setCurrentJustified(false)}
                className="mr-2"
              />
              <label htmlFor="unjustified" className="text-gray-700">
                Falta não justificada
              </label>
            </div>
          </div>

          {currentJustified && (
            <div className="mt-4">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Observações (opcional)
              </label>
              <textarea
                id="notes"
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Motivo da justificativa..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLastPatient ? "Finalizar" : "Próximo"}
            </button>
          </div>

          <button
            onClick={handleSkipAll}
            className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Marcar Todas como Não Justificadas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceJustificationModal;
