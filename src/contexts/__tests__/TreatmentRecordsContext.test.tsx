import React from "react";
import { render, screen } from "@testing-library/react";
import {
  TreatmentRecordsProvider,
  useTreatmentRecords,
} from "../TreatmentRecordsContext";

// Mock the API module
jest.mock("@/api/treatment-records", () => ({
  getTreatmentRecords: jest.fn(),
  getTreatmentRecordByAttendance: jest.fn(),
  createTreatmentRecord: jest.fn(),
  updateTreatmentRecord: jest.fn(),
  deleteTreatmentRecord: jest.fn(),
}));

// Simple test component
const TestComponent: React.FC = () => {
  const { treatmentRecords, loading, error } = useTreatmentRecords();

  return (
    <div>
      <div data-testid="loading">{loading ? "Loading" : "Not loading"}</div>
      <div data-testid="error">{error || "No error"}</div>
      <div data-testid="records-count">{treatmentRecords.length}</div>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <TreatmentRecordsProvider>
      <TestComponent />
    </TreatmentRecordsProvider>
  );
};

describe("TreatmentRecordsContext", () => {
  describe("Initial state", () => {
    it("should have empty initial state", () => {
      renderWithProvider();

      expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
      expect(screen.getByTestId("error")).toHaveTextContent("No error");
      expect(screen.getByTestId("records-count")).toHaveTextContent("0");
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow(
        "useTreatmentRecords must be used within TreatmentRecordsProvider"
      );

      console.error = originalError;
    });
  });
});
