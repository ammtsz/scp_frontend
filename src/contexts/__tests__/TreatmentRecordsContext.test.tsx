import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTreatmentRecordsCompat as useTreatmentRecords } from "@/hooks/useTreatmentRecords";

// Mock the API module
jest.mock("@/api/treatment-records", () => ({
  getTreatmentRecords: jest.fn().mockResolvedValue({
    success: true,
    value: [],
  }),
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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TestComponent />
    </QueryClientProvider>
  );
};

describe("TreatmentRecords React Query Hooks", () => {
  describe("Initial state", () => {
    it("should have empty initial state", async () => {
      renderWithProvider();

      // Initially should show loading
      expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

      // Wait for the query to complete
      await screen.findByText("Not loading");

      expect(screen.getByTestId("error")).toHaveTextContent("No error");
      expect(screen.getByTestId("records-count")).toHaveTextContent("0");
    });

    it("should work without a provider using QueryClient", () => {
      // This test verifies that React Query doesn't throw errors like the old Context did
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      expect(() => {
        render(
          <QueryClientProvider client={queryClient}>
            <TestComponent />
          </QueryClientProvider>
        );
      }).not.toThrow();
    });
  });
});
