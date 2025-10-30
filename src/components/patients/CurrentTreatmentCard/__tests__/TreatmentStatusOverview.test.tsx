import React from "react";
import { render, screen } from "../../../../test/testUtils";
import { TreatmentStatusOverview } from "../TreatmentStatusOverview";
import { Patient } from "@/types/types";

// Mock the dateHelpers utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1980-05-15"),
  mainComplaint: "Dores de cabeça frequentes",
  status: "A",
  priority: "2",
  startDate: new Date("2024-01-15"),
  dischargeDate: new Date("2024-06-15"),
  timezone: "America/Sao_Paulo",
  nextAttendanceDates: [
    {
      date: new Date("2024-12-28"),
      type: "spiritual",
    },
  ],
  currentRecommendations: {
    date: new Date("2024-12-20"),
    food: "Leve",
    water: "2L/dia",
    ointment: "Aplicar 2x/dia",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [],
};

describe("TreatmentStatusOverview", () => {
  it("renders treatment timeline information correctly", () => {
    render(<TreatmentStatusOverview patient={mockPatient} />);

    expect(screen.getByText("Início do Tratamento")).toBeInTheDocument();
    expect(screen.getByText("Próximo Atendimento")).toBeInTheDocument();
    expect(screen.getByText("Alta Prevista")).toBeInTheDocument();
  });

  it("shows next attendance type when available", () => {
    render(<TreatmentStatusOverview patient={mockPatient} />);

    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
  });

  it("shows 'Não agendado' when no next attendance", () => {
    const patientWithoutNextAttendance = {
      ...mockPatient,
      nextAttendanceDates: [],
    };

    render(<TreatmentStatusOverview patient={patientWithoutNextAttendance} />);

    expect(screen.getByText("Não agendado")).toBeInTheDocument();
  });

  it("shows 'Não definida' when no discharge date", () => {
    const patientWithoutDischarge = {
      ...mockPatient,
      dischargeDate: null,
    };

    render(<TreatmentStatusOverview patient={patientWithoutDischarge} />);

    expect(screen.getByText("Não definida")).toBeInTheDocument();
  });
});
