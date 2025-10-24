import React from "react";
import { render, screen } from "@testing-library/react";
import { CurrentTreatmentCard } from "../CurrentTreatmentCard";
import { Patient } from "@/types/types";

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

// Mock formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

describe("CurrentTreatmentCard", () => {
  it("renders treatment card with correct title", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("🔮 Consulta Espiritual")).toBeInTheDocument();
  });

  it("displays treatment timeline information", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("Início do Tratamento")).toBeInTheDocument();
    expect(screen.getByText("Próximo Atendimento")).toBeInTheDocument();
    expect(screen.getByText("Alta Prevista")).toBeInTheDocument();
  });

  it("shows discharge date when available", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Should show the formatted discharge date
    expect(screen.queryByText("Não definida")).not.toBeInTheDocument();
  });

  it('shows "Não definida" when discharge date is null', () => {
    const patientWithoutDischarge = { ...mockPatient, dischargeDate: null };
    render(<CurrentTreatmentCard patient={patientWithoutDischarge} />);

    expect(screen.getByText("Não definida")).toBeInTheDocument();
  });

  it("displays current recommendations section", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText(/Últimas Recomendações/)).toBeInTheDocument();
    expect(screen.getByText("🍎 Alimentação:")).toBeInTheDocument();
    expect(screen.getByText("💧 Água:")).toBeInTheDocument();
    expect(screen.getByText("🧴 Pomada:")).toBeInTheDocument();
    expect(screen.getByText("💡 Banho de luz:")).toBeInTheDocument();
    expect(screen.getByText("🔮 Bastão:")).toBeInTheDocument();
    expect(screen.getByText("✨ Trat. Espiritual:")).toBeInTheDocument();
  });

  it("displays recommendation values correctly", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("Leve")).toBeInTheDocument();
    expect(screen.getByText("2L/dia")).toBeInTheDocument();
    expect(screen.getByText("Aplicar 2x/dia")).toBeInTheDocument();
    expect(screen.getByText("2 semanas")).toBeInTheDocument();
  });

  it("shows treatment status badges with correct active/inactive states", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Light bath is true, so should show "Sim"
    const lightBathElements = screen.getAllByText("Sim");
    expect(lightBathElements.length).toBeGreaterThan(0);

    // Rod is false, so should show "Não"
    const rodElements = screen.getAllByText("Não");
    expect(rodElements.length).toBeGreaterThan(0);
  });

  it("renders treatment status badges for all boolean recommendations", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Should have TreatmentStatusBadge components for lightBath, rod, and spiritualTreatment
    const statusBadges = screen.getAllByText(/Sim|Não/);
    expect(statusBadges.length).toBe(3); // lightBath, rod, spiritualTreatment
  });
});
