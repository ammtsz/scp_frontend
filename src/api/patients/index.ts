import { AxiosError } from 'axios';
import api from '@/api/lib/axios';
import { getErrorMessage } from '../utils/functions';
import type {
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientResponseDto,
  ApiResponse
} from '../types';

export const getPatients = async (): Promise<ApiResponse<PatientResponseDto[]>> => {
  try {
    const { data } = await api.get('/patients');
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const getPatientById = async (id: string): Promise<ApiResponse<PatientResponseDto>> => {
  try {
    const { data } = await api.get(`/patients/${id}`);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const createPatient = async (patientData: CreatePatientRequest): Promise<ApiResponse<PatientResponseDto>> => {
  try {
    const { data } = await api.post('/patients', patientData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const updatePatient = async (id: string, patientData: UpdatePatientRequest): Promise<ApiResponse<PatientResponseDto>> => {
  try {
    const { data } = await api.patch(`/patients/${id}`, patientData);
    return { success: true, value: data };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};

export const deletePatient = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await api.delete(`/patients/${id}`);
    return { success: true };
  } catch (error) {
    const message = getErrorMessage((error as AxiosError).status);
    return { success: false, error: message };
  }
};