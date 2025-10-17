import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TreatmentSessionErrors from "../TreatmentSessionErrors";
import type { TreatmentSessionError } from "../TreatmentSessionErrors";

// Mock data for testing
const mockErrors: TreatmentSessionError[] = [
  {
    treatment_type: "light_bath",
    errors: [
      "Failed to create attendance: Patient already has appointment at this time",
      "Invalid schedule configuration for Tuesday sessions",
    ],
  },
  {
    treatment_type: "rod",
    errors: ["Unable to schedule rod session: No available time slots"],
  },
];

const mockPatientName = "João Silva";

describe("TreatmentSessionErrors", () => {
  it("should render error component with correct patient name", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    expect(screen.getByText(`Problemas ao Criar Sessões`)).toBeInTheDocument();
    expect(screen.getByText(mockPatientName)).toBeInTheDocument();
  });

  it("should display error summary statistics correctly", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    // Should show total of 3 errors (2 + 1)
    expect(screen.getByText("3")).toBeInTheDocument();
    // Should show 2 affected treatments
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should display treatment-specific errors with icons", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    // Check for light bath treatment section by text content
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
    expect(screen.getByText("2 erros")).toBeInTheDocument();

    // Check for rod treatment section by text content
    expect(screen.getByText("Bastão")).toBeInTheDocument();
    expect(screen.getByText("1 erro")).toBeInTheDocument();
  });

  it("should display specific error messages", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    expect(
      screen.getByText(
        "Failed to create attendance: Patient already has appointment at this time"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Invalid schedule configuration for Tuesday sessions")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Unable to schedule rod session: No available time slots"
      )
    ).toBeInTheDocument();
  });

  it("should show continue button and call onContinue when clicked", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    const continueButton = screen.getByRole("button", {
      name: /Continuar Mesmo Assim/i,
    });
    expect(continueButton).toBeInTheDocument();

    fireEvent.click(continueButton);
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("should show retry button when onRetry is provided", () => {
    const mockOnContinue = jest.fn();
    const mockOnRetry = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onRetry={mockOnRetry}
        onContinue={mockOnContinue}
      />
    );

    const retryButton = screen.getByRole("button", {
      name: /Tentar Novamente/i,
    });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it("should not show retry button when onRetry is not provided", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    const retryButton = screen.queryByRole("button", {
      name: /Tentar Novamente/i,
    });
    expect(retryButton).not.toBeInTheDocument();
  });

  it("should display recommendations section", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    expect(screen.getByText("Recomendações")).toBeInTheDocument();
    expect(
      screen.getByText(/Verifique se já existem agendamentos conflitantes/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Confirme se as configurações de horário estão corretas/)
    ).toBeInTheDocument();
  });

  it("should display footer note about successful record saving", () => {
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    expect(
      screen.getByText(/O registro de tratamento foi salvo com sucesso/)
    ).toBeInTheDocument();
  });

  it("should handle custom message when provided", () => {
    const mockOnContinue = jest.fn();
    const customMessage = "Erro personalizado para teste";

    render(
      <TreatmentSessionErrors
        errors={mockErrors}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
        customMessage={customMessage}
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("should handle single error correctly", () => {
    const singleError: TreatmentSessionError[] = [
      {
        treatment_type: "light_bath",
        errors: ["Single error message"],
      },
    ];
    const mockOnContinue = jest.fn();

    render(
      <TreatmentSessionErrors
        errors={singleError}
        patientName={mockPatientName}
        onContinue={mockOnContinue}
      />
    );

    // Should show "1 erro" (singular) for the specific treatment
    expect(screen.getByText("1 erro")).toBeInTheDocument();
    // Should show single error message
    expect(screen.getByText("Single error message")).toBeInTheDocument();
  });
});
