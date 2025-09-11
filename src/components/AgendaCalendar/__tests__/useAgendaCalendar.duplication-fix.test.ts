import { renderHook, act } from '@testing-library/react';
import { useAgendaCalendar } from '../useAgendaCalendar';

// Mock the AgendaContext
jest.mock('@/contexts/AgendaContext', () => ({
  useAgenda: () => ({
    agenda: {
      spiritual: [],
      lightBath: [],
    },
    loading: false,
    error: null,
    refreshAgenda: jest.fn().mockResolvedValue(true),
    addPatientToAgenda: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock the PatientsContext
jest.mock('@/contexts/PatientsContext', () => ({
  usePatients: () => ({
    patients: [
      { id: '1', name: 'Test Patient', priority: '1' },
    ],
    refreshPatients: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock the API calls
jest.mock('@/api/attendances', () => ({
  getNextAttendanceDate: jest.fn().mockResolvedValue('2025-09-11'),
}));

describe('useAgendaCalendar - Duplication Fix', () => {
  it('should only refresh agenda when handling new attendance (no duplicate creation)', async () => {
    const { result } = renderHook(() => useAgendaCalendar());
    
    // Spy on console.log to verify the fix
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await act(async () => {
      // This should NOT create duplicate attendances
      await result.current.handleNewAttendance(
        'Test Patient',
        ['spiritual'],
        false,
        '1',
        '2025-09-11'
      );
    });

    // Verify that we're only refreshing, not creating duplicates
    expect(consoleSpy).toHaveBeenCalledWith(
      'Refreshing agenda after attendance creation:',
      {
        patientName: 'Test Patient',
        types: ['spiritual'],
        isNew: false,
      }
    );

    // Verify modal is closed
    expect(result.current.showNewAttendance).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should handle multiple types without duplication', async () => {
    const { result } = renderHook(() => useAgendaCalendar());
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await act(async () => {
      // Multiple types should still only refresh once
      await result.current.handleNewAttendance(
        'Test Patient',
        ['spiritual', 'lightbath', 'rod'],
        false,
        '1',
        '2025-09-11'
      );
    });

    // Should only log once for refresh, not multiple times for creation
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Refreshing agenda after attendance creation:',
      {
        patientName: 'Test Patient',
        types: ['spiritual', 'lightbath', 'rod'],
        isNew: false,
      }
    );

    consoleSpy.mockRestore();
  });
});
