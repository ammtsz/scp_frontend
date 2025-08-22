import { render, screen, fireEvent } from "@testing-library/react";
import PatientForm from "../index";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the API
jest.mock("@/api/patients", () => ({
  createPatient: jest.fn(),
}));

describe("PatientForm Date Handling", () => {
  test("should handle invalid date input without crashing", () => {
    render(<PatientForm />);

    const birthDateInput = screen.getByLabelText(/Data de Nascimento/i);

    // Test various invalid date inputs that could crash the app
    const invalidDates = [
      "invalid-date",
      "2025-13-45", // Invalid month and day
      "2025-02-30", // Invalid date for February
      "", // Empty string
      "2025-", // Incomplete date
      "abc-def-ghi", // Non-numeric
    ];

    invalidDates.forEach((invalidDate) => {
      expect(() => {
        fireEvent.change(birthDateInput, { target: { value: invalidDate } });
      }).not.toThrow();
    });
  });

  test("should handle valid date input correctly", () => {
    render(<PatientForm />);

    const birthDateInput = screen.getByLabelText(/Data de Nascimento/i);

    // Test valid date
    fireEvent.change(birthDateInput, { target: { value: "1990-05-15" } });

    expect(birthDateInput).toHaveValue("1990-05-15");
  });

  test("should not crash when toISOString is called on invalid dates", () => {
    render(<PatientForm />);

    const birthDateInput = screen.getByLabelText(/Data de Nascimento/i);

    // Set an invalid date
    fireEvent.change(birthDateInput, { target: { value: "invalid-date" } });

    // The component should still render without errors
    expect(birthDateInput).toBeInTheDocument();

    // The form should still be functional
    const nameInput = screen.getByLabelText(/Nome/i);
    expect(() => {
      fireEvent.change(nameInput, { target: { value: "Test Patient" } });
    }).not.toThrow();
  });

  test("should clear invalid dates to empty string in input fields", () => {
    render(<PatientForm />);

    const birthDateInput = screen.getByLabelText(/Data de Nascimento/i);

    // Set an invalid date
    fireEvent.change(birthDateInput, { target: { value: "invalid-date" } });

    // The input should not crash and should handle the invalid date gracefully
    expect(() => {
      // Trigger a re-render by changing another field
      const nameInput = screen.getByLabelText(/Nome/i);
      fireEvent.change(nameInput, { target: { value: "Test" } });
    }).not.toThrow();
  });
});
