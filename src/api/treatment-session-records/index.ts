import { AxiosError } from 'axios';
import api from '@/api/lib/axios';
import { getErrorMessage } from '../utils/functions';
import type {
  CreateTreatmentSessionRecordRequest,
  UpdateTreatmentSessionRecordRequest,
  CompleteTreatmentSessionRecordRequest,
  MarkMissedTreatmentSessionRecordRequest,
  RescheduleTreatmentSessionRecordRequest,
  TreatmentSessionRecordResponseDto,
  TreatmentAnalyticsData,
  MissedSessionsAnalyticsData,
  ApiResponse
} from '../types';

export const getTreatmentSessionRecords = async (): Promise<ApiResponse<TreatmentSessionRecordResponseDto[]>> => {
  try {
    const { data } = await api.get('/treatment-session-records');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionRecordById = async (id: string): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.get(`/treatment-session-records/${id}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionRecordsBySession = async (sessionId: string): Promise<ApiResponse<TreatmentSessionRecordResponseDto[]>> => {
  try {
    const { data } = await api.get(`/treatment-session-records/session/${sessionId}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionRecordsByPatient = async (patientId: string): Promise<ApiResponse<TreatmentSessionRecordResponseDto[]>> => {
  try {
    const { data } = await api.get(`/treatment-session-records/patient/${patientId}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const createTreatmentSessionRecord = async (recordData: CreateTreatmentSessionRecordRequest): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.post('/treatment-session-records', recordData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const updateTreatmentSessionRecord = async (id: string, recordData: UpdateTreatmentSessionRecordRequest): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.put(`/treatment-session-records/${id}`, recordData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const completeTreatmentSessionRecord = async (id: string, completionData: CompleteTreatmentSessionRecordRequest): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.post(`/treatment-session-records/${id}/complete`, completionData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const markTreatmentSessionRecordMissed = async (id: string, missedData: MarkMissedTreatmentSessionRecordRequest): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.post(`/treatment-session-records/${id}/mark-missed`, missedData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const rescheduleTreatmentSessionRecord = async (id: string, rescheduleData: RescheduleTreatmentSessionRecordRequest): Promise<ApiResponse<TreatmentSessionRecordResponseDto>> => {
  try {
    const { data } = await api.post(`/treatment-session-records/${id}/reschedule`, rescheduleData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionRecordsAnalytics = async (params?: {
  patient_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<TreatmentAnalyticsData>> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const { data } = await api.get(`/treatment-session-records/analytics/completion-rate?${searchParams.toString()}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getMissedSessionsAnalytics = async (params?: {
  patient_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<MissedSessionsAnalyticsData>> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.patient_id) searchParams.append('patient_id', params.patient_id);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    
    const { data } = await api.get(`/treatment-session-records/analytics/missed-sessions?${searchParams.toString()}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const deleteTreatmentSessionRecord = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/treatment-session-records/${id}`);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};
