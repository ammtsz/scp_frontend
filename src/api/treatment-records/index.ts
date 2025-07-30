import { AxiosError } from 'axios';
import api from '@/api/lib/axios';
import { getErrorMessage } from '../utils/functions';
import type {
  CreateTreatmentRecordRequest,
  UpdateTreatmentRecordRequest,
  TreatmentRecordResponseDto,
  ApiResponse
} from '../types';

export const getTreatmentRecords = async (): Promise<ApiResponse<TreatmentRecordResponseDto[]>> => {
  try {
    const { data } = await api.get('/treatment-records');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentRecordById = async (id: string): Promise<ApiResponse<TreatmentRecordResponseDto>> => {
  try {
    const { data } = await api.get(`/treatment-records/${id}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentRecordByAttendance = async (attendanceId: string): Promise<ApiResponse<TreatmentRecordResponseDto>> => {
  try {
    const { data } = await api.get(`/treatment-records/attendance/${attendanceId}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const createTreatmentRecord = async (treatmentData: CreateTreatmentRecordRequest): Promise<ApiResponse<TreatmentRecordResponseDto>> => {
  try {
    const { data } = await api.post('/treatment-records', treatmentData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const updateTreatmentRecord = async (id: string, treatmentData: UpdateTreatmentRecordRequest): Promise<ApiResponse<TreatmentRecordResponseDto>> => {
  try {
    const { data } = await api.patch(`/treatment-records/${id}`, treatmentData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const deleteTreatmentRecord = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/treatment-records/${id}`);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};
