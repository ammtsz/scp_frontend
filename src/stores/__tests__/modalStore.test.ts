import { renderHook, act } from '@testing-library/react';
import { useModalStore } from '@/stores/modalStore';

describe('Modal Store - Cancellation Modal', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useModalStore());
    act(() => {
      // Close all modals individually
      result.current.closeModal('cancellation');
      result.current.closeModal('postTreatment');
      result.current.closeModal('multiSection');
      result.current.closeModal('newPatientCheckIn');
      result.current.closeModal('postAttendance');
      result.current.closeModal('endOfDay');
    });
  });

  test('should open cancellation modal with correct data', () => {
    const { result } = renderHook(() => useModalStore());

    act(() => {
      result.current.openCancellation(123, 'John Doe');
    });

    expect(result.current.cancellation.isOpen).toBe(true);
    expect(result.current.cancellation.attendanceId).toBe(123);
    expect(result.current.cancellation.patientName).toBe('John Doe');
    expect(result.current.cancellation.isLoading).toBe(false);
  });

  test('should close cancellation modal', () => {
    const { result } = renderHook(() => useModalStore());

    // First open the modal
    act(() => {
      result.current.openCancellation(123, 'John Doe');
    });

    expect(result.current.cancellation.isOpen).toBe(true);

    // Then close it
    act(() => {
      result.current.closeModal('cancellation');
    });

    expect(result.current.cancellation.isOpen).toBe(false);
    expect(result.current.cancellation.isLoading).toBe(false);
  });

  test('should set loading state', () => {
    const { result } = renderHook(() => useModalStore());

    act(() => {
      result.current.setCancellationLoading(true);
    });

    expect(result.current.cancellation.isLoading).toBe(true);

    act(() => {
      result.current.setCancellationLoading(false);
    });

    expect(result.current.cancellation.isLoading).toBe(false);
  });

  test('should close all modals', () => {
    const { result } = renderHook(() => useModalStore());

    // Open multiple modals
    act(() => {
      result.current.openCancellation(123, 'John Doe');
      result.current.openMultiSection(() => {}, () => {});
    });

    expect(result.current.cancellation.isOpen).toBe(true);
    expect(result.current.multiSection.isOpen).toBe(true);

    // Close all modals individually
    act(() => {
      result.current.closeModal('cancellation');
      result.current.closeModal('multiSection');
    });

    expect(result.current.cancellation.isOpen).toBe(false);
    expect(result.current.multiSection.isOpen).toBe(false);
  });
});