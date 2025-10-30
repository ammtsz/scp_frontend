import React from "react";
import { render, screen } from "../../../test/testUtils";
import { AttendanceHistoryCard } from "../AttendanceHistoryCard";
import { Patient } from "@/types/types";

// Mock all required dependencies
jest.mock("@/hooks/usePatientQueries", () => ({
  usePatientAttendances: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock("@/hooks/useTreatmentRecords", () => ({
  useTreatmentRecords: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/hooks/usePagination", () => ({
  usePagination: jest.fn(() => ({
    visibleItems: [],
    hasMoreItems: false,
    showMore: jest.fn(),
    totalItems: 0,
    visibleCount: 0,
  })),
}));

jest.mock("@/utils/apiTransformers", () => ({
  transformAttendanceToPrevious: jest.fn((attendance) => attendance),
}));

jest.mock("@/utils/attendanceHelpers", () => ({
  groupAttendancesByDate: jest.fn(() => []),
  getAttendanceTypeLabel: jest.fn((type) => type),
  getPriorityLabel: jest.fn((priority) => priority),
  getPriorityColor: jest.fn(() => 'gray'),
}));

jest.mock("@/components/common/LoadingSpinner", () => ({
  LoadingSpinner: ({ message }: { message: string }) => <div data-testid="loading-spinner">{message}</div>,
}));

jest.mock("@/components/common/ShowMoreButton", () => ({
  ShowMoreButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Show More</button>
  ),
}));

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
  previousAttendances: [],
};

describe("AttendanceHistoryCard", () => {
  it("renders card title correctly", () => {
    render(<AttendanceHistoryCard patient={mockPatient} />);

    expect(
      screen.getByText("📋 Histórico de Atendimentos")
    ).toBeInTheDocument();
  });

  // Note: Empty state tests are now covered by CardStates.test.tsx
  // since we're using the reusable AttendanceHistoryEmpty component
});
