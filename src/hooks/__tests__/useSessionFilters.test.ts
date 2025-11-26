import { renderHook, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTreatmentFilters } from '../useTreatmentFilters';
import { TreatmentSessionResponseDto } from '@/api/types';
import { defaultFilters } from '@/types/filters';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const mockRouter = {
  replace: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(() => null),
};

// Update mock to use mockSearchParams
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => mockSearchParams),
}));

// Sample test data
const mockSessions: TreatmentSessionResponseDto[] = [
  {
    id: 1,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 1,
    treatment_type: 'light_bath',
    body_location: 'Coronário',
    start_date: '2024-01-15',
    planned_sessions: 10,
    completed_sessions: 5,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    treatment_record_id: 2,
    attendance_id: 2,
    patient_id: 2,
    treatment_type: 'rod',
    body_location: 'Cardíaco',
    start_date: '2024-01-10',
    planned_sessions: 8,
    completed_sessions: 8,
    status: 'completed',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 3,
    treatment_record_id: 3,
    attendance_id: 3,
    patient_id: 3,
    treatment_type: 'light_bath',
    body_location: 'Pulmonar',
    start_date: '2024-01-20',
    planned_sessions: 12,
    completed_sessions: 2,
    status: 'suspended',
    notes: 'Patient requested pause',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-22T10:00:00Z',
  }
];

const mockPatients = [
  { id: 1, name: 'João Silva' },
  { id: 2, name: 'Maria Santos' },
  { id: 3, name: 'Pedro Costa' }
];

describe('useTreatmentFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    expect(result.current.filters).toEqual(defaultFilters);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.savedPresets).toEqual([]);
  });

  it('should filter sessions by search term', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateSearchTerm('João');
    });

    const filtered = result.current.filterSessions(mockSessions, mockPatients);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].patient_id).toBe(1);
  });

  it('should filter sessions by body location', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateSearchTerm('coronário');
    });

    const filtered = result.current.filterSessions(mockSessions, mockPatients);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].body_location).toBe('Coronário');
  });

  it('should filter sessions by treatment type', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateTreatmentTypes(['light_bath']);
    });

    const filtered = result.current.filterSessions(mockSessions);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(s => s.treatment_type === 'light_bath')).toBe(true);
  });

  it('should filter sessions by status', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateStatuses(['active']);
    });

    const filtered = result.current.filterSessions(mockSessions);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe('active');
  });

  it('should filter sessions by date range', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateDateRange({
        start: new Date('2024-01-12'),
        end: new Date('2024-01-18')
      });
    });

    const filtered = result.current.filterSessions(mockSessions);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].start_date).toBe('2024-01-15');
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateTreatmentTypes(['light_bath']);
      result.current.updateStatuses(['active']);
    });

    const filtered = result.current.filterSessions(mockSessions);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].treatment_type).toBe('light_bath');
    expect(filtered[0].status).toBe('active');
  });

  it('should detect active filters', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.updateSearchTerm('test');
    });

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useTreatmentFilters());

    act(() => {
      result.current.updateSearchTerm('test');
      result.current.updateTreatmentTypes(['light_bath']);
      result.current.updateStatuses(['active']);
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual(defaultFilters);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  describe('Date presets', () => {
    it('should set today preset correctly', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset('today');
      });

      const { start, end } = result.current.filters.dateRange;
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      
      if (start && end) {
        expect(start.toDateString()).toBe(new Date().toDateString());
        expect(end.toDateString()).toBe(new Date().toDateString());
      }
    });

    it('should set week preset correctly', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset('week');
      });

      const { start, end } = result.current.filters.dateRange;
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      
      if (start && end) {
        expect(end.getTime() - start.getTime()).toBe(6 * 24 * 60 * 60 * 1000);
      }
    });

    it('should clear date range with custom preset', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset('today');
      });

      expect(result.current.filters.dateRange.start).not.toBeNull();

      act(() => {
        result.current.setDatePreset('custom');
      });

      expect(result.current.filters.dateRange.start).toBeNull();
      expect(result.current.filters.dateRange.end).toBeNull();
    });
  });

  describe('Preset management', () => {
    it('should save filter preset', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm('test');
        result.current.savePreset('My Preset');
      });

      expect(result.current.savedPresets).toHaveLength(1);
      expect(result.current.savedPresets[0].name).toBe('My Preset');
      expect(result.current.savedPresets[0].filters.searchTerm).toBe('test');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load filter preset', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      // First save a preset
      act(() => {
        result.current.updateSearchTerm('test');
        result.current.updateTreatmentTypes(['light_bath']);
        result.current.savePreset('Test Preset');
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.searchTerm).toBe('');

      // Load the preset
      act(() => {
        result.current.loadPreset(result.current.savedPresets[0]);
      });

      expect(result.current.filters.searchTerm).toBe('test');
      expect(result.current.filters.treatmentTypes).toEqual(['light_bath']);
    });

    it('should delete filter preset', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm('test');
        result.current.savePreset('Test Preset');
      });

      expect(result.current.savedPresets).toHaveLength(1);

      act(() => {
        result.current.deletePreset(result.current.savedPresets[0].id);
      });

      expect(result.current.savedPresets).toHaveLength(0);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'treatment-filter-presets',
        JSON.stringify([])
      );
    });
  });

  describe('URL synchronization', () => {
    it('should update URL when filters change', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm('test');
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        '/treatment-tracking?search=test',
        { scroll: false }
      );
    });

    it('should handle complex URL parameters', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm('João');
        result.current.updateTreatmentTypes(['light_bath', 'rod']);
        result.current.updateStatuses(['active']);
        result.current.updateDateRange({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        });
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('search=João'),
        { scroll: false }
      );
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining('types=light_bath%2Crod'),
        { scroll: false }
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sessions array', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      const filtered = result.current.filterSessions([]);
      expect(filtered).toEqual([]);
    });

    it('should handle sessions without patients data', () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm('João');
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(0); // Should not match patient names without patient data
    });

    it('should handle malformed dates gracefully', () => {
      const { result } = renderHook(() => useTreatmentFilters());
      const sessionsWithBadDate = [{
        ...mockSessions[0],
        start_date: 'invalid-date'
      }];

      act(() => {
        result.current.updateDateRange({
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        });
      });

      expect(() => {
        result.current.filterSessions(sessionsWithBadDate);
      }).not.toThrow();
    });
  });
});