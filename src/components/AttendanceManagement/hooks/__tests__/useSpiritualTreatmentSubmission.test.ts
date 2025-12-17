import { renderHook, act } from '@testing-library/react';
import { useSpiritualTreatmentSubmission } from '../useSpiritualTreatmentSubmission';
import { createTreatmentRecord } from '@/api/treatment-records';
import type { SpiritualTreatmentData, TreatmentStatus } from '../../components/Forms/PostAttendanceForms';
import type { ApiResponse, UpdateTreatmentRecordResponseDto, TreatmentRecordResponseDto } from '@/api/types';

// Mock the API
jest.mock('@/api/treatment-records');
const mockCreateTreatmentRecord = createTreatmentRecord as jest.MockedFunction<typeof createTreatmentRecord>;

// Helper function to create proper API response with complete TreatmentRecordResponseDto
const createMockApiResponse = (id: number, attendanceId = 456): ApiResponse<UpdateTreatmentRecordResponseDto> => ({
  success: true,
  value: {
    record: {
      id,
      attendance_id: attendanceId,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      main_complaint: 'Test complaint',
      food: 'Test food recommendation',
      water: 'Test water recommendation',
      ointments: 'Test ointment recommendation',
      light_bath: true,
      light_bath_color: 'azul',
      rod: true,
      spiritual_treatment: true,
      return_in_weeks: 4,
      notes: 'Test notes',
    } as TreatmentRecordResponseDto
  }
});

// Helper function to create error API response
const createMockErrorResponse = (errorMessage: string): ApiResponse<UpdateTreatmentRecordResponseDto> => ({
  success: false,
  error: errorMessage,
});

