import React from "react";
import Link from "next/link";

// Base Empty State Component
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  iconBgColor?: string;
  children?: React.ReactNode; // For custom action buttons or additional content
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  iconBgColor = "bg-gray-50",
  children,
}) => (
  <div className="text-center py-8">
    <div
      className={`${iconBgColor} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
    >
      <div className="text-2xl">{icon}</div>
    </div>
    <div className="font-medium text-gray-900 mb-2">{title}</div>
    <div className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
      {description}
    </div>
    {children}
  </div>
);

// Error State Component
interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel = "Tentar novamente",
}) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-red-500 mr-3">⚠️</div>
        <div>
          <p className="text-red-800 font-medium">{title}</p>
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-300 hover:border-red-400 transition-colors"
      >
        {retryLabel}
      </button>
    </div>
  </div>
);

// Specialized Empty States for specific cards

// Attendance History Empty State
interface AttendanceHistoryEmptyProps {
  patient: { nextAttendanceDates: Array<{ date: Date | string }> };
}

export const AttendanceHistoryEmpty: React.FC<AttendanceHistoryEmptyProps> = ({
  patient,
}) => (
  <EmptyState
    icon="📝"
    title="Nenhum atendimento concluído"
    description="Este é um novo paciente ou ainda não possui atendimentos concluídos. O histórico será exibido aqui após a conclusão dos atendimentos."
    iconBgColor="bg-green-50"
  >
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <div className="text-blue-500 text-lg">✨</div>
        <div className="text-sm">
          <div className="font-medium text-blue-900 mb-1">Próximos passos:</div>
          <div className="text-blue-800">
            {patient.nextAttendanceDates.length > 0
              ? `Próximo atendimento agendado para ${new Date(
                  patient.nextAttendanceDates[0].date
                ).toLocaleDateString("pt-BR")}`
              : "Agendar primeiro atendimento para iniciar o tratamento"}
          </div>
        </div>
      </div>
    </div>
  </EmptyState>
);

// Scheduled Attendances Empty State
interface ScheduledAttendancesEmptyProps {
  patientId: string;
}

export const ScheduledAttendancesEmpty: React.FC<
  ScheduledAttendancesEmptyProps
> = ({ patientId }) => (
  <EmptyState
    icon="📅"
    title="Nenhum agendamento futuro"
    description="Este paciente não possui agendamentos futuros no momento. Novos agendamentos aparecerão aqui quando criados."
    iconBgColor="bg-blue-50"
  >
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <Link
        href={`/agenda?patient=${patientId}&action=schedule`}
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 rounded-md text-sm font-semibold transition-colors min-h-[44px] flex-1 sm:flex-none text-center"
      >
        📅 Agendar Consulta
      </Link>
      <Link
        href="/agenda"
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-semibold transition-colors min-h-[44px] flex-1 sm:flex-none text-center"
      >
        Ver Agenda
      </Link>
    </div>
  </EmptyState>
);

// Treatment Recommendations Empty State
interface TreatmentRecommendationsEmptyProps {
  onCreateRecommendations: () => void;
}

export const TreatmentRecommendationsEmpty: React.FC<
  TreatmentRecommendationsEmptyProps
> = ({ onCreateRecommendations }) => (
  <EmptyState
    icon="⚠️"
    title="Recomendações não disponíveis"
    description="Este paciente ainda não possui recomendações de tratamento registradas."
    iconBgColor="bg-yellow-50"
  >
    <button className="ds-button-primary" onClick={onCreateRecommendations}>
      ✨ Criar Recomendações
    </button>
  </EmptyState>
);

// Current Treatment Empty State (when no active treatments)
export const CurrentTreatmentEmpty: React.FC = () => (
  <EmptyState
    icon="🗂️"
    title="Nenhum tratamento ativo"
    description="Este paciente não possui tratamentos em andamento no momento. Tratamentos ativos aparecerão aqui quando iniciados."
    iconBgColor="bg-blue-50"
  />
);
