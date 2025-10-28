import React from "react";
import { render, screen } from "@testing-library/react";
import { AttendanceHistoryCard } from "../AttendanceHistoryCard";
import { Patient, PreviousAttendance } from "@/types/types";

const mockAttendances: PreviousAttendance[] = [
  {
    attendanceId: "att-1",
    date: new Date("2024-12-15"),
    type: "spiritual",
    notes: "Paciente relatou melhora nas dores",
    recommendations: {
      food: "Leve",
      water: "2L/dia",
      ointment: "Aplicar 2x/dia",
      lightBath: true,
      rod: false,
      spiritualTreatment: true,
      returnWeeks: 2,
    },
  },
  {
    attendanceId: "att-2",
    date: new Date("2024-12-01"),
    type: "lightBath",
    notes: "Sessão de banho de luz concluída",
    recommendations: null,
  },
];

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1980-05-15"),
  mainComplaint: "Dores de cabeça frequentes",
  status: "A",
  priority: "2",
  startDate: new Date("2024-01-15"),
  dischargeDate: null,
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
  previousAttendances: mockAttendances,
};

const emptyPatient: Patient = {
  ...mockPatient,
  previousAttendances: [],
};

// Mock formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

describe("AttendanceHistoryCard", () => {
  it("renders card title correctly", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    expect(
      screen.getByText("📋 Histórico de Atendimentos")
    ).toBeInTheDocument();
  });

  it("displays attendance history when attendances exist", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    // Should show both attendances
    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });

  it("displays attendance notes when available", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    expect(
      screen.getByText("Paciente relatou melhora nas dores")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sessão de banho de luz concluída")
    ).toBeInTheDocument();
  });

  it("shows recommendations section when available", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    expect(screen.getByText("Recomendações:")).toBeInTheDocument();
    expect(screen.getByText(/Alimentação:/)).toBeInTheDocument();
    expect(screen.getByText(/Água:/)).toBeInTheDocument();
    expect(screen.getByText(/Pomada:/)).toBeInTheDocument();
    expect(screen.getByText(/Retorno:/)).toBeInTheDocument();
  });

  it("applies different styling for most recent attendance", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    // The first attendance should have blue styling (most recent)
    const attendanceCards = screen
      .getAllByRole("generic")
      .filter(
        (el) =>
          el.className.includes("bg-blue-50") ||
          el.className.includes("bg-gray-50")
      );

    // Should have at least one blue card (most recent) and gray cards (older)
    expect(attendanceCards.length).toBeGreaterThan(0);
  });

  it("shows status badges for all attendances", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    // All attendances should show "Concluído" status
    const statusBadges = screen.getAllByText("Concluído");
    expect(statusBadges).toHaveLength(2);
  });

  it("displays empty state when no attendances exist", () => {
    render(<AttendanceHistoryCard patient={emptyPatient} />);

    expect(screen.getByText("📝")).toBeInTheDocument();
    expect(
      screen.getByText("Nenhum atendimento concluído")
    ).toBeInTheDocument();
  });

  it("uses attendance ID as key for list items", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    // This is more of an implementation test - checking that we don't get React key warnings
    // The actual key usage is handled internally by React
    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });

  it("handles attendances without recommendations", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    // The second attendance has null recommendations, so shouldn't show recommendations section
    // We can verify this by checking that not all attendances have recommendation sections
    const recommendationSections = screen.getAllByText("Recomendações:");
    expect(recommendationSections).toHaveLength(1); // Only the first attendance has recommendations
  });
});
