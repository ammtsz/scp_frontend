import { renderHook, act } from "@testing-library/react";
import { useTreatmentWorkflow } from "../useTreatmentWorkflow";
import type { AbsenceJustification } from "../../components/EndOfDay/types";

describe("useTreatmentWorkflow", () => {
  const mockRefreshCurrentDate = jest.fn();
  const mockFinalizeDay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFinalizeDay.mockReset();
    mockRefreshCurrentDate.mockReset();
  });

  it("should initialize with modal closed", () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    expect(result.current.endOfDayModalOpen).toBe(false);
  });

  it("should open modal when openEndOfDayModal is called", () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    act(() => {
      result.current.openEndOfDayModal();
    });

    expect(result.current.endOfDayModalOpen).toBe(true);
  });

  it("should close modal when closeEndOfDayModal is called", () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    act(() => {
      result.current.openEndOfDayModal();
    });

    expect(result.current.endOfDayModalOpen).toBe(true);

    act(() => {
      result.current.closeEndOfDayModal();
    });

    expect(result.current.endOfDayModalOpen).toBe(false);
  });

  it("should handle end of day submission successfully", async () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    const mockAbsenceJustifications: AbsenceJustification[] = [
      {
        patientId: 1,
        patientName: "Patient 1",
        attendanceType: "spiritual",
        justified: true,
        justification: "Emergency",
      },
      {
        patientId: 2,
        patientName: "Patient 2", 
        attendanceType: "lightBath",
        justified: false,
      },
    ];

    // Open modal first
    act(() => {
      result.current.openEndOfDayModal();
    });

    expect(result.current.endOfDayModalOpen).toBe(true);

    // Submit end of day
    await act(async () => {
      await result.current.handleEndOfDaySubmit(mockAbsenceJustifications);
    });

    // Verify all expected functions were called
    expect(mockFinalizeDay).toHaveBeenCalledTimes(1);
    expect(mockRefreshCurrentDate).toHaveBeenCalledTimes(1);
    expect(result.current.endOfDayModalOpen).toBe(false);
  });

  it("should handle errors during submission", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const mockError = new Error("Finalization failed");
    mockFinalizeDay.mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    const mockAbsenceJustifications: AbsenceJustification[] = [];

    // Open modal first
    act(() => {
      result.current.openEndOfDayModal();
    });

    // Submit end of day and expect error to be thrown
    await expect(
      act(async () => {
        await result.current.handleEndOfDaySubmit(mockAbsenceJustifications);
      })
    ).rejects.toThrow("Finalization failed");

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error finalizing day:", mockError);
    expect(mockFinalizeDay).toHaveBeenCalledTimes(1);
    expect(mockRefreshCurrentDate).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should log absence justifications during submission", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    const mockAbsenceJustifications: AbsenceJustification[] = [
      {
        patientId: 1,
        patientName: "Patient 1",
        attendanceType: "spiritual",
        justified: true,
        justification: "Family emergency",
      },
    ];

    await act(async () => {
      await result.current.handleEndOfDaySubmit(mockAbsenceJustifications);
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Processing absence justifications:",
      mockAbsenceJustifications
    );

    consoleLogSpy.mockRestore();
  });

  it("should handle empty absence justifications array", async () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    await act(async () => {
      await result.current.handleEndOfDaySubmit([]);
    });

    expect(mockFinalizeDay).toHaveBeenCalledTimes(1);
    expect(mockRefreshCurrentDate).toHaveBeenCalledTimes(1);
    expect(result.current.endOfDayModalOpen).toBe(false);
  });

  it("should return all expected functions and state", () => {
    const { result } = renderHook(() =>
      useTreatmentWorkflow(mockRefreshCurrentDate, mockFinalizeDay)
    );

    expect(typeof result.current.endOfDayModalOpen).toBe("boolean");
    expect(typeof result.current.handleEndOfDaySubmit).toBe("function");
    expect(typeof result.current.openEndOfDayModal).toBe("function");
    expect(typeof result.current.closeEndOfDayModal).toBe("function");
  });
});