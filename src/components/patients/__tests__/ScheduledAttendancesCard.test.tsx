import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ScheduledAttendancesCard } from "../ScheduledAttendancesCard";

// Mock all dependencies to focus on testing the component logic
jest.mock("@/hooks/usePatientQueries", () => ({
  usePatientAttendances: jest.fn(),
}));

jest.mock("@/hooks/useTreatmentSessionsQueries", () => ({
  useTreatmentSessions: jest.fn(),
}));

jest.mock("@/hooks/usePagination", () => ({
  usePagination: jest.fn(),
}));

jest.mock("@/utils/dateHelpers", () => ({
  formatDateSafe: jest.fn(() => "December 20, 2023"),
  getDaysUntil: jest.fn(() => 3),
}));

jest.mock("@/utils/apiTransformers", () => ({
  transformAttendanceToNext: jest.fn((item) => item),
}));

jest.mock("@/utils/attendanceHelpers", () => ({
  groupScheduledAttendancesByDate: jest.fn(() => []),
  getScheduledTreatmentTypesLabel: jest.fn(() => "Spiritual Consultation"),
}));

jest.mock("@/components/common/LoadingSpinner", () => ({
  LoadingSpinner: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

jest.mock("@/components/common/ShowMoreButton", () => ({
  ShowMoreButton: ({
    onClick,
    disabled,
  }: {
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="show-more-button"
    >
      Show More
    </button>
  ),
}));

jest.mock("@/components/common/CardStates", () => ({
  ErrorState: ({
    title,
    message,
    onRetry,
  }: {
    title: string;
    message: string;
    onRetry: () => void;
  }) => (
    <div data-testid="error-state">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry} data-testid="retry-button">
        Retry
      </button>
    </div>
  ),
  ScheduledAttendancesEmpty: () => (
    <div data-testid="empty-state">No scheduled attendances</div>
  ),
}));

jest.mock("@/components/common/TreatmentDetailBoxes", () => ({
  TreatmentDetailsContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="treatment-details">{children}</div>
  ),
  SpiritualConsultationDetails: () => (
    <div data-testid="spiritual-consultation">Spiritual Consultation</div>
  ),
  LightBathDetails: () => (
    <div data-testid="light-bath">Light Bath Treatment</div>
  ),
  RodDetails: () => <div data-testid="rod-details">Rod Treatment</div>,
  NotesBox: ({ notes }: { notes: string }) => (
    <div data-testid="notes-box">Notes: {notes}</div>
  ),
}));

describe("ScheduledAttendancesCard", () => {
  // Mock patient for testing - using type assertion since we only need id for this component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockPatient: any = {
    id: "1",
    name: "Test Patient",
    nextAttendanceDates: [],
  };

  const mockAttendancesHook = jest.requireMock(
    "@/hooks/usePatientQueries"
  ).usePatientAttendances;
  const mockTreatmentSessionsHook = jest.requireMock(
    "@/hooks/useTreatmentSessionsQueries"
  ).useTreatmentSessions;
  const mockPaginationHook = jest.requireMock(
    "@/hooks/usePagination"
  ).usePagination;
  const mockGroupScheduled = jest.requireMock(
    "@/utils/attendanceHelpers"
  ).groupScheduledAttendancesByDate;

  beforeEach(() => {
    // Default mock implementations
    mockAttendancesHook.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockTreatmentSessionsHook.mockReturnValue({
      treatmentSessions: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockPaginationHook.mockReturnValue({
      visibleItems: [],
      hasMoreItems: false,
      showMore: jest.fn(),
      totalItems: 0,
      visibleCount: 0,
    });

    mockGroupScheduled.mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the card header", () => {
    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByText("📅 Próximos Agendamentos")).toBeInTheDocument();
    expect(screen.getByTitle("Atualizar agendamentos")).toBeInTheDocument();
  });

  it("should show loading state when data is loading", () => {
    mockAttendancesHook.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(
      screen.getByText("Carregando próximos agendamentos...")
    ).toBeInTheDocument();
  });

  it("should show error state when there is an error", () => {
    const mockRefetch = jest.fn();
    mockAttendancesHook.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: "Failed to load" },
      refetch: mockRefetch,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("should show empty state when no attendances", () => {
    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No scheduled attendances")).toBeInTheDocument();
  });

  it("should handle refresh button click", async () => {
    const mockRefetchAttendances = jest.fn();
    const mockRefetchTreatments = jest.fn();

    mockAttendancesHook.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetchAttendances,
    });

    mockTreatmentSessionsHook.mockReturnValue({
      treatmentSessions: [],
      loading: false,
      error: null,
      refetch: mockRefetchTreatments,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    const refreshButton = screen.getByTitle("Atualizar agendamentos");
    await userEvent.click(refreshButton);

    expect(mockRefetchAttendances).toHaveBeenCalled();
    expect(mockRefetchTreatments).toHaveBeenCalled();
  });

  it("should render scheduled attendances with treatment details", () => {
    const mockGroupedAttendances = [
      {
        date: new Date("2023-12-20"),
        treatments: {
          spiritual: true,
          lightBath: {
            bodyLocations: ["head"],
            color: "blue",
            duration: 30,
            sessions: 3,
          },
        },
        notes: "Test notes",
      },
    ];

    mockPaginationHook.mockReturnValue({
      visibleItems: mockGroupedAttendances,
      hasMoreItems: false,
      showMore: jest.fn(),
      totalItems: 1,
      visibleCount: 1,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("treatment-details")).toBeInTheDocument();
    expect(screen.getByTestId("spiritual-consultation")).toBeInTheDocument();
    expect(screen.getByTestId("light-bath")).toBeInTheDocument();
    expect(screen.getByTestId("notes-box")).toBeInTheDocument();
  });

  it("should show status badges for first appointment", () => {
    const mockGroupedAttendances = [
      {
        date: new Date("2023-12-20"),
        treatments: { spiritual: true },
        notes: null,
      },
    ];

    mockPaginationHook.mockReturnValue({
      visibleItems: mockGroupedAttendances,
      hasMoreItems: false,
      showMore: jest.fn(),
      totalItems: 1,
      visibleCount: 1,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByText("Próximo")).toBeInTheDocument();
    expect(screen.getByText("Agendado")).toBeInTheDocument();
  });

  it('should show "show more" button when there are more items', async () => {
    const mockShowMore = jest.fn();

    mockPaginationHook.mockReturnValue({
      visibleItems: [],
      hasMoreItems: true,
      showMore: mockShowMore,
      totalItems: 5,
      visibleCount: 3,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    const showMoreButton = screen.getByTestId("show-more-button");
    expect(showMoreButton).toBeInTheDocument();

    await userEvent.click(showMoreButton);
    expect(mockShowMore).toHaveBeenCalled();
  });

  it("should handle treatment sessions loading error", () => {
    mockTreatmentSessionsHook.mockReturnValue({
      treatmentSessions: [],
      loading: false,
      error: "Treatment error",
      refetch: jest.fn(),
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("error-state")).toBeInTheDocument();
    expect(screen.getByText("Treatment error")).toBeInTheDocument();
  });

  it("should hide refresh button when loading", () => {
    mockAttendancesHook.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(
      screen.queryByTitle("Atualizar agendamentos")
    ).not.toBeInTheDocument();
  });

  it("should render multiple treatment types", () => {
    const mockGroupedAttendances = [
      {
        date: new Date("2023-12-20"),
        treatments: {
          spiritual: true,
          lightBath: {
            bodyLocations: [],
            color: "blue",
            duration: 30,
            sessions: 1,
          },
          rod: { bodyLocations: [], sessions: 1 },
        },
        notes: "Multiple treatments",
      },
    ];

    mockPaginationHook.mockReturnValue({
      visibleItems: mockGroupedAttendances,
      hasMoreItems: false,
      showMore: jest.fn(),
      totalItems: 1,
      visibleCount: 1,
    });

    render(<ScheduledAttendancesCard patient={mockPatient} />);

    expect(screen.getByTestId("spiritual-consultation")).toBeInTheDocument();
    expect(screen.getByTestId("light-bath")).toBeInTheDocument();
    expect(screen.getByTestId("rod-details")).toBeInTheDocument();
  });
});
