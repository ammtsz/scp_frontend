import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  TreatmentStatusBadge,
  PatientStatusOverview,
  TreatmentProgressBar,
} from "../TreatmentStatusBadge";

describe("TreatmentStatusBadge", () => {
  test("renders active treatment badge correctly", () => {
    render(
      <TreatmentStatusBadge isActive={true} label="Banho de luz" icon="💡" />
    );

    expect(screen.getByText("Banho de luz")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();

    const badge = screen.getByText("Banho de luz").parentElement;
    expect(badge).toHaveClass("ds-badge-status-active");
  });

  test("renders inactive treatment badge correctly", () => {
    render(<TreatmentStatusBadge isActive={false} label="Bastão" icon="🔮" />);

    expect(screen.getByText("Bastão")).toBeInTheDocument();
    expect(screen.getByText("🔮")).toBeInTheDocument();

    const badge = screen.getByText("Bastão").parentElement;
    expect(badge).toHaveClass("ds-badge-status-inactive");
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

describe("TreatmentProgressBar", () => {
  test("renders progress bar with correct percentage", () => {
    render(
      <TreatmentProgressBar
        current={3}
        total={10}
        label="Consultas realizadas"
      />
    );

    expect(screen.getByText("Consultas realizadas")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  test("handles zero total correctly", () => {
    render(
      <TreatmentProgressBar current={0} total={0} label="Sem consultas" />
    );

    expect(screen.getByText("0/0")).toBeInTheDocument();
  });

  test("renders 100% progress correctly", () => {
    render(
      <TreatmentProgressBar current={5} total={5} label="Tratamento completo" />
    );

    expect(screen.getByText("5/5")).toBeInTheDocument();
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
    expect(screen.getByText("🚨 Emergência")).toBeInTheDocument();
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

    expect(screen.getByText("✅ Normal")).toBeInTheDocument();
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

    expect(screen.getByText("⚠️ Intermediário")).toBeInTheDocument();
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

    expect(screen.getByText("📋 unknown")).toBeInTheDocument();
  });
});
