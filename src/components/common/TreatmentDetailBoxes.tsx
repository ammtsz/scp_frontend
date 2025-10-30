import React from "react";

// Base DetailBox component for consistent styling
interface DetailBoxProps {
  children: React.ReactNode;
  variant?: "lightBath" | "rod" | "spiritual" | "notes" | "info";
  className?: string;
}

const DetailBox: React.FC<DetailBoxProps> = ({
  children,
  variant = "info",
  className = "",
}) => {
  const variantClasses = {
    lightBath: "bg-yellow-100/20 border-yellow-300",
    rod: "bg-blue-100/20 border-blue-300",
    spiritual: "bg-purple-50 border-purple-300",
    notes: "bg-white border-gray-300",
    info: "bg-gray-50 border-gray-200",
  };

  return (
    <div
      className={`p-3 rounded border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

// Light Bath Treatment Details
interface LightBathDetailsProps {
  bodyLocations: string[];
  color?: string;
  duration?: number;
  sessions?: number;
  showSessions?: boolean;
  sessionLabel?: string;
}

export const LightBathDetails: React.FC<LightBathDetailsProps> = ({
  bodyLocations,
  color,
  duration,
  sessions,
  showSessions = false,
  sessionLabel = "sessões",
}) => (
  <DetailBox variant="lightBath">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-sm text-yellow-900 font-medium">
        ✨ Banho de Luz
        {color && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full">
            {color}
          </span>
        )}
      </div>
    </div>
    <div className="text-xs text-gray-700 leading-loose">
      <strong>Locais:</strong> {bodyLocations.join(", ")}
      {showSessions && sessions && (
        <>
          <br />
          <strong>
            {sessionLabel === "sessões" ? "Sessões Programadas:" : "Sessões:"}
          </strong>{" "}
          {sessions}
        </>
      )}
      {duration && (
        <>
          <br />
          <strong>Quantidade:</strong> {duration}{" "}
          {duration > 1 ? "unidades" : "unidade"}
        </>
      )}
    </div>
  </DetailBox>
);

// Rod Treatment Details
interface RodDetailsProps {
  bodyLocations: string[];
  sessions?: number;
  showSessions?: boolean;
  sessionLabel?: string;
}

export const RodDetails: React.FC<RodDetailsProps> = ({
  bodyLocations,
  sessions,
  showSessions = false,
  sessionLabel = "sessões",
}) => (
  <DetailBox variant="rod">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-sm text-blue-900 font-medium">🪄 Bastão</div>
    </div>
    <div className="text-xs text-gray-700 leading-loose">
      <strong>Locais:</strong> {bodyLocations.join(", ")}
      {showSessions && sessions && (
        <>
          <br />
          <strong>
            {sessionLabel === "sessões" ? "Sessões Programadas:" : "Sessões:"}
          </strong>{" "}
          {sessions}
        </>
      )}
    </div>
  </DetailBox>
);

// Spiritual Consultation Details
interface SpiritualConsultationProps {
  description?: string;
}

export const SpiritualConsultationDetails: React.FC<
  SpiritualConsultationProps
> = ({ description }) => (
  <DetailBox variant="spiritual">
    <div className="flex items-center gap-2">
      <span className="text-purple-600">🔮</span>
      <div className="font-medium text-purple-800">Consulta Espiritual</div>
    </div>
    {description && (
      <div className="text-sm text-purple-700 mt-1">{description}</div>
    )}
  </DetailBox>
);

// Notes Display
interface NotesBoxProps {
  notes: string;
  label?: string;
}

export const NotesBox: React.FC<NotesBoxProps> = ({
  notes,
  label = "Notas",
}) => (
  <DetailBox variant="notes">
    <div className="text-sm text-gray-700">
      <strong>{label}:</strong> {notes}
    </div>
  </DetailBox>
);

// Spiritual Recommendations
interface SpiritualRecommendation {
  food?: string;
  water?: string;
  ointment?: string;
  lightBath?: boolean;
  rod?: boolean;
  spiritualTreatment?: boolean;
  returnWeeks?: number;
}

interface RecommendationsBoxProps {
  recommendations: SpiritualRecommendation;
  title?: string;
}

export const RecommendationsBox: React.FC<RecommendationsBoxProps> = ({
  recommendations,
  title = "📋 Consulta Espiritual - Recomendações:",
}) => {
  const hasRecommendations = Object.values(recommendations).some(
    (value) =>
      value !== undefined && value !== null && value !== false && value !== 0
  );

  if (!hasRecommendations) return null;

  return (
    <DetailBox variant="spiritual">
      <div className="text-sm text-purple-900 font-medium mb-2">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {recommendations.food && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap text-nowrap">
              🍎 Alimentação:
            </span>
            <span className="text-gray-800 ml-2 text-right">
              {recommendations.food}
            </span>
          </div>
        )}

        {recommendations.water && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap">
              💧 Água:
            </span>
            <span className="text-gray-800 ml-2 text-right">
              {recommendations.water}
            </span>
          </div>
        )}

        {recommendations.ointment && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap">
              🧴 Pomada:
            </span>
            <span className="text-gray-800 ml-2 text-right">
              {recommendations.ointment}
            </span>
          </div>
        )}

        {recommendations.lightBath && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap">
              ✨ Banho de luz:
            </span>
            <span className="text-gray-800 ml-2 text-right">Recomendado</span>
          </div>
        )}

        {recommendations.rod && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap">
              🪄 Bastão:
            </span>
            <span className="text-gray-800 ml-2 text-right">Recomendado</span>
          </div>
        )}

        {recommendations.spiritualTreatment && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200">
            <span className="text-gray-600 font-medium text-nowrap">
              🧬 Trat. Espiritual:
            </span>
            <span className="text-gray-800 ml-2 text-right">Recomendado</span>
          </div>
        )}

        {recommendations.returnWeeks && recommendations.returnWeeks > 0 && (
          <div className="flex items-start justify-between p-2 bg-white rounded border border-purple-200 sm:col-span-2">
            <span className="text-gray-600 font-medium text-nowrap">
              📅 Retorno:
            </span>
            <span className="text-gray-800 ml-2 text-right font-medium">
              {recommendations.returnWeeks} semanas
            </span>
          </div>
        )}
      </div>
    </DetailBox>
  );
};

// Container for multiple treatment details
interface TreatmentDetailsContainerProps {
  children: React.ReactNode;
}

export const TreatmentDetailsContainer: React.FC<
  TreatmentDetailsContainerProps
> = ({ children }) => <div className="mt-3 space-y-2">{children}</div>;
