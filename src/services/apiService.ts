/**
 * Enhanced API service that automatically handles snake_case/camelCase conversion
 * This layer sits between the raw API calls and the application
 */

import axios from '@/api/lib/axios';
import { ApiResponse } from '@/api/types';
import { keysToCamelCase, keysToSnakeCase } from '@/utils/caseConverters';
import { 
  Patient, 
  Attendance, 
  TreatmentRecord, 
  ScheduleSetting,
  CreatePatientRequest,
  UpdatePatientRequest,
  CreateAttendanceRequest,
  UpdateAttendanceRequest
} from '@/types/frontend';

// Generic API service that handles automatic conversion
class ApiService {
  // Generic GET method with automatic camelCase conversion
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get(endpoint);
      return {
        success: response.data.success,
        value: response.data.success ? keysToCamelCase<T>(response.data.value) : undefined,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic POST method with automatic snake_case conversion for requests
  async post<TRequest, TResponse>(endpoint: string, data: TRequest): Promise<ApiResponse<TResponse>> {
    try {
      const snakeCaseData = keysToSnakeCase(data);
      const response = await axios.post(endpoint, snakeCaseData);
      return {
        success: response.data.success,
        value: response.data.success ? keysToCamelCase<TResponse>(response.data.value) : undefined,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic PUT method with automatic snake_case conversion for requests
  async put<TRequest, TResponse>(endpoint: string, data: TRequest): Promise<ApiResponse<TResponse>> {
    try {
      const snakeCaseData = keysToSnakeCase(data);
      const response = await axios.put(endpoint, snakeCaseData);
      return {
        success: response.data.success,
        value: response.data.success ? keysToCamelCase<TResponse>(response.data.value) : undefined,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generic DELETE method
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.delete(endpoint);
      return {
        success: response.data.success,
        value: response.data.success ? keysToCamelCase<T>(response.data.value) : undefined,
        error: response.data.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Specific API methods using the camelCase types
export const patientsApi = {
  getAll: () => apiService.get<Patient[]>('/patients'),
  getById: (id: number) => apiService.get<Patient>(`/patients/${id}`),
  create: (data: CreatePatientRequest) => apiService.post<CreatePatientRequest, Patient>('/patients', data),
  update: (id: number, data: UpdatePatientRequest) => apiService.put<UpdatePatientRequest, Patient>(`/patients/${id}`, data),
  delete: (id: number) => apiService.delete<void>(`/patients/${id}`)
};

export const attendancesApi = {
  getAll: () => apiService.get<Attendance[]>('/attendances'),
  getById: (id: number) => apiService.get<Attendance>(`/attendances/${id}`),
  getByDate: (date: string) => apiService.get<Attendance[]>(`/attendances/date/${date}`),
  getNextDate: () => apiService.get<{ nextDate: string }>('/attendances/next-date'),
  create: (data: CreateAttendanceRequest) => apiService.post<CreateAttendanceRequest, Attendance>('/attendances', data),
  update: (id: number, data: UpdateAttendanceRequest) => apiService.put<UpdateAttendanceRequest, Attendance>(`/attendances/${id}`, data),
  delete: (id: number) => apiService.delete<void>(`/attendances/${id}`),
  bulkUpdateStatus: (ids: number[], status: string) => 
    apiService.put<{ ids: number[]; status: string }, { updated: number; success: boolean }>('/attendances/bulk-status', { ids, status })
};

export const treatmentRecordsApi = {
  getAll: () => apiService.get<TreatmentRecord[]>('/treatment-records'),
  getByAttendanceId: (attendanceId: number) => apiService.get<TreatmentRecord>(`/treatment-records/attendance/${attendanceId}`),
  create: (data: Partial<TreatmentRecord>) => apiService.post<Partial<TreatmentRecord>, TreatmentRecord>('/treatment-records', data),
  update: (id: number, data: Partial<TreatmentRecord>) => apiService.put<Partial<TreatmentRecord>, TreatmentRecord>(`/treatment-records/${id}`, data),
  delete: (id: number) => apiService.delete<void>(`/treatment-records/${id}`)
};

export const scheduleSettingsApi = {
  getAll: () => apiService.get<ScheduleSetting[]>('/schedule-settings'),
  getById: (id: number) => apiService.get<ScheduleSetting>(`/schedule-settings/${id}`),
  create: (data: Partial<ScheduleSetting>) => apiService.post<Partial<ScheduleSetting>, ScheduleSetting>('/schedule-settings', data),
  update: (id: number, data: Partial<ScheduleSetting>) => apiService.put<Partial<ScheduleSetting>, ScheduleSetting>(`/schedule-settings/${id}`, data),
  delete: (id: number) => apiService.delete<void>(`/schedule-settings/${id}`)
};

export default apiService;
