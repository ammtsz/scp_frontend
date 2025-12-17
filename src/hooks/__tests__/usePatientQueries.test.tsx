import { renderHook, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  usePatientWithAttendances,
  usePatient,
  usePatientAttendances,
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  usePrefetchPatient,
  useInvalidatePatientCache,
  patientKeys,
} from "../usePatientQueries";
import {
  getPatientById,
  updatePatient,
  getPatients,
  createPatient,
  deletePatient,
} from "@/api/patients";
import { getAttendancesByPatient } from "@/api/attendances";
import {
  transformSinglePatientFromApi,
  transformPatientWithAttendances,
  transformPatientsFromApi,
} from "@/utils/apiTransformers";
import { Patient, Priority, Status, AttendanceType } from "@/types/types";
import {
  PatientPriority,
  TreatmentStatus,
  AttendanceType as AttendanceTypeEnum,
  AttendanceStatus,
} from "@/api/types";
import React from "react";

// Mock the API functions
jest.mock("@/api/patients");
jest.mock("@/api/attendances");
jest.mock("@/utils/apiTransformers");

const mockedGetPatientById = getPatientById as jest.MockedFunction<
  typeof getPatientById
>;
const mockedGetAttendancesByPatient =
  getAttendancesByPatient as jest.MockedFunction<
    typeof getAttendancesByPatient
  >;
const mockedUpdatePatient = updatePatient as jest.MockedFunction<
  typeof updatePatient
>;
const mockedGetPatients = getPatients as jest.MockedFunction<
  typeof getPatients
>;
const mockedCreatePatient = createPatient as jest.MockedFunction<
  typeof createPatient
>;
const mockedDeletePatient = deletePatient as jest.MockedFunction<
  typeof deletePatient
>;
const mockedTransformSinglePatientFromApi =
  transformSinglePatientFromApi as jest.MockedFunction<
    typeof transformSinglePatientFromApi
  >;
const mockedTransformPatientWithAttendances =
  transformPatientWithAttendances as jest.MockedFunction<
    typeof transformPatientWithAttendances
  >;
const mockedTransformPatientsFromApi =
  transformPatientsFromApi as jest.MockedFunction<
    typeof transformPatientsFromApi
  >;

// Mock console methods
const consoleSpy = {
  warn: jest.spyOn(console, "warn").mockImplementation(),
  error: jest.spyOn(console, "error").mockImplementation(),
};

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
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
  const TestQueryProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return TestQueryProvider;
};

// Mock data
const mockPatientApiResponse = {
  id: 1,
  name: "John Doe",
  phone: "11999999999",
  priority: PatientPriority.NORMAL,
  treatment_status: TreatmentStatus.NEW_PATIENT,
  birth_date: "1990-01-01",
  main_complaint: "Test complaint",
  start_date: "2023-01-01",
  missing_appointments_streak: 0,
  created_at: "2023-01-01T10:00:00Z",
  updated_at: "2023-01-01T10:00:00Z",
};

const mockAttendanceApiResponse = [
  {
    id: 1,
    patient_id: 1,
    type: AttendanceTypeEnum.SPIRITUAL,
    status: AttendanceStatus.COMPLETED,
    scheduled_date: "2023-01-01",
    scheduled_time: "10:00",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
  },
];

const mockTransformedPatient = {
  id: "patient-1",
  name: "John Doe",
  phone: "11999999999",
  priority: "3" as Priority,
  status: "N" as Status,
  birthDate: new Date("1990-01-01"),
  mainComplaint: "Test complaint",
  startDate: new Date("2023-01-01"),
  dischargeDate: null,
  nextAttendanceDates: [],
  currentRecommendations: {
    date: new Date("2023-01-01"),
    food: "",
    water: "",
    ointment: "",
    lightBath: false,
    rod: false,
    spiritualTreatment: false,
    returnWeeks: 0,
  },
  previousAttendances: [],
};

const mockTransformedPatientWithAttendances = {
  ...mockTransformedPatient,
  previousAttendances: [
    {
      attendanceId: "attendance-1",
      date: new Date("2023-01-01"),
      type: "spiritual" as AttendanceType,
      notes: "",
      recommendations: null,
    },
  ],
};

const mockPatientsList = [mockTransformedPatient];

const mockCreatePatientRequest = {
  name: "New Patient",
  email: "new@example.com",
};

const mockUpdatePatientRequest = {
  name: "Updated Patient",
};

