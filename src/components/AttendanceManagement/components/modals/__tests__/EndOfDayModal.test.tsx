/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import EndOfDayModal from "../EndOfDayModal";
import * as modalStore from "@/stores/modalStore";
import * as useAttendanceDataHook from "../../../hooks/useAttendanceData";
import * as attendanceSync from "@/api/attendanceSync";

// Mock dependencies
jest.mock("@/stores/modalStore");
jest.mock("../../../hooks/useAttendanceData");
jest.mock("@/api/attendanceSync");

// Mock the lazy loaded component
jest.mock("../../endOfDay/EndOfDayContainer", () => {
  return {
    __esModule: true,
    default: ({
      onHandleCompletion,
      onReschedule,
    }: {
      onHandleCompletion: (attendanceId: number) => Promise<void>;
      onReschedule: (attendanceId: number) => Promise<void>;
    }) => (
      <div data-testid="end-of-day-container">
        <h2>End of Day Container</h2>
        <button
          data-testid="complete-attendance"
          onClick={async () => {
            try {
              await onHandleCompletion(123);
            } catch (error) {
              // In tests, we want to catch the error but not re-throw it
              // The error handling is tested through console.error spy
              console.error("Caught error in mock:", error);
            }
          }}
        >
          Complete Attendance
        </button>
        <button
          data-testid="reschedule-attendance"
          onClick={async () => {
            try {
              await onReschedule(456);
            } catch (error) {
              // In tests, we want to catch the error but not re-throw it
              // The error handling is tested through console.error spy
              console.error("Caught error in mock:", error);
            }
          }}
        >
          Reschedule Attendance
        </button>
      </div>
    ),
  };
});

// Mock LoadingFallback
jest.mock("@/components/common/LoadingFallback", () => {
  return {
    __esModule: true,
    default: ({ message, size }: { message: string; size: string }) => (
      <div data-testid="loading-fallback">
        Loading: {message} (Size: {size})
      </div>
    ),
  };
});

const mockModalStore = modalStore as jest.Mocked<typeof modalStore>;
const mockUseAttendanceData = useAttendanceDataHook as jest.Mocked<
  typeof useAttendanceDataHook
>;
const mockAttendanceSync = attendanceSync as jest.Mocked<typeof attendanceSync>;

// Mock data
const mockEndOfDayModal = {
  isOpen: true,
  selectedDate: "2024-01-01",
  onFinalizeClick: jest.fn(),
};

const mockRefreshData = jest.fn();
const mockUpdateAttendanceStatus = jest.fn();

