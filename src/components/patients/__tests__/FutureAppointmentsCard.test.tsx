import React from "react";
import { render, screen } from "@testing-library/react";
import { FutureAppointmentsCard } from "../FutureAppointmentsCard";
import { Patient } from "@/types/types";

const futureDate1 = new Date();
futureDate1.setDate(futureDate1.getDate() + 7); // 7 days from now

const futureDate2 = new Date();
futureDate2.setDate(futureDate2.getDate() + 14); // 14 days from now

const mockPatientWithAppointments: Patient = {
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
      date: futureDate1,
      type: "spiritual",
    },
    {
      date: futureDate2,
      type: "lightBath",
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

const mockPatientNoAppointments: Patient = {
  ...mockPatientWithAppointments,
  nextAttendanceDates: [],
};

// Mock formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

describe("FutureAppointmentsCard", () => {
  it("renders card title correctly", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    expect(screen.getByText("📅 Próximos Agendamentos")).toBeInTheDocument();
  });

  it("displays future appointments when they exist", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });

  it('shows "Próximo" badge for the first appointment', () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    expect(screen.getByText("Próximo")).toBeInTheDocument();
  });

  it('shows "Agendado" badge for all appointments', () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    const agendadoBadges = screen.getAllByText("Agendado");
    expect(agendadoBadges).toHaveLength(2);
  });

  it("applies different styling for next appointment vs others", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    // The first appointment should have green styling (next)
    const appointmentCards = screen
      .getAllByRole("generic")
      .filter(
        (el) =>
          el.className.includes("bg-green-50") ||
          el.className.includes("bg-blue-50")
      );

    expect(appointmentCards.length).toBeGreaterThan(0);
  });

  it("shows days until next appointment", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    // Should show "Em X dias" for the next appointment
    expect(screen.getAllByText(/Em \d+ dias/)[0]).toBeInTheDocument();
  });

  it("displays empty state when no appointments exist", () => {
    render(<FutureAppointmentsCard patient={mockPatientNoAppointments} />);

    expect(screen.getByText("📅")).toBeInTheDocument();
    expect(screen.getByText("Nenhum agendamento futuro")).toBeInTheDocument();
  });

  it("calculates days until appointment correctly", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    // Since we set the appointment to 7 days from now, it should show "Em 7 dias"
    expect(screen.getByText("Em 7 dias")).toBeInTheDocument();
  });

  it("handles appointment with single future date", () => {
    const singleAppointmentPatient = {
      ...mockPatientWithAppointments,
      nextAttendanceDates: [
        {
          date: futureDate1,
          type: "spiritual" as const,
        },
      ],
    };

    render(<FutureAppointmentsCard patient={singleAppointmentPatient} />);

    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Próximo")).toBeInTheDocument();
    expect(screen.getByText("Agendado")).toBeInTheDocument();
  });

  it("uses array index as key for appointments", () => {
    render(<FutureAppointmentsCard patient={mockPatientWithAppointments} />);

    // This is an implementation test - checking that multiple appointments render correctly
    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });
});