describe('useSpiritualTreatmentSubmission', () => {
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  // Helper function to create mock spiritual treatment data
  const createMockSpiritualTreatmentData = (
    overrides: Partial<SpiritualTreatmentData> = {}
  ): SpiritualTreatmentData => ({
    mainComplaint: 'Dor nas costas',
    treatmentStatus: 'T' as TreatmentStatus,
    startDate: '2024-01-15',
    returnWeeks: 4,
    food: 'Evitar frituras',
    water: 'Beber 2 litros por dia',
    ointments: 'Aplicar pomada anti-inflamatória',
    recommendations: {
      lightBath: {
        startDate: '2024-01-15',
        treatments: [
          {
            locations: ['Coluna vertebral'],
            color: 'azul',
            startDate: '2024-01-15',
            duration: 21,
            quantity: 3,
          }
        ]
      },
      rod: {
        startDate: '2024-01-15',
        treatments: [
          {
            locations: ['Ombro direito'],
            startDate: '2024-01-15',
            quantity: 2,
          }
        ]
      },
      returnWeeks: 4,
      spiritualMedicalDischarge: false,
    },
    notes: 'Paciente relata melhora gradual',
    ...overrides,
  });

  describe('Hook initialization', () => {
    it('should initialize correctly and provide submitTreatmentRecord function', () => {
      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      expect(result.current.submitTreatmentRecord).toBeDefined();
      expect(typeof result.current.submitTreatmentRecord).toBe('function');
    });

    it('should maintain stable function reference across rerenders', () => {
      const { result, rerender } = renderHook(() => useSpiritualTreatmentSubmission());
      const firstFunction = result.current.submitTreatmentRecord;
      
      rerender();
      
      expect(result.current.submitTreatmentRecord).toBe(firstFunction);
    });
  });

  describe('submitTreatmentRecord - Success scenarios', () => {
    it('should submit treatment record successfully with complete data', async () => {
      const mockResponse = createMockApiResponse(123);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();
      const attendanceId = 456;

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitTreatmentRecord(treatmentData, attendanceId);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 123 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith({
        attendance_id: 456,
        main_complaint: 'Dor nas costas',
        treatment_status: 'T',
        food: 'Evitar frituras',
        water: 'Beber 2 litros por dia',
        ointments: 'Aplicar pomada anti-inflamatória',
        spiritual_treatment: true,
        return_in_weeks: 4,
        notes: 'Paciente relata melhora gradual',
        light_bath: true,
        light_bath_color: 'azul',
        rod: true,
      });
    });

    it('should handle treatment data with only lightBath recommendation', async () => {
      const mockResponse = createMockApiResponse(789, 100);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        recommendations: {
          lightBath: {
            startDate: '2024-01-15',
            treatments: [
              {
                locations: ['Cabeça'],
                color: 'verde',
                startDate: '2024-01-15',
                duration: 10,
                quantity: 1,
              }
            ]
          },
          rod: undefined,
          returnWeeks: 4,
          spiritualMedicalDischarge: false,
        }
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitTreatmentRecord(treatmentData, 100);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 789 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: true,
          light_bath_color: 'verde',
          rod: false,
        })
      );
    });

    it('should handle treatment data with only rod recommendation', async () => {
      const mockResponse = createMockApiResponse(321, 200);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        recommendations: {
          lightBath: undefined,
          rod: {
            startDate: '2024-01-15',
            treatments: [
              {
                locations: ['Perna esquerda'],
                startDate: '2024-01-15',
                quantity: 1,
              }
            ]
          },
          returnWeeks: 4,
          spiritualMedicalDischarge: false,
        }
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitTreatmentRecord(treatmentData, 200);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 321 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: false,
          light_bath_color: undefined,
          rod: true,
        })
      );
    });

    it('should handle treatment data with no recommendations', async () => {
      const mockResponse = createMockApiResponse(654, 300);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        recommendations: {
          lightBath: undefined,
          rod: undefined,
          returnWeeks: 4,
          spiritualMedicalDischarge: false,
        }
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitTreatmentRecord(treatmentData, 300);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 654 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: false,
          light_bath_color: undefined,
          rod: false,
        })
      );
    });

    it('should handle different treatment status values', async () => {
      const mockResponse = createMockApiResponse(111, 400);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentStatuses: TreatmentStatus[] = ['N', 'T', 'A', 'F'];

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      for (const status of treatmentStatuses) {
        const treatmentData = createMockSpiritualTreatmentData({
          treatmentStatus: status,
        });

        await act(async () => {
          await result.current.submitTreatmentRecord(treatmentData, 400);
        });

        expect(mockCreateTreatmentRecord).toHaveBeenLastCalledWith(
          expect.objectContaining({
            treatment_status: status,
          })
        );
      }
    });

    it('should handle empty strings and null values gracefully', async () => {
      const mockResponse = createMockApiResponse(999, 500);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        mainComplaint: '',
        food: '',
        water: '',
        ointments: '',
        notes: '',
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      let submitResult;
      await act(async () => {
        submitResult = await result.current.submitTreatmentRecord(treatmentData, 500);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 999 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          main_complaint: '',
          food: '',
          water: '',
          ointments: '',
          notes: '',
        })
      );
    });

    it('should always set spiritual_treatment to true', async () => {
      const mockResponse = createMockApiResponse(777, 600);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData();
      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      await act(async () => {
        await result.current.submitTreatmentRecord(treatmentData, 600);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          spiritual_treatment: true,
        })
      );
    });
  });

  describe('submitTreatmentRecord - Error scenarios', () => {
    it('should handle API failure with error message', async () => {
      const mockResponse = createMockErrorResponse('Failed to create treatment record');
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();

      await act(async () => {
        await expect(
          result.current.submitTreatmentRecord(treatmentData, 700)
        ).rejects.toThrow('Failed to create treatment record');
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error submitting treatment record:',
        expect.any(Error)
      );
    });

    it('should handle API success but no value', async () => {
      const mockResponse: ApiResponse<UpdateTreatmentRecordResponseDto> = {
        success: true,
        value: undefined,
      };
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();

      await act(async () => {
        await expect(
          result.current.submitTreatmentRecord(treatmentData, 800)
        ).rejects.toThrow('Failed to create treatment record');
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error submitting treatment record:',
        expect.any(Error)
      );
    });

    it('should handle API success but malformed value', async () => {
      const mockResponse: ApiResponse<UpdateTreatmentRecordResponseDto> = {
        success: true,
        value: {
          record: null as unknown as TreatmentRecordResponseDto,
        },
      };
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();

      await act(async () => {
        await expect(
          result.current.submitTreatmentRecord(treatmentData, 900)
        ).rejects.toThrow();
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error submitting treatment record:',
        expect.any(Error)
      );
    });

    it('should handle network/API exceptions', async () => {
      const networkError = new Error('Network connection failed');
      mockCreateTreatmentRecord.mockRejectedValue(networkError);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();

      await act(async () => {
        await expect(
          result.current.submitTreatmentRecord(treatmentData, 1000)
        ).rejects.toThrow('Network connection failed');
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error submitting treatment record:',
        networkError
      );
    });

    it('should handle undefined API response', async () => {
      mockCreateTreatmentRecord.mockResolvedValue(undefined as unknown as ApiResponse<UpdateTreatmentRecordResponseDto>);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData = createMockSpiritualTreatmentData();

      await act(async () => {
        await expect(
          result.current.submitTreatmentRecord(treatmentData, 1100)
        ).rejects.toThrow();
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error submitting treatment record:',
        expect.any(Error)
      );
    });
  });

  describe('Data transformation and mapping', () => {
    it('should correctly map form data to API request format', async () => {
      const mockResponse = createMockApiResponse(555, 1200);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        mainComplaint: 'Custom complaint',
        treatmentStatus: 'A',
        food: 'Custom food recommendation',
        water: 'Custom water recommendation',
        ointments: 'Custom ointment recommendation',
        returnWeeks: 8,
        notes: 'Custom notes',
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      await act(async () => {
        await result.current.submitTreatmentRecord(treatmentData, 1200);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith({
        attendance_id: 1200,
        main_complaint: 'Custom complaint',
        treatment_status: 'A',
        food: 'Custom food recommendation',
        water: 'Custom water recommendation',
        ointments: 'Custom ointment recommendation',
        spiritual_treatment: true,
        return_in_weeks: 8,
        notes: 'Custom notes',
        light_bath: true,
        light_bath_color: 'azul',
        rod: true,
      });
    });

    it('should handle light_bath_color extraction correctly', async () => {
      const mockResponse = createMockApiResponse(444, 1300);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      // Test with multiple treatments - should pick first one
      const treatmentData = createMockSpiritualTreatmentData({
        recommendations: {
          lightBath: {
            startDate: '2024-01-15',
            treatments: [
              {
                locations: ['Location 1'],
                color: 'vermelho',
                startDate: '2024-01-15',
                duration: 21,
                quantity: 1,
              },
              {
                locations: ['Location 2'],
                color: 'verde',
                startDate: '2024-01-15',
                duration: 21,
                quantity: 1,
              },
            ]
          },
          rod: undefined,
          returnWeeks: 4,
          spiritualMedicalDischarge: false,
        }
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      await act(async () => {
        await result.current.submitTreatmentRecord(treatmentData, 1300);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: true,
          light_bath_color: 'vermelho', // Should be from first treatment
        })
      );
    });

    it('should handle empty treatments arrays', async () => {
      const mockResponse = createMockApiResponse(333, 1400);
      mockCreateTreatmentRecord.mockResolvedValue(mockResponse);

      const treatmentData = createMockSpiritualTreatmentData({
        recommendations: {
          lightBath: {
            startDate: '2024-01-15',
            treatments: [] // Empty treatments array
          },
          rod: {
            startDate: '2024-01-15',
            treatments: [] // Empty treatments array
          },
          returnWeeks: 4,
          spiritualMedicalDischarge: false,
        }
      });

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());

      await act(async () => {
        await result.current.submitTreatmentRecord(treatmentData, 1400);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: true, // Should be true since lightBath object exists
          light_bath_color: undefined, // Should be undefined since treatments[0] doesn't exist
          rod: true, // Should be true since rod object exists
        })
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle sequential calls correctly', async () => {
      const mockResponse1 = createMockApiResponse(1001, 1500);
      const mockResponse2 = createMockApiResponse(1002, 1600);
      
      mockCreateTreatmentRecord
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData1 = createMockSpiritualTreatmentData({ mainComplaint: 'First complaint' });
      const treatmentData2 = createMockSpiritualTreatmentData({ mainComplaint: 'Second complaint' });

      let result1, result2;
      await act(async () => {
        result1 = await result.current.submitTreatmentRecord(treatmentData1, 1500);
        result2 = await result.current.submitTreatmentRecord(treatmentData2, 1600);
      });

      expect(result1).toEqual({ treatmentRecordId: 1001 });
      expect(result2).toEqual({ treatmentRecordId: 1002 });
      expect(mockCreateTreatmentRecord).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent calls correctly', async () => {
      const mockResponse1 = createMockApiResponse(2001, 1700);
      const mockResponse2 = createMockApiResponse(2002, 1800);
      
      mockCreateTreatmentRecord
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const { result } = renderHook(() => useSpiritualTreatmentSubmission());
      const treatmentData1 = createMockSpiritualTreatmentData({ mainComplaint: 'Concurrent 1' });
      const treatmentData2 = createMockSpiritualTreatmentData({ mainComplaint: 'Concurrent 2' });

      let results;
      await act(async () => {
        results = await Promise.all([
          result.current.submitTreatmentRecord(treatmentData1, 1700),
          result.current.submitTreatmentRecord(treatmentData2, 1800),
        ]);
      });

      expect(results).toEqual([
        { treatmentRecordId: 2001 },
        { treatmentRecordId: 2002 },
      ]);
      expect(mockCreateTreatmentRecord).toHaveBeenCalledTimes(2);
    });
  });
});