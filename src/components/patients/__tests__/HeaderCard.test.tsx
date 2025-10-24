import React from "react";
import { render, screen } from "@testing-library/react";
import { HeaderCard } from "../HeaderCard";
import { Patient, Priority } from "@/types/types";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1980-05-15"),
  mainComplaint: "Dores de cabeça frequentes",
  status: "A", // Active status
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
  previousAttendances: [],
};

describe("HeaderCard", () => {
  it("renders patient basic information correctly", () => {
    render(<HeaderCard patient={mockPatient} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Dores de cabeça frequentes")).toBeInTheDocument();
  });

  it("displays priority badge with correct text and styling", () => {
    render(<HeaderCard patient={mockPatient} />);

    const priorityBadge = screen.getByText("Intermediário");
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
  });

  it("calculates and displays age correctly", () => {
    render(<HeaderCard patient={mockPatient} />);

    // Calculate expected age (should be 44 as of 2024)
    const expectedAge = new Date().getFullYear() - 1980;
    expect(screen.getByText(`${expectedAge} anos`)).toBeInTheDocument();
  });

  it("renders quick action buttons with correct links", () => {
    render(<HeaderCard patient={mockPatient} />);

    const editLink = screen.getByRole("link", { name: /editar/i });
    expect(editLink).toHaveAttribute("href", "/patients/1/edit");

    expect(screen.getByText("📅 Agendar")).toBeInTheDocument();
    expect(screen.getByText("📞 Contato")).toBeInTheDocument();
  });

  it("displays priority colors correctly for different priority levels", () => {
    // Test Emergency priority
    const emergencyPatient: Patient = { ...mockPatient, priority: "1" };
    const { rerender } = render(<HeaderCard patient={emergencyPatient} />);
    expect(screen.getByText("Emergência")).toHaveClass(
      "bg-red-100",
      "text-red-800"
    );

    // Test Normal priority
    const normalPatient: Patient = { ...mockPatient, priority: "3" };
    rerender(<HeaderCard patient={normalPatient} />);
    expect(screen.getByText("Normal")).toHaveClass(
      "bg-green-100",
      "text-green-800"
    );
  });

  it("handles unknown priority gracefully", () => {
    // Since Priority is a union type, we need to cast for testing edge cases
    const unknownPriorityPatient = {
      ...mockPatient,
      priority: "4" as unknown as Priority,
    };
    render(<HeaderCard patient={unknownPriorityPatient} />);

    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
