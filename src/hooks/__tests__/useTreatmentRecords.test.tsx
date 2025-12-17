import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useTreatmentRecords,
  useTreatmentRecordByAttendance,
  useCreateTreatmentRecord,
  useUpdateTreatmentRecord,
  useDeleteTreatmentRecord,
  useTreatmentRecordsCompat,
  treatmentRecordKeys,
} from "../useTreatmentRecords";
import * as treatmentRecordsAPI from "@/api/treatment-records";
import type {
  TreatmentRecordResponseDto,
  CreateTreatmentRecordRequest,
  UpdateTreatmentRecordRequest,
} from "@/api/types";

// Mock the API module
jest.mock("@/api/treatment-records");

const mockedAPI = treatmentRecordsAPI as jest.Mocked<
  typeof treatmentRecordsAPI
>;

describe("useTreatmentRecords hooks", () => {
  let queryClient: QueryClient;

  // Helper to create wrapper with QueryClient
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return TestWrapper;
  };

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTreatmentRecord: TreatmentRecordResponseDto = {
    id: 1,
    attendance_id: 123,
    main_complaint: "Test complaint",
    food: "Light meals",
    water: "Energized water",
    ointments: "Healing ointments",
    light_bath: true,
    light_bath_color: "blue",
    rod: false,
    spiritual_treatment: true,
    return_in_weeks: 2,
    notes: "Test notes",
    created_at: "2025-11-26T10:00:00Z",
    updated_at: "2025-11-26T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
        mutations: { retry: false },
      },
    });
  });

  describe("treatmentRecordKeys", () => {
    it("should generate correct query keys", () => {
      expect(treatmentRecordKeys.all).toEqual(["treatmentRecords"]);
      expect(treatmentRecordKeys.lists()).toEqual(["treatmentRecords", "list"]);
      expect(treatmentRecordKeys.details()).toEqual([
        "treatmentRecords",
        "detail",
      ]);
      expect(treatmentRecordKeys.detail("123")).toEqual([
        "treatmentRecords",
        "detail",
        "123",
      ]);
      expect(treatmentRecordKeys.byAttendance("456")).toEqual([
        "treatmentRecords",
        "attendance",
        "456",
      ]);
    });
  });

  describe("useTreatmentRecords", () => {
    it("should fetch treatment records successfully", async () => {
      const mockRecords = [mockTreatmentRecord];
      mockedAPI.getTreatmentRecords.mockResolvedValue({
        success: true,
        value: mockRecords,
      });

      const { result } = renderHook(() => useTreatmentRecords(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRecords);
      expect(mockedAPI.getTreatmentRecords).toHaveBeenCalledTimes(1);
    });

    it("should handle API error", async () => {
      const errorMessage = "Server error";
      mockedAPI.getTreatmentRecords.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTreatmentRecords(), {
        wrapper: createWrapper(),
      });

      // Wait for the error state directly, with longer timeout
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      // Verify the API was called
      expect(mockedAPI.getTreatmentRecords).toHaveBeenCalledTimes(1);
      expect(result.current.error?.message).toBe(errorMessage);
    });

    it("should handle API success but no value", async () => {
      // The query function will throw when success is false or no value
      mockedAPI.getTreatmentRecords.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useTreatmentRecords(), {
        wrapper: createWrapper(),
      });

      // Wait for the error state directly, with longer timeout
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      // Verify the API was called
      expect(mockedAPI.getTreatmentRecords).toHaveBeenCalledTimes(1);
      expect(result.current.error?.message).toBe(
        "Erro ao carregar registros de tratamento"
      );
    });

    it("should use correct query options", async () => {
      mockedAPI.getTreatmentRecords.mockResolvedValue({
        success: true,
        value: [mockTreatmentRecord],
      });

      const { result } = renderHook(() => useTreatmentRecords(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the hook uses the correct query key
      const queryData = queryClient.getQueryData(treatmentRecordKeys.lists());
      expect(queryData).toEqual([mockTreatmentRecord]);
    });
  });

  describe("useTreatmentRecordByAttendance", () => {
    it("should fetch treatment record by attendance ID", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: true,
        value: mockTreatmentRecord,
      });

      const { result } = renderHook(
        () => useTreatmentRecordByAttendance("123"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTreatmentRecord);
      expect(mockedAPI.getTreatmentRecordByAttendance).toHaveBeenCalledWith(
        "123"
      );
    });

    it("should return null for not found record", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: false,
        error: "Record not found",
      });

      const { result } = renderHook(
        () => useTreatmentRecordByAttendance("999"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(null);
    });

    it("should handle 404 errors gracefully", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: false,
        error: "404 not found",
      });

      const { result } = renderHook(
        () => useTreatmentRecordByAttendance("404"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(null);
    });

    it("should throw error for other failures", async () => {
      // The query function will throw when success is false and error is not about 'not found'
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: false,
        error: "Server error",
      });

      const { result } = renderHook(
        () => useTreatmentRecordByAttendance("123"),
        {
          wrapper: createWrapper(),
        }
      );

      // Wait for the error state directly, with longer timeout
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      // Verify the API was called
      expect(mockedAPI.getTreatmentRecordByAttendance).toHaveBeenCalledTimes(1);
      expect(result.current.error?.message).toBe("Server error");
    });

    it("should handle numeric attendance ID", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: true,
        value: mockTreatmentRecord,
      });

      const { result } = renderHook(() => useTreatmentRecordByAttendance(456), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAPI.getTreatmentRecordByAttendance).toHaveBeenCalledWith(
        "456"
      );
    });

    it("should not run query when attendanceId is falsy", () => {
      const { result } = renderHook(() => useTreatmentRecordByAttendance(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockedAPI.getTreatmentRecordByAttendance).not.toHaveBeenCalled();
    });

    it("should handle success response with no value", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(
        () => useTreatmentRecordByAttendance("123"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(null);
    });
  });

  describe("useCreateTreatmentRecord", () => {
    it("should create treatment record successfully", async () => {
      const createData: CreateTreatmentRecordRequest = {
        attendance_id: 123,
        main_complaint: "Test complaint",
        food: "Light meals",
        water: "Energized water",
        spiritual_treatment: true,
        light_bath: true,
        light_bath_color: "blue",
        return_in_weeks: 2,
      };

      mockedAPI.createTreatmentRecord.mockResolvedValue({
        success: true,
        value: { record: mockTreatmentRecord },
      });

      const { result } = renderHook(() => useCreateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(createData);

      expect(mockedAPI.createTreatmentRecord).toHaveBeenCalledWith(createData);
    });

    it("should handle create error", async () => {
      const createData: CreateTreatmentRecordRequest = {
        attendance_id: 123,
        main_complaint: "Test complaint",
        spiritual_treatment: true,
        light_bath: false,
        return_in_weeks: 1,
      };

      mockedAPI.createTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Validation failed",
      });

      const { result } = renderHook(() => useCreateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(createData)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should handle create success but no value", async () => {
      const createData: CreateTreatmentRecordRequest = {
        attendance_id: 123,
        main_complaint: "Test complaint",
        spiritual_treatment: true,
        notes: "Test notes",
      };

      mockedAPI.createTreatmentRecord.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(() => useCreateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(createData)).rejects.toThrow(
        "Erro ao criar registro de tratamento"
      );
    });

    it("should invalidate queries on success", async () => {
      const createData: CreateTreatmentRecordRequest = {
        attendance_id: 123,
        main_complaint: "Test complaint",
        spiritual_treatment: true,
        light_bath: true,
        return_in_weeks: 3,
      };

      mockedAPI.createTreatmentRecord.mockResolvedValue({
        success: true,
        value: { record: mockTreatmentRecord },
      });

      const { result } = renderHook(() => useCreateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      await result.current.mutateAsync(createData);

      // Wait a bit for the onSuccess callback to execute
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: treatmentRecordKeys.lists(),
        });
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: treatmentRecordKeys.byAttendance("123"),
      });
    });
  });

  describe("useUpdateTreatmentRecord", () => {
    it("should update treatment record successfully", async () => {
      const updateData: UpdateTreatmentRecordRequest = {
        return_in_weeks: 10,
        light_bath_color: "red",
        notes: "Updated notes",
      };

      const updatedRecord = { ...mockTreatmentRecord, ...updateData };

      mockedAPI.updateTreatmentRecord.mockResolvedValue({
        success: true,
        value: updatedRecord,
      });

      const { result } = renderHook(() => useUpdateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: "1", data: updateData });

      expect(mockedAPI.updateTreatmentRecord).toHaveBeenCalledWith(
        "1",
        updateData
      );
    });

    it("should handle update error", async () => {
      const updateData: UpdateTreatmentRecordRequest = { return_in_weeks: 10 };

      mockedAPI.updateTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Update failed",
      });

      const { result } = renderHook(() => useUpdateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ id: "1", data: updateData })
      ).rejects.toThrow("Update failed");
    });

    it("should handle numeric ID", async () => {
      const updateData: UpdateTreatmentRecordRequest = { return_in_weeks: 10 };
      const updatedRecord = { ...mockTreatmentRecord, ...updateData };

      mockedAPI.updateTreatmentRecord.mockResolvedValue({
        success: true,
        value: updatedRecord,
      });

      const { result } = renderHook(() => useUpdateTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: 123, data: updateData });

      expect(mockedAPI.updateTreatmentRecord).toHaveBeenCalledWith(
        "123",
        updateData
      );
    });
  });

  describe("useDeleteTreatmentRecord", () => {
    it("should delete treatment record successfully", async () => {
      mockedAPI.deleteTreatmentRecord.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useDeleteTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      const success = await result.current.mutateAsync("1");

      expect(success).toBe(true);
      expect(mockedAPI.deleteTreatmentRecord).toHaveBeenCalledWith("1");
    });

    it("should handle delete error", async () => {
      mockedAPI.deleteTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Delete failed",
      });

      const { result } = renderHook(() => useDeleteTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync("1")).rejects.toThrow(
        "Delete failed"
      );
    });

    it("should handle numeric ID", async () => {
      mockedAPI.deleteTreatmentRecord.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useDeleteTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(123);

      expect(mockedAPI.deleteTreatmentRecord).toHaveBeenCalledWith("123");
    });

    it("should remove queries from cache on success", async () => {
      mockedAPI.deleteTreatmentRecord.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useDeleteTreatmentRecord(), {
        wrapper: createWrapper(),
      });

      const removeQueriesSpy = jest.spyOn(queryClient, "removeQueries");

      await result.current.mutateAsync("1");

      // Wait for onSuccess callback to execute
      await waitFor(() => {
        expect(removeQueriesSpy).toHaveBeenCalledWith({
          queryKey: treatmentRecordKeys.detail("1"),
        });
      });
    });
  });

  describe("useTreatmentRecordsCompat", () => {
    beforeEach(() => {
      mockedAPI.getTreatmentRecords.mockResolvedValue({
        success: true,
        value: [mockTreatmentRecord],
      });
    });

    it("should provide compatibility interface", async () => {
      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentRecords).toEqual([mockTreatmentRecord]);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refreshTreatmentRecords).toBe("function");
      expect(typeof result.current.getTreatmentRecordForAttendance).toBe(
        "function"
      );
      expect(typeof result.current.createRecord).toBe("function");
      expect(typeof result.current.updateRecord).toBe("function");
      expect(typeof result.current.deleteRecord).toBe("function");
    });

    it("should handle error state correctly", async () => {
      // Make the API throw an error so it gets caught by React Query
      mockedAPI.getTreatmentRecords.mockRejectedValue(
        new Error("Server error")
      );

      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      // Wait for the error state directly, with longer timeout
      await waitFor(
        () => {
          expect(result.current.error).toBe("Server error");
        },
        { timeout: 3000 }
      );

      // Verify the API was called
      expect(mockedAPI.getTreatmentRecords).toHaveBeenCalledTimes(1);
      expect(result.current.treatmentRecords).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it("should refresh treatment records", async () => {
      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      await result.current.refreshTreatmentRecords();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: treatmentRecordKeys.lists(),
      });
    });

    it("should get treatment record for attendance", async () => {
      mockedAPI.getTreatmentRecordByAttendance.mockResolvedValue({
        success: true,
        value: mockTreatmentRecord,
      });

      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const record = await result.current.getTreatmentRecordForAttendance(123);

      expect(record).toEqual(mockTreatmentRecord);
    });

    it("should handle create record error", async () => {
      const createData: CreateTreatmentRecordRequest = {
        attendance_id: 123,
        main_complaint: "Test complaint",
        spiritual_treatment: true,
        light_bath: true,
        light_bath_color: "blue",
        return_in_weeks: 5,
      };

      mockedAPI.createTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Create failed",
      });

      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const record = await result.current.createRecord(createData);

      expect(record).toBe(null);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in createRecord:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle update record error", async () => {
      const updateData: UpdateTreatmentRecordRequest = { return_in_weeks: 10 };

      mockedAPI.updateTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Update failed",
      });

      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const record = await result.current.updateRecord(1, updateData);

      expect(record).toBe(null);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in updateRecord:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle delete record error", async () => {
      mockedAPI.deleteTreatmentRecord.mockResolvedValue({
        success: false,
        error: "Delete failed",
      });

      const { result } = renderHook(() => useTreatmentRecordsCompat(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const success = await result.current.deleteRecord(1);

      expect(success).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in deleteRecord:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
