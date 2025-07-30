import { AxiosError } from 'axios';
import api from '@/api/lib/axios';
import { getErrorMessage } from '../utils/functions';
import type {
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceResponseDto,
  AttendanceAgendaDto,
  NextAttendanceDateDto,
  ApiResponse
} from '../types';
import { AttendanceStatus } from '../types';

export const getAttendances = async (): Promise<ApiResponse<AttendanceResponseDto[]>> => {
  try {
    const { data } = await api.get('/attendances');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getAttendanceById = async (id: string): Promise<ApiResponse<AttendanceResponseDto>> => {
  try {
    const { data } = await api.get(`/attendances/${id}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getAttendancesByDate = async (date: string): Promise<ApiResponse<AttendanceResponseDto[]>> => {
  try {
    const { data } = await api.get(`/attendances/date/${date}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const createAttendance = async (attendanceData: CreateAttendanceRequest): Promise<ApiResponse<AttendanceResponseDto>> => {
  try {
    const { data } = await api.post('/attendances', attendanceData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const updateAttendance = async (id: string, attendanceData: UpdateAttendanceRequest): Promise<ApiResponse<AttendanceResponseDto>> => {
  try {
    const { data } = await api.patch(`/attendances/${id}`, attendanceData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const deleteAttendance = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/attendances/${id}`);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

// Convenience methods for attendance status updates
export const checkInAttendance = async (id: string): Promise<ApiResponse<AttendanceResponseDto>> => {
  return updateAttendance(id, {
    status: AttendanceStatus.CHECKED_IN,
    checked_in_at: new Date().toISOString()
  });
};

export const startAttendance = async (id: string): Promise<ApiResponse<AttendanceResponseDto>> => {
  return updateAttendance(id, {
    status: AttendanceStatus.IN_PROGRESS,
    started_at: new Date().toISOString()
  });
};

export const completeAttendance = async (id: string): Promise<ApiResponse<AttendanceResponseDto>> => {
  return updateAttendance(id, {
    status: AttendanceStatus.COMPLETED,
    completed_at: new Date().toISOString()
  });
};

export const cancelAttendance = async (id: string): Promise<ApiResponse<AttendanceResponseDto>> => {
  return updateAttendance(id, {
    status: AttendanceStatus.CANCELLED,
    cancelled_at: new Date().toISOString()
  });
};

// Optimized endpoints for specific use cases
export const getAttendancesForAgenda = async (
  filters?: { status?: string; type?: string; limit?: number }
): Promise<ApiResponse<AttendanceAgendaDto[]>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const url = `/attendances/agenda${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await api.get(url);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getNextAttendanceDate = async (): Promise<ApiResponse<NextAttendanceDateDto>> => {
  try {
    const { data } = await api.get('/attendances/next-date');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

// Bulk update attendance statuses
export const bulkUpdateAttendanceStatus = async (
  ids: number[], 
  status: AttendanceStatus
): Promise<ApiResponse<{ updated: number; success: boolean }>> => {
  try {
    const { data } = await api.patch('/attendances/bulk-update-status', { ids, status });
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

// Get attendance statistics for a specific date
export const getAttendanceStats = async (
  date?: string
): Promise<ApiResponse<{
  total: number;
  scheduled: number;
  checked_in: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  by_type: Record<string, number>;
}>> => {
  try {
    const url = date ? `/attendances/stats?date=${date}` : '/attendances/stats';
    const { data } = await api.get(url);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};
