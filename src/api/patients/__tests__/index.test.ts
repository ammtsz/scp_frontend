import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../index';
import { PatientPriority } from '../../types';

// Mock the api instance
jest.mock('@/api/lib/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

import api from '@/api/lib/axios';
const mockApi = api as jest.Mocked<typeof api>;

describe('Patients API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPatient = {
    id: 1,
    name: 'John Doe',
    phone: '123456789',
    priority: PatientPriority.NORMAL,
    treatment_status: 'IN_TREATMENT',
    birth_date: '1990-01-01',
    main_complaint: 'Regular checkup',
    start_date: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  describe('getPatients', () => {
    it('should return patients on success', async () => {
      const mockResponse = { data: [mockPatient] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getPatients();

      expect(mockApi.get).toHaveBeenCalledWith('/patients');
      expect(result).toEqual({
        success: true,
        value: [mockPatient]
      });
    });

    it('should return error on failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getPatients();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should handle 404 error', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getPatients();

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('getPatientById', () => {
    it('should return patient on success', async () => {
      const mockResponse = { data: mockPatient };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getPatientById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/patients/1');
      expect(result).toEqual({
        success: true,
        value: mockPatient
      });
    });

    it('should return specific error message for 404 (patient not found)', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getPatientById('non-existent-id');

      expect(result).toEqual({
        success: false,
        error: 'Paciente não encontrado'
      });
    });

    it('should return generic error on server error', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getPatientById('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should return generic error on network error', async () => {
      const mockError = {}; // No status
      mockApi.get.mockRejectedValue(mockError);

      const result = await getPatientById('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('createPatient', () => {
    it('should create patient on success', async () => {
      const patientData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        cpf: '12345678901',
        date_of_birth: '1990-01-01',
        address: '123 Main St',
        priority: PatientPriority.NORMAL
      };
      const mockResponse = { data: mockPatient };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createPatient(patientData);

      expect(mockApi.post).toHaveBeenCalledWith('/patients', patientData);
      expect(result).toEqual({
        success: true,
        value: mockPatient
      });
    });

    it('should return error on validation failure', async () => {
      const patientData = {
        name: '',
        email: 'invalid-email',
        phone: '123456789',
        cpf: '12345678901',
        date_of_birth: '1990-01-01',
        address: '123 Main St',
        priority: PatientPriority.NORMAL
      };
      const mockError = { status: 400 };
      mockApi.post.mockRejectedValue(mockError);

      const result = await createPatient(patientData);

      expect(result).toEqual({
        success: false,
        error: 'Requisição inválida'
      });
    });
  });

  describe('updatePatient', () => {
    it('should update patient on success', async () => {
      const updateData = { name: 'John Updated' };
      const mockResponse = { data: { ...mockPatient, name: 'John Updated' } };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updatePatient('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/patients/1', updateData);
      expect(result).toEqual({
        success: true,
        value: { ...mockPatient, name: 'John Updated' }
      });
    });

    it('should return error when patient not found', async () => {
      const updateData = { name: 'John Updated' };
      const mockError = { status: 404 };
      mockApi.patch.mockRejectedValue(mockError);

      const result = await updatePatient('999', updateData);

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('deletePatient', () => {
    it('should delete patient on success', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deletePatient('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/patients/1');
      expect(result).toEqual({
        success: true
      });
    });

    it('should return error when patient not found', async () => {
      const mockError = { status: 404 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deletePatient('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });

    it('should return error on server error', async () => {
      const mockError = { status: 500 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deletePatient('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });
});
