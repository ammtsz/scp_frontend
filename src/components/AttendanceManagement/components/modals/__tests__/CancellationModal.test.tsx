/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CancellationModal from "../CancellationModal";
import * as modalStore from "@/stores/modalStore";
import * as useAttendanceDataHook from "../../../hooks/useAttendanceData";

// Mock dependencies
jest.mock("@/stores/modalStore");
jest.mock("../../../hooks/useAttendanceData");

const mockModalStore = modalStore as jest.Mocked<typeof modalStore>;
const mockUseAttendanceData = useAttendanceDataHook as jest.Mocked<
  typeof useAttendanceDataHook
>;

// Mock data
const mockCancellationModal = {
  isOpen: true,
  attendanceId: 123,
  patientName: "Test Patient",
  isLoading: false,
};

const mockCloseModal = jest.fn();
const mockSetCancellationLoading = jest.fn();
const mockDeleteAttendance = jest.fn();
const mockRefreshData = jest.fn();

describe("CancellationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockModalStore.useCancellationModal.mockReturnValue(mockCancellationModal);
    mockModalStore.useCloseModal.mockReturnValue(mockCloseModal);
    mockModalStore.useSetCancellationLoading.mockReturnValue(
      mockSetCancellationLoading
    );

    mockUseAttendanceData.useAttendanceData.mockReturnValue({
      deleteAttendance: mockDeleteAttendance,
      refreshData: mockRefreshData,
      attendancesByDate: null,
      selectedDate: "2024-01-01",
      loading: false,
      error: null,
      patients: [],
      createAttendance: jest.fn(),
      checkInAttendance: jest.fn(),
      createPatient: jest.fn(),
      getIncompleteAttendances: jest.fn(),
      getScheduledAbsences: jest.fn(),
      getSortedPatients: jest.fn(),
    });
  });

  describe("Modal visibility", () => {
    it("renders when modal is open", () => {
      render(<CancellationModal />);
      expect(screen.getByText("Cancelar Agendamento")).toBeInTheDocument();
    });

    it("does not render when modal is closed", () => {
      mockModalStore.useCancellationModal.mockReturnValue({
        ...mockCancellationModal,
        isOpen: false,
      });

      const { container } = render(<CancellationModal />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Modal content", () => {
    it("displays patient name when available", () => {
      render(<CancellationModal />);
      expect(
        screen.getByText(/Test Patient/, { exact: false })
      ).toBeInTheDocument();
    });

    it("displays empty string when patient name is not available", () => {
      mockModalStore.useCancellationModal.mockReturnValue({
        ...mockCancellationModal,
        patientName: undefined,
      });

      render(<CancellationModal />);
      const text = screen.getByText(
        /Você está prestes a cancelar o agendamento de/
      );
      expect(text).toBeInTheDocument();
    });

    it("renders form elements", () => {
      render(<CancellationModal />);
      expect(
        screen.getByLabelText("Motivo do cancelamento")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Informe o motivo do cancelamento (opcional)"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirmar Cancelamento" })
      ).toBeInTheDocument();
    });

    it("renders close button with proper aria-label", () => {
      render(<CancellationModal />);
      expect(screen.getByLabelText("Fechar modal")).toBeInTheDocument();
    });
  });

  describe("Form interactions", () => {
    it("updates reason when user types in textarea", async () => {
      const user = userEvent.setup();
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      await user.type(textarea, "Patient requested cancellation");

      expect(textarea).toHaveValue("Patient requested cancellation");
    });

    it("handles form submission with reason", async () => {
      mockDeleteAttendance.mockResolvedValue(true);
      const user = userEvent.setup();
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });

      await user.type(textarea, "Medical reason");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(true);
        expect(mockDeleteAttendance).toHaveBeenCalledWith(
          123,
          "Medical reason"
        );
      });
    });

    it("handles form submission without reason", async () => {
      mockDeleteAttendance.mockResolvedValue(true);
      const user = userEvent.setup();
      render(<CancellationModal />);

      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeleteAttendance).toHaveBeenCalledWith(123, "");
      });
    });

    it("trims whitespace from reason before submission", async () => {
      mockDeleteAttendance.mockResolvedValue(true);
      const user = userEvent.setup();
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });

      await user.type(textarea, "  Medical reason  ");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDeleteAttendance).toHaveBeenCalledWith(
          123,
          "Medical reason"
        );
      });
    });
  });

  describe("Modal close behavior", () => {
    it("closes modal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<CancellationModal />);

      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await user.click(cancelButton);

      expect(mockCloseModal).toHaveBeenCalledWith("cancellation");
    });

    it("closes modal when X button is clicked", async () => {
      const user = userEvent.setup();
      render(<CancellationModal />);

      const closeButton = screen.getByLabelText("Fechar modal");
      await user.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalledWith("cancellation");
    });

    it("clears reason when modal is closed", async () => {
      const user = userEvent.setup();
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      await user.type(textarea, "Some reason");

      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await user.click(cancelButton);

      expect(mockCloseModal).toHaveBeenCalledWith("cancellation");
    });
  });

  describe("Loading states", () => {
    it("disables form elements when loading", () => {
      mockModalStore.useCancellationModal.mockReturnValue({
        ...mockCancellationModal,
        isLoading: true,
      });

      render(<CancellationModal />);

      expect(screen.getByLabelText("Motivo do cancelamento")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Cancelando..." })
      ).toBeDisabled();
      expect(screen.getByLabelText("Fechar modal")).toBeDisabled();
    });

    it("shows loading text on submit button when loading", () => {
      mockModalStore.useCancellationModal.mockReturnValue({
        ...mockCancellationModal,
        isLoading: true,
      });

      render(<CancellationModal />);
      expect(screen.getByText("Cancelando...")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("handles missing attendance ID", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockModalStore.useCancellationModal.mockReturnValue({
        ...mockCancellationModal,
        attendanceId: undefined,
      });

      const user = userEvent.setup();
      render(<CancellationModal />);

      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });
      await user.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith(
        "No attendance ID available for cancellation"
      );
      expect(mockDeleteAttendance).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("handles deletion failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockDeleteAttendance.mockResolvedValue(false);

      const user = userEvent.setup();
      render(<CancellationModal />);

      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(true);
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(false);
        expect(mockDeleteAttendance).toHaveBeenCalledWith(123, "");
      });

      // Modal should not close and data should not refresh
      expect(mockCloseModal).not.toHaveBeenCalled();
      expect(mockRefreshData).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("handles deletion error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("Network error");
      mockDeleteAttendance.mockRejectedValue(error);

      const user = userEvent.setup();
      render(<CancellationModal />);

      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error cancelling attendance:",
          error
        );
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(false);
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Success flow", () => {
    it("completes successful cancellation", async () => {
      mockDeleteAttendance.mockResolvedValue(true);
      const user = userEvent.setup();
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      const submitButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });

      await user.type(textarea, "Test reason");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(true);
        expect(mockDeleteAttendance).toHaveBeenCalledWith(123, "Test reason");
        expect(mockCloseModal).toHaveBeenCalledWith("cancellation");
        expect(mockRefreshData).toHaveBeenCalled();
        expect(mockSetCancellationLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Form event handling", () => {
    it("prevents default form submission", async () => {
      mockDeleteAttendance.mockResolvedValue(true);
      render(<CancellationModal />);

      const form = screen
        .getByRole("button", { name: "Confirmar Cancelamento" })
        .closest("form");
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(submitEvent, "preventDefault");

      fireEvent(form!, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Keyboard accessibility", () => {
    it("supports keyboard navigation", async () => {
      render(<CancellationModal />);

      const textarea = screen.getByLabelText("Motivo do cancelamento");
      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      const confirmButton = screen.getByRole("button", {
        name: "Confirmar Cancelamento",
      });
      const closeButton = screen.getByLabelText("Fechar modal");

      // All interactive elements should be focusable
      textarea.focus();
      expect(textarea).toHaveFocus();

      cancelButton.focus();
      expect(cancelButton).toHaveFocus();

      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });
  });
});
