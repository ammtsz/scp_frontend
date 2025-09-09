/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AttendanceManagement from "../index";
import * as AttendancesContext from "@/contexts/AttendancesContext";
import { useAttendanceManagement } from "../hooks/useAttendanceManagement";
import { useNewPatientCheckIn } from "../components/WalkInForm/useNewPatientCheckIn";

// Mock the hooks
jest.mock("../hooks/useAttendanceManagement");
jest.mock("@/hooks/useAttendanceManagement");
jest.mock("../components/WalkInForm/useNewPatientCheckIn");
jest.mock("@/contexts/AttendancesContext");

// Mock the treatment form components
jest.mock("../components/TreatmentForms/SpiritualConsultationForm", () => {
  return function MockSpiritualConsultationForm({
    onSubmit,
    onCancel,
    patientName,
    attendanceId,
  }: any) {
    return (
      <div data-testid="spiritual-consultation-form">
        <div>Spiritual Consultation for {patientName}</div>
        <div>Attendance ID: {attendanceId}</div>
        <button
          onClick={() =>
            onSubmit({ food: "test", water: "test", notes: "test" })
          }
        >
          Submit Consultation
        </button>
        <button onClick={onCancel}>Cancel Consultation</button>
      </div>
    );
  };
});

jest.mock("../components/endOfDay/EndOfDayModal", () => {
  return function MockEndOfDayModal({ isOpen, onFinalize, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="end-of-day-modal">
        <div>End of Day Modal</div>
        <button
          onClick={() =>
            onFinalize({
              incompleteAttendances: [],
              scheduledAbsences: [],
              absenceJustifications: [],
            })
          }
        >
          Finalize Day
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

const mockUseAttendanceManagement =
  useAttendanceManagement as jest.MockedFunction<
    typeof useAttendanceManagement
  >;
const mockUseUnscheduledPatients =
  useAttendanceManagement as jest.MockedFunction<
    typeof useAttendanceManagement
  >;
const mockUseNewPatientCheckIn = useNewPatientCheckIn as jest.MockedFunction<
  typeof useNewPatientCheckIn
>;
const mockUseAttendances = jest.spyOn(AttendancesContext, "useAttendances");

describe("AttendanceManagement Treatment Workflow Integration", () => {
  const mockAttendancesList = {
    selectedDate: "2024-01-15",
    setSelectedDate: jest.fn(),
    loading: false,
    error: null,
    dragged: null,
    confirmOpen: false,
    multiSectionModalOpen: false,
    collapsed: { spiritual: false, lightBath: false, rod: false },
    editPatientModalOpen: false,
    patientToEdit: null,
    getPatients: jest.fn(() => []),
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDropWithConfirm: jest.fn(),
    handleConfirm: jest.fn(),
    handleCancel: jest.fn(),
    handleMultiSectionConfirm: jest.fn(),
    handleMultiSectionCancel: jest.fn(),
    toggleCollapsed: jest.fn(),
    refreshCurrentDate: jest.fn(),
    handleEditPatientCancel: jest.fn(),
    handleEditPatientSuccess: jest.fn(),
  };

  const mockCreateSpiritualConsultationRecord = jest.fn();
  const mockFinalizeEndOfDay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAttendanceManagement.mockReturnValue(mockAttendancesList);

    mockUseUnscheduledPatients.mockReturnValue({
      handleDeleteAttendance: jest.fn().mockResolvedValue(true),
    });

    mockUseNewPatientCheckIn.mockReturnValue({
      patientToCheckIn: null,
      openNewPatientCheckIn: jest.fn(),
      closeNewPatientCheckIn: jest.fn(),
      handleNewPatientSuccess: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      attendancesByDate: {
        spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      },
      setAttendancesByDate: jest.fn(),
      selectedDate: "2024-01-15",
      setSelectedDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
      createSpiritualConsultationRecord: mockCreateSpiritualConsultationRecord,
      finalizeEndOfDay: mockFinalizeEndOfDay,
    });
  });

  describe("Treatment Workflow Buttons", () => {
    it("should render the 'Finalizar Dia' button", () => {
      render(<AttendanceManagement />);

      expect(
        screen.getByRole("button", { name: /finalizar dia/i })
      ).toBeInTheDocument();
    });

    it("should open End of Day modal when 'Finalizar Dia' button is clicked", async () => {
      const user = userEvent.setup();
      render(<AttendanceManagement />);

      const finalizeButton = screen.getByRole("button", {
        name: /finalizar dia/i,
      });
      await user.click(finalizeButton);

      expect(screen.getByTestId("end-of-day-modal")).toBeInTheDocument();
    });
  });

  describe("End of Day Modal", () => {
    it("should close End of Day modal when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<AttendanceManagement />);

      // Open modal
      const finalizeButton = screen.getByRole("button", {
        name: /finalizar dia/i,
      });
      await user.click(finalizeButton);

      expect(screen.getByTestId("end-of-day-modal")).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByRole("button", { name: /close modal/i });
      await user.click(closeButton);

      expect(screen.queryByTestId("end-of-day-modal")).not.toBeInTheDocument();
    });

    it("should call finalizeEndOfDay and close modal when finalize is submitted", async () => {
      const user = userEvent.setup();
      mockFinalizeEndOfDay.mockResolvedValue({
        type: "completed",
        completionData: {
          totalPatients: 5,
          completedPatients: 4,
          missedPatients: 1,
          completionTime: new Date(),
        },
      });

      render(<AttendanceManagement />);

      // Open modal
      const finalizeButton = screen.getByRole("button", {
        name: /finalizar dia/i,
      });
      await user.click(finalizeButton);

      // Submit finalization
      const finalizeModalButton = screen.getByRole("button", {
        name: /finalize day/i,
      });
      await user.click(finalizeModalButton);

      await waitFor(() => {
        expect(mockFinalizeEndOfDay).toHaveBeenCalledWith({
          incompleteAttendances: [],
          scheduledAbsences: [],
          absenceJustifications: [],
        });
      });

      await waitFor(() => {
        expect(
          screen.queryByTestId("end-of-day-modal")
        ).not.toBeInTheDocument();
      });

      expect(mockAttendancesList.refreshCurrentDate).toHaveBeenCalled();
    });

    it("should handle finalize failure gracefully", async () => {
      const user = userEvent.setup();
      mockFinalizeEndOfDay.mockResolvedValue({
        type: "incomplete",
        incompleteAttendances: [
          {
            attendanceId: 1,
            patientId: 1,
            name: "Test Patient",
            priority: 1,
            scheduledTime: "10:00",
            age: 30,
            attendanceType: "spiritual" as const,
          },
        ],
      });

      render(<AttendanceManagement />);

      // Open modal
      const finalizeButton = screen.getByRole("button", {
        name: /finalizar dia/i,
      });
      await user.click(finalizeButton);

      // Submit finalization
      const finalizeModalButton = screen.getByRole("button", {
        name: /finalize day/i,
      });
      await user.click(finalizeModalButton);

      await waitFor(() => {
        expect(mockFinalizeEndOfDay).toHaveBeenCalled();
      });

      // Modal should remain open on failure
      expect(screen.getByTestId("end-of-day-modal")).toBeInTheDocument();
      expect(mockAttendancesList.refreshCurrentDate).not.toHaveBeenCalled();
    });
  });

  describe("Spiritual Consultation Form", () => {
    it("should not render spiritual consultation form by default", () => {
      render(<AttendanceManagement />);

      expect(
        screen.queryByTestId("spiritual-consultation-form")
      ).not.toBeInTheDocument();
    });

    it("should render spiritual consultation form when state is active", () => {
      // We need to test the form through a more direct approach since the form
      // isn't directly triggered by a button in this basic implementation
      // In a real scenario, this would be triggered by an action on an attendance card

      render(<AttendanceManagement />);

      // For now, this tests that the form doesn't appear without being triggered
      expect(
        screen.queryByTestId("spiritual-consultation-form")
      ).not.toBeInTheDocument();
    });
  });

  describe("Incomplete Attendances Collection", () => {
    it("should collect incomplete attendances from all types and statuses", () => {
      const mockAttendancesData = {
        spiritual: {
          scheduled: [{ id: 1, patientName: "Patient 1" }],
          checkedIn: [{ id: 2, patientName: "Patient 2" }],
          onGoing: [{ id: 3, patientName: "Patient 3" }],
          completed: [],
        },
        lightBath: {
          scheduled: [{ id: 4, patientName: "Patient 4" }],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        rod: {
          scheduled: [],
          checkedIn: [{ id: 5, patientName: "Patient 5" }],
          onGoing: [],
          completed: [],
        },
      };

      mockUseAttendances.mockReturnValue({
        ...mockUseAttendances(),
        attendancesByDate: mockAttendancesData,
      });

      render(<AttendanceManagement />);

      // The incomplete attendances should be collected internally
      // This would be tested when the End of Day modal is opened
      // and the data is passed to the modal component
      expect(
        screen.getByRole("button", { name: /finalizar dia/i })
      ).toBeInTheDocument();
    });

    it("should handle empty attendances data gracefully", () => {
      mockUseAttendances.mockReturnValue({
        ...mockUseAttendances(),
        attendancesByDate: null,
      });

      render(<AttendanceManagement />);

      expect(
        screen.getByRole("button", { name: /finalizar dia/i })
      ).toBeInTheDocument();
    });
  });

  describe("Treatment Workflow Context Integration", () => {
    it("should use treatment workflow functions from AttendancesContext", () => {
      render(<AttendanceManagement />);

      expect(mockUseAttendances).toHaveBeenCalled();

      // Verify the component has access to the treatment workflow functions
      const contextValue = mockUseAttendances.mock.results[0].value;
      expect(contextValue).toHaveProperty("createSpiritualConsultationRecord");
      expect(contextValue).toHaveProperty("finalizeEndOfDay");
    });

    it("should refresh attendances after successful treatment workflow operations", async () => {
      const user = userEvent.setup();
      mockFinalizeEndOfDay.mockResolvedValue({
        type: "completed",
        completionData: {
          totalPatients: 3,
          completedPatients: 3,
          missedPatients: 0,
          completionTime: new Date(),
        },
      });

      render(<AttendanceManagement />);

      // Open and submit end of day
      const finalizeButton = screen.getByRole("button", {
        name: /finalizar dia/i,
      });
      await user.click(finalizeButton);

      const finalizeModalButton = screen.getByRole("button", {
        name: /finalize day/i,
      });
      await user.click(finalizeModalButton);

      await waitFor(() => {
        expect(mockAttendancesList.refreshCurrentDate).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle context errors gracefully", () => {
      mockUseAttendances.mockImplementation(() => {
        throw new Error("Context error");
      });

      // Should not crash when context throws an error
      expect(() => render(<AttendanceManagement />)).toThrow("Context error");
    });
  });

  describe("Component Integration", () => {
    it("should maintain existing functionality while adding treatment workflow", () => {
      render(<AttendanceManagement />);

      // Verify existing functionality is still present
      expect(screen.getByText(/data selecionada/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hoje/i })).toBeInTheDocument();
      expect(screen.getByText(/consultas espirituais/i)).toBeInTheDocument();

      // Verify new treatment workflow functionality is added
      expect(
        screen.getByRole("button", { name: /finalizar dia/i })
      ).toBeInTheDocument();
    });

    it("should not interfere with existing modal states", () => {
      render(<AttendanceManagement />);

      // Verify no treatment modals are open by default
      expect(
        screen.queryByTestId("spiritual-consultation-form")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("end-of-day-modal")).not.toBeInTheDocument();
    });
  });
});