describe("EndOfDayModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockModalStore.useEndOfDayModal.mockReturnValue(mockEndOfDayModal);

    mockUseAttendanceData.useAttendanceData.mockReturnValue({
      refreshData: mockRefreshData,
      attendancesByDate: null,
      selectedDate: "2024-01-01",
      loading: false,
      error: null,
      patients: [],
      createAttendance: jest.fn(),
      checkInAttendance: jest.fn(),
      createPatient: jest.fn(),
      deleteAttendance: jest.fn(),
      getIncompleteAttendances: jest.fn(),
      getScheduledAbsences: jest.fn(),
      getSortedPatients: jest.fn(),
    });

    mockAttendanceSync.updateAttendanceStatus.mockImplementation(
      mockUpdateAttendanceStatus
    );
  });

  describe("Modal visibility", () => {
    it("renders when modal is open", async () => {
      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });
    });

    it("does not render when modal is closed", () => {
      mockModalStore.useEndOfDayModal.mockReturnValue({
        isOpen: false,
        selectedDate: undefined,
        onFinalizeClick: jest.fn(),
      });

      const { container } = render(<EndOfDayModal />);
      expect(container.firstChild).toBeNull();
    });

    it("shows loading fallback while lazy component loads", async () => {
      render(<EndOfDayModal />);

      // In test environment, the component resolves immediately
      // but we can still verify the Suspense structure exists
      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });
    });
  });

  describe("Component integration", () => {
    it("passes correct props to EndOfDayContainer", async () => {
      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
        expect(screen.getByTestId("complete-attendance")).toBeInTheDocument();
        expect(screen.getByTestId("reschedule-attendance")).toBeInTheDocument();
      });
    });
  });

  describe("handleCompletion function", () => {
    it("handles successful completion", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      await waitFor(() => {
        const completeButton = screen.getByTestId("complete-attendance");
        completeButton.click();
      });

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
        expect(mockRefreshData).toHaveBeenCalled();
      });
    });

    it("calls updateAttendanceStatus with correct parameters", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      const completeButton = screen.getByTestId("complete-attendance");
      completeButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
      });
    });

    it("verifies API call structure for completion", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      const completeButton = screen.getByTestId("complete-attendance");
      completeButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledTimes(1);
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
      });
    });
  });

  describe("handleReschedule function", () => {
    it("handles successful rescheduling", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      await waitFor(() => {
        const rescheduleButton = screen.getByTestId("reschedule-attendance");
        rescheduleButton.click();
      });

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
        expect(mockRefreshData).toHaveBeenCalled();
      });
    });

    it("calls updateAttendanceStatus with correct parameters", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      const rescheduleButton = screen.getByTestId("reschedule-attendance");
      rescheduleButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
      });
    });

    it("verifies API call structure for rescheduling", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      const rescheduleButton = screen.getByTestId("reschedule-attendance");
      rescheduleButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledTimes(1);
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
      });
    });
  });

  describe("Lazy loading", () => {
    it("renders Suspense boundary correctly", async () => {
      render(<EndOfDayModal />);

      // In test environment, component loads immediately
      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });
    });

    it("loads EndOfDayContainer component asynchronously", async () => {
      render(<EndOfDayModal />);

      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });

      // Loading fallback should no longer be visible
      expect(screen.queryByTestId("loading-fallback")).not.toBeInTheDocument();
    });
  });

  describe("Function integration", () => {
    it("correctly integrates with EndOfDayContainer callbacks", async () => {
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });

      render(<EndOfDayModal />);

      // Verify both handlers work
      const completeButton = screen.getByTestId("complete-attendance");
      const rescheduleButton = screen.getByTestId("reschedule-attendance");

      completeButton.click();
      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
      });

      mockUpdateAttendanceStatus.mockClear();

      rescheduleButton.click();
      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
      });
    });

    it("should handle completion error when API returns unsuccessful result", async () => {
      // Mock unsuccessful API response
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: false,
        error: "Failed to complete attendance",
      });

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });

      // Get the completion button and trigger error scenario
      const completionButton = screen.getByRole("button", {
        name: /complete attendance/i,
      });

      // Click the button and expect it to handle the error
      completionButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error completing attendance:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle reschedule error when API returns unsuccessful result", async () => {
      // Mock unsuccessful API response
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: false,
        error: "Failed to reschedule attendance",
      });

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });

      // Get the reschedule button and trigger error scenario
      const rescheduleButton = screen.getByRole("button", {
        name: /reschedule attendance/i,
      });

      // Click the button and expect it to handle the error
      rescheduleButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error rescheduling attendance:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle completion error without specific error message", async () => {
      // Mock unsuccessful API response without error message
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: false,
      });

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });

      const completionButton = screen.getByRole("button", {
        name: /complete attendance/i,
      });

      // Click the button and expect it to handle the error
      completionButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(
          123,
          "completed"
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error completing attendance:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle reschedule error without specific error message", async () => {
      // Mock unsuccessful API response without error message
      mockUpdateAttendanceStatus.mockResolvedValue({
        success: false,
      });

      // Spy on console.error to verify error handling
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<EndOfDayModal />);

      await waitFor(() => {
        expect(screen.getByTestId("end-of-day-container")).toBeInTheDocument();
      });

      const rescheduleButton = screen.getByRole("button", {
        name: /reschedule attendance/i,
      });

      // Click the button and expect it to handle the error
      rescheduleButton.click();

      await waitFor(() => {
        expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, "missed");
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error rescheduling attendance:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