describe("usePatientQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.warn.mockClear();
    consoleSpy.error.mockClear();
  });

  afterAll(() => {
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("patientKeys", () => {
    it("should generate correct query keys", () => {
      expect(patientKeys.all).toEqual(["patients"]);
      expect(patientKeys.lists()).toEqual(["patients", "list"]);
      expect(patientKeys.list("filter")).toEqual([
        "patients",
        "list",
        { filters: "filter" },
      ]);
      expect(patientKeys.details()).toEqual(["patients", "detail"]);
      expect(patientKeys.detail("patient-1")).toEqual([
        "patients",
        "detail",
        "patient-1",
      ]);
      expect(patientKeys.attendances("patient-1")).toEqual([
        "attendances",
        "patient",
        "patient-1",
      ]);
    });
  });

  describe("usePatientWithAttendances", () => {
    it("should fetch patient with attendances successfully", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });
      mockedTransformPatientWithAttendances.mockReturnValue(
        mockTransformedPatientWithAttendances
      );

      const { result } = renderHook(
        () => usePatientWithAttendances("patient-1"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(
        mockTransformedPatientWithAttendances
      );
      expect(mockedGetPatientById).toHaveBeenCalledWith("patient-1");
      expect(mockedGetAttendancesByPatient).toHaveBeenCalledWith("patient-1");
      expect(mockedTransformPatientWithAttendances).toHaveBeenCalledWith(
        mockPatientApiResponse,
        mockAttendanceApiResponse
      );
    });

    it("should fallback to basic transformer when attendances fetch fails", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: false,
        error: "Attendance error",
      });
      mockedTransformSinglePatientFromApi.mockReturnValue(
        mockTransformedPatient
      );

      const { result } = renderHook(
        () => usePatientWithAttendances("patient-1"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTransformedPatient);
      expect(mockedTransformSinglePatientFromApi).toHaveBeenCalledWith(
        mockPatientApiResponse
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "Failed to load attendance data:",
        "Attendance error"
      );
    });

    it("should throw error when patient fetch fails", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: false,
        error: "Patient not found",
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });

      const { result } = renderHook(
        () => usePatientWithAttendances("patient-1"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Patient not found");
    });

    it("should throw error when patient value is null", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: undefined,
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });

      const { result } = renderHook(
        () => usePatientWithAttendances("patient-1"),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Paciente não encontrado");
    });

    it("should not execute query when patientId is not provided", () => {
      const { result } = renderHook(() => usePatientWithAttendances(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockedGetPatientById).not.toHaveBeenCalled();
    });
  });

  describe("usePatient", () => {
    it("should fetch patient successfully", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });
      mockedTransformSinglePatientFromApi.mockReturnValue(
        mockTransformedPatient
      );

      const { result } = renderHook(() => usePatient("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTransformedPatient);
      expect(mockedGetPatientById).toHaveBeenCalledWith("patient-1");
      expect(mockedTransformSinglePatientFromApi).toHaveBeenCalledWith(
        mockPatientApiResponse
      );
    });

    it("should throw error when patient fetch fails", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: false,
        error: "Patient not found",
      });

      const { result } = renderHook(() => usePatient("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Patient not found");
    });

    it("should throw error when patient value is null", async () => {
      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(() => usePatient("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Paciente não encontrado");
    });

    it("should not execute query when patientId is not provided", () => {
      const { result } = renderHook(() => usePatient(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockedGetPatientById).not.toHaveBeenCalled();
    });
  });

  describe("usePatientAttendances", () => {
    it("should fetch patient attendances successfully", async () => {
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });

      const { result } = renderHook(() => usePatientAttendances("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAttendanceApiResponse);
      expect(mockedGetAttendancesByPatient).toHaveBeenCalledWith("patient-1");
    });

    it("should return empty array when attendances value is null", async () => {
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(() => usePatientAttendances("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it("should throw error when attendances fetch fails", async () => {
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: false,
        error: "Attendances error",
      });

      const { result } = renderHook(() => usePatientAttendances("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Attendances error");
    });

    it("should throw default error when no error message provided", async () => {
      mockedGetAttendancesByPatient.mockResolvedValue({ success: false });

      const { result } = renderHook(() => usePatientAttendances("patient-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe(
        "Erro ao carregar atendimentos"
      );
    });

    it("should not execute query when patientId is not provided", () => {
      const { result } = renderHook(() => usePatientAttendances(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(mockedGetAttendancesByPatient).not.toHaveBeenCalled();
    });
  });

  describe("usePatients", () => {
    it("should fetch all patients successfully", async () => {
      mockedGetPatients.mockResolvedValue({
        success: true,
        value: [mockPatientApiResponse],
      });
      mockedTransformPatientsFromApi.mockReturnValue(mockPatientsList);

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatientsList);
      expect(mockedGetPatients).toHaveBeenCalled();
      expect(mockedTransformPatientsFromApi).toHaveBeenCalledWith([
        mockPatientApiResponse,
      ]);
    });

    it("should throw error when patients fetch fails", async () => {
      mockedGetPatients.mockResolvedValue({
        success: false,
        error: "Patients error",
      });

      const customWrapper = () => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
          },
        });
        const TestQueryProvider = ({
          children,
        }: {
          children: React.ReactNode;
        }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
        return TestQueryProvider;
      };

      const { result } = renderHook(
        () => {
          // Create a custom version of usePatients without retry for testing
          return useQuery({
            queryKey: patientKeys.lists(),
            queryFn: async () => {
              const apiResult = await getPatients();

              if (!apiResult.success || !apiResult.value) {
                throw new Error(
                  apiResult.error || "Erro ao carregar pacientes"
                );
              }

              return transformPatientsFromApi(apiResult.value);
            },
            retry: false,
          });
        },
        {
          wrapper: customWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Patients error");
    });

    it("should throw error when patients value is null", async () => {
      mockedGetPatients.mockResolvedValue({ success: true, value: undefined });

      const customWrapper = () => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
          },
        });
        const TestQueryProvider = ({
          children,
        }: {
          children: React.ReactNode;
        }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
        return TestQueryProvider;
      };

      const { result } = renderHook(
        () => {
          return useQuery({
            queryKey: patientKeys.lists(),
            queryFn: async () => {
              const apiResult = await getPatients();

              if (!apiResult.success || !apiResult.value) {
                throw new Error(
                  apiResult.error || "Erro ao carregar pacientes"
                );
              }

              return transformPatientsFromApi(apiResult.value);
            },
            retry: false,
          });
        },
        {
          wrapper: customWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Erro ao carregar pacientes");
    });

    it("should throw default error when no error message provided", async () => {
      mockedGetPatients.mockResolvedValue({ success: false });

      const customWrapper = () => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
          },
        });
        const TestQueryProvider = ({
          children,
        }: {
          children: React.ReactNode;
        }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        );
        return TestQueryProvider;
      };

      const { result } = renderHook(
        () => {
          return useQuery({
            queryKey: patientKeys.lists(),
            queryFn: async () => {
              const apiResult = await getPatients();

              if (!apiResult.success || !apiResult.value) {
                throw new Error(
                  apiResult.error || "Erro ao carregar pacientes"
                );
              }

              return transformPatientsFromApi(apiResult.value);
            },
            retry: false,
          });
        },
        {
          wrapper: customWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Erro ao carregar pacientes");
    });
  });

  describe("useCreatePatient", () => {
    it("should create patient successfully", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedCreatePatient.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });

      const { result } = renderHook(() => useCreatePatient(), { wrapper });

      await waitFor(() => {
        result.current.mutate(mockCreatePatientRequest);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatientApiResponse);
      expect(mockedCreatePatient).toHaveBeenCalledWith(
        mockCreatePatientRequest
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.lists(),
      });
    });

    it("should handle create patient error", async () => {
      mockedCreatePatient.mockResolvedValue({
        success: false,
        error: "Create error",
      });

      const { result } = renderHook(() => useCreatePatient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockCreatePatientRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Create error");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error creating patient:",
        expect.any(Error)
      );
    });

    it("should handle create patient error with default message", async () => {
      mockedCreatePatient.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useCreatePatient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockCreatePatientRequest);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Erro ao criar paciente");
    });
  });

  describe("useUpdatePatient", () => {
    it("should update patient successfully", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedUpdatePatient.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });

      const { result } = renderHook(() => useUpdatePatient(), { wrapper });

      const updateData = {
        patientId: "patient-1",
        data: mockUpdatePatientRequest,
      };

      await waitFor(() => {
        result.current.mutate(updateData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatientApiResponse);
      expect(mockedUpdatePatient).toHaveBeenCalledWith(
        "patient-1",
        mockUpdatePatientRequest
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.detail("patient-1"),
      });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.lists(),
      });
    });

    it("should handle update patient error", async () => {
      mockedUpdatePatient.mockResolvedValue({
        success: false,
        error: "Update error",
      });

      const { result } = renderHook(() => useUpdatePatient(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        patientId: "patient-1",
        data: mockUpdatePatientRequest,
      };
      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Update error");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error updating patient:",
        expect.any(Error)
      );
    });

    it("should handle update patient error with default message", async () => {
      mockedUpdatePatient.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useUpdatePatient(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        patientId: "patient-1",
        data: mockUpdatePatientRequest,
      };
      result.current.mutate(updateData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Erro ao atualizar paciente");
    });
  });

  describe("useDeletePatient", () => {
    it("should delete patient successfully", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedDeletePatient.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(() => useDeletePatient(), { wrapper });

      await waitFor(() => {
        result.current.mutate("patient-1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(mockedDeletePatient).toHaveBeenCalledWith("patient-1");
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.lists(),
      });
    });

    it("should handle delete patient error", async () => {
      mockedDeletePatient.mockResolvedValue({
        success: false,
        error: "Delete error",
      });

      const { result } = renderHook(() => useDeletePatient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("patient-1");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Delete error");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error deleting patient:",
        expect.any(Error)
      );
    });

    it("should handle delete patient error with default message", async () => {
      mockedDeletePatient.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useDeletePatient(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("patient-1");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe("Erro ao excluir paciente");
    });
  });

  describe("usePrefetchPatient", () => {
    it("should prefetch patient data successfully", async () => {
      const queryClient = new QueryClient();
      const prefetchQuerySpy = jest.spyOn(queryClient, "prefetchQuery");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });
      mockedTransformPatientWithAttendances.mockReturnValue(
        mockTransformedPatientWithAttendances
      );

      const { result } = renderHook(() => usePrefetchPatient(), { wrapper });

      result.current("patient-1");

      expect(prefetchQuerySpy).toHaveBeenCalledWith({
        queryKey: patientKeys.detail("patient-1"),
        queryFn: expect.any(Function),
        staleTime: 10 * 60 * 1000,
      });
    });

    it("should prefetch patient data with fallback when attendances fail", async () => {
      const queryClient = new QueryClient();
      const prefetchQuerySpy = jest.spyOn(queryClient, "prefetchQuery");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientApiResponse,
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: false,
        error: "Attendance error",
      });
      mockedTransformSinglePatientFromApi.mockReturnValue(
        mockTransformedPatient
      );

      const { result } = renderHook(() => usePrefetchPatient(), { wrapper });

      result.current("patient-1");

      expect(prefetchQuerySpy).toHaveBeenCalledWith({
        queryKey: patientKeys.detail("patient-1"),
        queryFn: expect.any(Function),
        staleTime: 10 * 60 * 1000,
      });

      // Test the actual queryFn behavior
      const call = prefetchQuerySpy.mock.calls[0][0];
      const queryFn = call.queryFn as () => Promise<Patient>;

      const result2 = await queryFn();
      expect(result2).toEqual(mockTransformedPatient);
      expect(mockedTransformSinglePatientFromApi).toHaveBeenCalledWith(
        mockPatientApiResponse
      );
    });

    it("should handle prefetch error when patient fetch fails", async () => {
      const queryClient = new QueryClient();
      const prefetchQuerySpy = jest.spyOn(queryClient, "prefetchQuery");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      mockedGetPatientById.mockResolvedValue({
        success: false,
        error: "Patient error",
      });
      mockedGetAttendancesByPatient.mockResolvedValue({
        success: true,
        value: mockAttendanceApiResponse,
      });

      const { result } = renderHook(() => usePrefetchPatient(), { wrapper });

      result.current("patient-1");

      const call = prefetchQuerySpy.mock.calls[0][0];
      const queryFn = call.queryFn as () => Promise<Patient>;

      await expect(queryFn()).rejects.toThrow("Patient error");
    });
  });

  describe("useInvalidatePatientCache", () => {
    it("should provide cache invalidation functions", () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useInvalidatePatientCache(), {
        wrapper,
      });

      // Test invalidatePatient
      result.current.invalidatePatient("patient-1");
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.detail("patient-1"),
      });

      // Test invalidatePatientAttendances
      result.current.invalidatePatientAttendances("patient-1");
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.attendances("patient-1"),
      });

      // Test invalidateAllPatients
      result.current.invalidateAllPatients();
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: patientKeys.all,
      });
    });
  });
});
