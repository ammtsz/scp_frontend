import { AxiosError } from 'axios';
import api from '@/api/lib/axios';
import { getErrorMessage } from '../utils/functions';
import type {
  CreateTreatmentSessionRequest,
  UpdateTreatmentSessionRequest,
  CompleteTreatmentSessionRequest,
  TreatmentSessionResponseDto,
  ApiResponse
} from '../types';

export const getTreatmentSessions = async (): Promise<ApiResponse<TreatmentSessionResponseDto[]>> => {
  try {
    const { data } = await api.get('/treatment-sessions');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionById = async (id: string): Promise<ApiResponse<TreatmentSessionResponseDto>> => {
  try {
    const { data } = await api.get(`/treatment-sessions/${id}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionsByPatient = async (patientId: string): Promise<ApiResponse<TreatmentSessionResponseDto[]>> => {
  try {
    const { data } = await api.get(`/treatment-sessions/patient/${patientId}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getTreatmentSessionsByDate = async (date: string): Promise<ApiResponse<TreatmentSessionResponseDto[]>> => {
  try {
    const { data } = await api.get(`/treatment-sessions/date/${date}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const createTreatmentSession = async (sessionData: CreateTreatmentSessionRequest): Promise<ApiResponse<TreatmentSessionResponseDto>> => {
  try {
    const { data } = await api.post('/treatment-sessions', sessionData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const updateTreatmentSession = async (id: string, sessionData: UpdateTreatmentSessionRequest): Promise<ApiResponse<TreatmentSessionResponseDto>> => {
  try {
    const { data } = await api.put(`/treatment-sessions/${id}`, sessionData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const completeTreatmentSession = async (id: string, completionData: CompleteTreatmentSessionRequest): Promise<ApiResponse<TreatmentSessionResponseDto>> => {
  try {
    // Use the general update endpoint to mark as completed
    const updateData = {
      end_date: new Date().toISOString().split('T')[0],
      notes: completionData.completion_notes || 'Treatment session completed'
    };
    const { data } = await api.put(`/treatment-sessions/${id}`, updateData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const cancelTreatmentSession = async (id: string): Promise<ApiResponse<TreatmentSessionResponseDto>> => {
  try {
    const { data } = await api.put(`/treatment-sessions/${id}/cancel`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const deleteTreatmentSession = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/treatment-sessions/${id}`);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};
