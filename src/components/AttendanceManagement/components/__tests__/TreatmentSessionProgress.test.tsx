import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TreatmentSessionProgress from "../../../TreatmentSessionProgress";
import * as treatmentSessionsApi from "@/api/treatment-sessions";
import * as treatmentSessionRecordsApi from "@/api/treatment-session-records";

// Mock the API functions
jest.mock("@/api/treatment-sessions");
jest.mock("@/api/treatment-session-records");

const mockGetTreatmentSessionsByPatient =
  treatmentSessionsApi.getTreatmentSessionsByPatient as jest.MockedFunction<
    typeof treatmentSessionsApi.getTreatmentSessionsByPatient
  >;
const mockGetTreatmentSessionRecordsByPatient =
  treatmentSessionRecordsApi.getTreatmentSessionRecordsByPatient as jest.MockedFunction<
    typeof treatmentSessionRecordsApi.getTreatmentSessionRecordsByPatient
  >;

describe("TreatmentSessionProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when no active sessions exist", async () => {
    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: [],
    });

    const { container } = render(
      <TreatmentSessionProgress patientId={1} attendanceType="light_bath" />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it("renders compact progress view with session count", async () => {
    const mockSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_type: "light_bath" as const,
        status: "in_progress" as const,
        planned_sessions: 5,
        completed_sessions: 2,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    const mockRecords = [
      {
        id: 1,
        treatment_session_id: 1,
        attendance_id: 100,
        scheduled_date: "2024-01-15",
        status: "scheduled" as const,
        notes: null,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: mockSessions,
    });

    mockGetTreatmentSessionRecordsByPatient.mockResolvedValue({
      success: true,
      value: mockRecords,
    });

    render(
      <TreatmentSessionProgress patientId={1} attendanceType="light_bath" />
    );

    await waitFor(() => {
      expect(screen.getByText("3/5")).toBeInTheDocument();
    });
  });

  it("renders detailed progress view when showDetails is true", async () => {
    const mockSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_type: "rod" as const,
        status: "in_progress" as const,
        planned_sessions: 10,
        completed_sessions: 7,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: mockSessions,
    });

    mockGetTreatmentSessionRecordsByPatient.mockResolvedValue({
      success: true,
      value: [],
    });

    render(
      <TreatmentSessionProgress
        patientId={1}
        attendanceType="rod"
        showDetails={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Bastão")).toBeInTheDocument();
      expect(screen.getByText("80%")).toBeInTheDocument();
    });

    // Check progress bar width (80%)
    const progressBar = document.querySelector('[style*="width: 80%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it("filters sessions by attendance type correctly", async () => {
    const mockSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_type: "light_bath" as const,
        status: "in_progress" as const,
        planned_sessions: 5,
        completed_sessions: 2,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
      {
        id: 2,
        patient_id: 1,
        treatment_type: "rod" as const,
        status: "in_progress" as const,
        planned_sessions: 8,
        completed_sessions: 3,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: mockSessions,
    });

    mockGetTreatmentSessionRecordsByPatient.mockResolvedValue({
      success: true,
      value: [],
    });

    render(<TreatmentSessionProgress patientId={1} attendanceType="rod" />);

    await waitFor(() => {
      expect(screen.getByText("4/8")).toBeInTheDocument();
      expect(screen.queryByText("3/5")).not.toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    mockGetTreatmentSessionsByPatient.mockRejectedValue(new Error("API Error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(
      <TreatmentSessionProgress patientId={1} attendanceType="light_bath" />
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Erro ao carregar progresso")
      ).not.toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching treatment sessions:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles sessions with no records correctly", async () => {
    const mockSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_type: "light_bath" as const,
        status: "in_progress" as const,
        planned_sessions: 3,
        completed_sessions: 1,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: mockSessions,
    });

    mockGetTreatmentSessionRecordsByPatient.mockResolvedValue({
      success: false,
      error: "No records found",
    });

    render(
      <TreatmentSessionProgress patientId={1} attendanceType="light_bath" />
    );

    await waitFor(() => {
      expect(screen.getByText("2/3")).toBeInTheDocument();
      expect(screen.queryByText("Próx:")).not.toBeInTheDocument();
    });
  });

  it("renders nothing when patientId is 0 or falsy", () => {
    const { container } = render(
      <TreatmentSessionProgress patientId={0} attendanceType="light_bath" />
    );

    expect(container.firstChild).toBeNull();
    expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith("0");
  });

  it("shows correct progress percentage for 100% completion", async () => {
    const mockSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_type: "light_bath" as const,
        status: "in_progress" as const,
        planned_sessions: 4,
        completed_sessions: 4,
        start_date: "2024-01-01",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
    ];

    mockGetTreatmentSessionsByPatient.mockResolvedValue({
      success: true,
      value: mockSessions,
    });

    mockGetTreatmentSessionRecordsByPatient.mockResolvedValue({
      success: true,
      value: [],
    });

    render(
      <TreatmentSessionProgress
        patientId={1}
        attendanceType="light_bath"
        showDetails={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("100%")).toBeInTheDocument();
    });

    const progressBar = document.querySelector('[style*="width: 100%"]');
    expect(progressBar).toBeInTheDocument();
  });
});
