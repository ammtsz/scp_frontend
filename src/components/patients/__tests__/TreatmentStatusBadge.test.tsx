import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  TreatmentStatusBadge,
  PatientStatusOverview,
} from "../TreatmentStatusBadge";

describe("TreatmentStatusBadge", () => {
  test("renders active treatment badge correctly", () => {
    render(
      <TreatmentStatusBadge isActive={true} label="Banho de luz" icon="💡" />
    );

    expect(screen.getByText("Banho de luz")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();

    const badge = screen.getByText("Banho de luz").parentElement;
    expect(badge).toHaveClass(
      "ds-badge",
      "bg-green-50",
      "text-green-800",
      "border-green-200"
    );
  });

  test("renders inactive treatment badge correctly", () => {
    render(<TreatmentStatusBadge isActive={false} label="Bastão" icon="🔮" />);

    expect(screen.getByText("Bastão")).toBeInTheDocument();
    expect(screen.getByText("🔮")).toBeInTheDocument();

    const badge = screen.getByText("Bastão").parentElement;
    expect(badge).toHaveClass(
      "ds-badge",
      "bg-gray-50",
      "text-gray-600",
      "border-gray-200"
    );
  });

  test("applies custom className", () => {
    render(
      <TreatmentStatusBadge
        isActive={true}
        label="Test"
        className="custom-class"
      />
    );

    const badge = screen.getByText("Test").parentElement;
    expect(badge).toHaveClass("custom-class");
  });
});

describe("PatientStatusOverview", () => {
  test("renders emergency priority patient correctly", () => {
    render(
      <PatientStatusOverview
        priority="1"
        totalAttendances={5}
        weeksInTreatment={12}
        nextAppointment="25/10/2025"
      />
    );

    expect(screen.getByText("Status do Paciente")).toBeInTheDocument();
    expect(screen.getByText("🚨")).toBeInTheDocument();
    expect(screen.getByText("Emergência")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("25/10/2025")).toBeInTheDocument();
  });

  test("renders normal priority patient correctly", () => {
    render(
      <PatientStatusOverview
        priority="3"
        totalAttendances={2}
        weeksInTreatment={3}
      />
    );

    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("renders without next appointment", () => {
    render(
      <PatientStatusOverview
        priority="2"
        totalAttendances={1}
        weeksInTreatment={1}
      />
    );

    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByText("Intermediário")).toBeInTheDocument();
    expect(screen.queryByText("Próximo atendimento:")).not.toBeInTheDocument();
  });

  test("handles unknown priority gracefully", () => {
    render(
      <PatientStatusOverview
        priority="unknown"
        totalAttendances={0}
        weeksInTreatment={0}
      />
    );

    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
