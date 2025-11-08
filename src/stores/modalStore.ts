import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AttendanceType, PatientBasic } from '@/types/types';
// import type { IAttendanceStatusDetailWithType } from '@/components/AttendanceManagement/utils/attendanceDataUtils';
import type { SpiritualTreatmentData } from '@/components/AttendanceManagement/components/Forms/PostAttendanceForms/hooks/usePostAttendanceForm';

// Treatment session type for the modal
export interface TreatmentSession {
  id: number;
  treatmentType: "light_bath" | "rod";
  bodyLocations: string[];
  startDate: string;
  plannedSessions: number;
  completedSessions: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  color?: string;
  durationMinutes?: number;
}

// Modal state interface
interface ModalStore {
  // Cancellation modal state
  cancellation: {
    isOpen: boolean;
    attendanceId?: number;
    patientName?: string;
    isLoading: boolean;
  };
  
  // Treatment completion modal state
  postTreatment: {
    isOpen: boolean;
    attendanceId?: number;
    patientId?: number;
    patientName?: string;
    attendanceType?: AttendanceType;
    treatmentSessions: TreatmentSession[];
    isLoadingSessions: boolean;
    onComplete?: (success: boolean) => void;
  };
  
  multiSection: {
    isOpen: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  
  // New PatientBasic CheckIn modal state
  newPatientCheckIn: {
    isOpen: boolean;
    patient?: PatientBasic;
    attendanceId?: number;
    onComplete?: (success: boolean) => void;
  };
  
  // Treatment Form modal state
  postAttendance: {
    isOpen: boolean;
    attendanceId?: number;
    patientId?: number;
    patientName?: string;
    attendanceType?: string;
    currentTreatmentStatus?: string;
    currentStartDate?: Date;
    currentReturnWeeks?: number;
    isFirstAttendance?: boolean;
    isLoading?: boolean;
    initialData?: Partial<SpiritualTreatmentData>;
    onComplete?: (sessionIds: number[]) => void;
  };
  
  // End of Day modal state
  endOfDay: {
    isOpen: boolean;
    selectedDate?: string;
    onFinalizeClick: () => void;
  };
  
  // Actions
  openCancellation: (attendanceId: number, patientName: string) => void;
  openMultiSection: (onConfirm: () => void, onCancel: () => void) => void;
  openNewPatientCheckIn: (data: {
    patient: PatientBasic,
    attendanceId?: number,
    onComplete?: (success: boolean) => void
  }) => void;
  openPostTreatment: (data: {
    attendanceId: number;
    patientId: number;
    patientName: string;
    attendanceType: AttendanceType;
    onComplete?: (success: boolean) => void;
  }) => void;
  openPostAttendance: (data: {
    attendanceId: number;
    patientId: number;
    patientName: string;
    attendanceType: string;
    currentTreatmentStatus: string;
    currentStartDate?: Date;
    currentReturnWeeks?: number;
    isFirstAttendance: boolean;
    isLoading?: boolean;
    initialData?: Partial<SpiritualTreatmentData>;
    onComplete?: (sessionIds: number[]) => void;
  }) => void;
  openEndOfDay: (data: {
    selectedDate?: string;
    onFinalizeClick: () => void;
  }) => void;
  closeModal: (modalName: keyof Pick<ModalStore, 'cancellation' | 'postTreatment' | 'multiSection' | 'newPatientCheckIn' | 'postAttendance' | 'endOfDay'>) => void;
  setCancellationLoading: (loading: boolean) => void;
  setPostTreatmentSessions: (sessions: TreatmentSession[]) => void;
  setPostTreatmentLoading: (loading: boolean) => void;
  setPostAttendanceLoading: (loading: boolean) => void;
}

export const useModalStore = create<ModalStore>()(
  immer((set) => ({
    // Initial state
    cancellation: {
      isOpen: false,
      isLoading: false,
    },
    
    postTreatment: {
      isOpen: false,
      attendanceId: undefined,
      patientId: undefined,
      patientName: undefined,
      attendanceType: undefined,
      treatmentSessions: [],
      isLoadingSessions: false,
    },
    
    multiSection: {
      isOpen: false,
    },
    
    newPatientCheckIn: {
      isOpen: false,
    },
    
    postAttendance: {
      isOpen: false,
    },
    
    endOfDay: {
      isOpen: false,
      selectedDate: undefined,
      onFinalizeClick: () => {},
    },
    
    // Actions
    openCancellation: (attendanceId, patientName) => {
      set((state) => {
        state.cancellation.isOpen = true;
        state.cancellation.attendanceId = attendanceId;
        state.cancellation.patientName = patientName;
        state.cancellation.isLoading = false;
      });
    },
    
    openMultiSection: (onConfirm, onCancel) => {
      set((state) => {
        state.multiSection.isOpen = true;
        state.multiSection.onConfirm = onConfirm;
        state.multiSection.onCancel = onCancel;
      });
    },
    
    openNewPatientCheckIn: ({patient, attendanceId, onComplete}) => {
      set((state) => {
        state.newPatientCheckIn.isOpen = true;
        state.newPatientCheckIn.patient = patient;
        state.newPatientCheckIn.attendanceId = attendanceId;
        state.newPatientCheckIn.onComplete = onComplete;
      });
    },
    
    openPostTreatment: (data) => {
      set((state) => {
        state.postTreatment.isOpen = true;
        state.postTreatment.attendanceId = data.attendanceId;
        state.postTreatment.patientId = data.patientId;
        state.postTreatment.patientName = data.patientName;
        state.postTreatment.attendanceType = data.attendanceType;
        state.postTreatment.treatmentSessions = [];
        state.postTreatment.isLoadingSessions = false;
        state.postTreatment.onComplete = data.onComplete;
      });
    },
    openPostAttendance: (data) => {
      set((state) => {
        state.postAttendance.isOpen = true;
        state.postAttendance.attendanceId = data.attendanceId;
        state.postAttendance.patientId = data.patientId;
        state.postAttendance.patientName = data.patientName;
        state.postAttendance.attendanceType = data.attendanceType;
        state.postAttendance.currentTreatmentStatus = data.currentTreatmentStatus;
        state.postAttendance.currentStartDate = data.currentStartDate;
        state.postAttendance.currentReturnWeeks = data.currentReturnWeeks;
        state.postAttendance.isFirstAttendance = data.isFirstAttendance;
        state.postAttendance.isLoading = data.isLoading || false;
        state.postAttendance.initialData = data.initialData;
        state.postAttendance.onComplete = data.onComplete;
      });
    },
    
    openEndOfDay: (data) => {
      set((state) => {
        state.endOfDay.isOpen = true;
        state.endOfDay.onFinalizeClick = data.onFinalizeClick;
        state.endOfDay.selectedDate = data.selectedDate;
      });
    },
    
    closeModal: (modalName) => {
      set((state) => {
        state[modalName].isOpen = false;
        
        // Reset modal-specific data
        if (modalName === 'cancellation') {
          state.cancellation.isLoading = false;
        }
        if (modalName === 'postTreatment') {
          state.postTreatment.attendanceId = undefined;
          state.postTreatment.patientId = undefined;
          state.postTreatment.patientName = undefined;
          state.postTreatment.attendanceType = undefined;
          state.postTreatment.treatmentSessions = [];
          state.postTreatment.isLoadingSessions = false;
          state.postTreatment.onComplete = undefined;
        }
        if (modalName === 'multiSection') {
          state.multiSection.onConfirm = undefined;
          state.multiSection.onCancel = undefined;
        }
        if (modalName === 'newPatientCheckIn') {
          state.newPatientCheckIn.patient = undefined;
          state.newPatientCheckIn.attendanceId = undefined;
          state.newPatientCheckIn.onComplete = undefined;
        }
        if (modalName === 'postAttendance') {
          state.postAttendance.attendanceId = undefined;
          state.postAttendance.patientId = undefined;
          state.postAttendance.patientName = undefined;
          state.postAttendance.attendanceType = undefined;
          state.postAttendance.currentTreatmentStatus = undefined;
          state.postAttendance.currentStartDate = undefined;
          state.postAttendance.currentReturnWeeks = undefined;
          state.postAttendance.isFirstAttendance = undefined;
          state.postAttendance.isLoading = undefined;
          state.postAttendance.initialData = undefined;
          state.postAttendance.onComplete = undefined;
        }
        if (modalName === 'endOfDay') {
          state.endOfDay.selectedDate = undefined;
          state.endOfDay.onFinalizeClick = () => {};
        }
      });
    },
    
    setCancellationLoading: (loading) => {
      set((state) => {
        state.cancellation.isLoading = loading;
      });
    },
    
    setPostTreatmentSessions: (sessions) => {
      set((state) => {
        state.postTreatment.treatmentSessions = sessions;
      });
    },
    
    setPostTreatmentLoading: (loading) => {
      set((state) => {
        state.postTreatment.isLoadingSessions = loading;
      });
    },
    
    setPostAttendanceLoading: (loading) => {
      set((state) => {
        state.postAttendance.isLoading = loading;
      });
    },
  }))
);

// Selector hooks
export const useCancellationModal = () => useModalStore((state) => state.cancellation);
export const usePostTreatmentModal = () => useModalStore((state) => state.postTreatment);
export const useMultiSectionModal = () => useModalStore((state) => state.multiSection);
export const useNewPatientCheckInModal = () => useModalStore((state) => state.newPatientCheckIn);
export const usePostAttendanceModal = () => useModalStore((state) => state.postAttendance);
export const useEndOfDayModal = () => useModalStore((state) => state.endOfDay);

// Action hooks
export const useOpenCancellation = () => useModalStore((state) => state.openCancellation);
export const useOpenMultiSection = () => useModalStore((state) => state.openMultiSection);
export const useOpenPostTreatment = () => useModalStore((state) => state.openPostTreatment);
export const useOpenNewPatientCheckIn = () => useModalStore((state) => state.openNewPatientCheckIn);
export const useOpenPostAttendance = () => useModalStore((state) => state.openPostAttendance);
export const useOpenEndOfDay = () => useModalStore((state) => state.openEndOfDay);
export const useCloseModal = () => useModalStore((state) => state.closeModal);
export const useSetCancellationLoading = () => useModalStore((state) => state.setCancellationLoading);
export const useSetPostTreatmentSessions = () => useModalStore((state) => state.setPostTreatmentSessions);
export const useSetPostTreatmentLoading = () => useModalStore((state) => state.setPostTreatmentLoading);
export const useSetPostAttendanceLoading = () => useModalStore((state) => state.setPostAttendanceLoading);