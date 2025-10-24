import { 
  PatientResponseDto, 
  PatientPriority,
  TreatmentStatus,
  AttendanceResponseDto,
  AttendanceType as ApiAttendanceType,
  AttendanceStatus as ApiAttendanceStatus 
} from '@/api/types';
import { 
  PatientBasic, 
  Patient, 
  PreviousAttendance, 
  Priority, 
  Status, 
  AttendanceType,
  AttendanceProgression,
  AttendanceStatusDetail,
  AttendanceByDate
} from '@/types/types';

export const transformPriority = (apiPriority: PatientPriority): Priority => {
  switch (apiPriority) {
    case PatientPriority.NORMAL:
      return "3";
    case PatientPriority.INTERMEDIATE:
      return "2";
    case PatientPriority.EMERGENCY:
      return "1";
    default:
      return "3";
  }
};

export const transformStatus = (apiStatus: TreatmentStatus): Status => {
  switch (apiStatus) {
    case TreatmentStatus.NEW_PATIENT:
      return "N";
    case TreatmentStatus.IN_TREATMENT:
      return "T";
    case TreatmentStatus.DISCHARGED:
      return "A";
    case TreatmentStatus.ABSENT:
      return "F";
    default:
      return "T";
  }
};

// Transform API AttendanceType to local AttendanceType
export const transformAttendanceType = (apiType: ApiAttendanceType): AttendanceType => {
  switch (apiType) {
    case ApiAttendanceType.SPIRITUAL:
      return "spiritual";
    case ApiAttendanceType.LIGHT_BATH:
      return "lightBath";
    case ApiAttendanceType.ROD:
      return "rod";
    default:
      return "spiritual";
  }
};

// Transform API AttendanceStatus to local AttendanceProgression
export const transformAttendanceProgression = (apiStatus: ApiAttendanceStatus): AttendanceProgression => {
  switch (apiStatus) {
    case ApiAttendanceStatus.SCHEDULED:
      return "scheduled";
    case ApiAttendanceStatus.CHECKED_IN:
      return "checkedIn";
    case ApiAttendanceStatus.IN_PROGRESS:
      return "onGoing";
    case ApiAttendanceStatus.COMPLETED:
      return "completed";
    default:
      return "scheduled";
  }
};

// Transform Patient from API to local format
export const transformPatientFromApi = (apiPatient: PatientResponseDto): PatientBasic => {
  return {
    id: apiPatient.id.toString(),
    name: apiPatient.name,
    phone: apiPatient.phone || '',
    priority: transformPriority(apiPatient.priority),
    status: transformStatus(apiPatient.treatment_status),
  };
};

// Transform single patient to Patient format for editing
export const transformSinglePatientFromApi = (apiPatient: PatientResponseDto): Patient => {
  return {
    id: apiPatient.id.toString(),
    name: apiPatient.name,
    phone: apiPatient.phone || '',
    priority: transformPriority(apiPatient.priority),
    status: transformStatus(apiPatient.treatment_status),
    // Required Patient properties with default values
    birthDate: apiPatient.birth_date ? new Date(apiPatient.birth_date) : new Date(),
    mainComplaint: apiPatient.main_complaint || '',
    startDate: new Date(apiPatient.start_date),
    dischargeDate: apiPatient.discharge_date ? new Date(apiPatient.discharge_date) : null,
    nextAttendanceDates: [],
    currentRecommendations: {
      date: new Date(),
      food: '',
      water: '',
      ointment: '',
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 0
    },
    previousAttendances: []
  };
};

// Transform attendance API data to PreviousAttendance format
export const transformAttendanceToPrevious = (apiAttendance: AttendanceResponseDto): PreviousAttendance => {
  return {
    attendanceId: apiAttendance.id.toString(),
    date: new Date(apiAttendance.scheduled_date),
    type: transformAttendanceType(apiAttendance.type),
    notes: apiAttendance.notes || '',
    recommendations: null // TODO: We need to implement recommendations mapping when backend provides this data
  };
};

// Transform attendance API data to next attendance format
export const transformAttendanceToNext = (apiAttendance: AttendanceResponseDto): { date: Date, type: AttendanceType } => {
  return {
    date: new Date(apiAttendance.scheduled_date),
    type: transformAttendanceType(apiAttendance.type)
  };
};

// Enhanced patient transformer that includes attendance history
export const transformPatientWithAttendances = (
  apiPatient: PatientResponseDto, 
  attendances: AttendanceResponseDto[]
): Patient => {
  const basePatient = transformSinglePatientFromApi(apiPatient);
  
  console.log('Transforming patient with attendances:', {
    patientId: apiPatient.id,
    totalAttendances: attendances.length,
    attendanceStatuses: attendances.map(a => a.status),
    completedCount: attendances.filter(a => a.status === 'completed').length,
    futureCount: attendances.filter(a => ['scheduled', 'checked_in', 'in_progress'].includes(a.status)).length
  });
  
  // Filter completed attendances and transform them
  const previousAttendances = attendances
    .filter(attendance => attendance.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
    .map(transformAttendanceToPrevious);
  
  // Filter future attendances (scheduled, checked_in, in_progress) and transform them
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
  
  const nextAttendanceDates = attendances
    .filter(attendance => {
      const isNotCompleted = ['scheduled', 'checked_in', 'in_progress'].includes(attendance.status);
      const attendanceDate = new Date(attendance.scheduled_date);
      attendanceDate.setHours(0, 0, 0, 0);
      const isFuture = attendanceDate >= currentDate;
      return isNotCompleted && isFuture;
    })
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .map(transformAttendanceToNext);
    
  return {
    ...basePatient,
    previousAttendances,
    nextAttendanceDates
  };
};

// Transform array of attendances by date into AttendanceByDate format
export const transformAttendanceWithPatientByDate = (
  apiAttendances: AttendanceResponseDto[], 
  date: string
): AttendanceByDate => {
  // Parse YYYY-MM-DD format to avoid timezone issues
  // Add 'T00:00:00' to ensure it's interpreted as local time
  const dateObj = new Date(date + 'T00:00:00');
  
  const result: AttendanceByDate = {
    date: dateObj,
    spiritual: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    lightBath: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    rod: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    combined: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    }
  };

  // Group attendances by type and status
  apiAttendances.forEach(attendance => {
    const attendanceType = transformAttendanceType(attendance.type);
    const attendanceStatus = transformAttendanceProgression(attendance.status);
    const statusDetail = transformAttendanceStatusFromApi(attendance);

    // Add to the appropriate category
    result[attendanceType][attendanceStatus].push(statusDetail);
  });

  return result;
};

// Transform array of patients from API to local format  
export const transformPatientsFromApi = (apiPatients: PatientResponseDto[]): PatientBasic[] => {
  return apiPatients.map(transformPatientFromApi);
};

// Transform Patient to create/update payload for API
export const transformPatientToApi = (patient: Patient, isCreate: boolean = false) => {
  const apiPatient = {
    name: patient.name.trim(),
    phone: patient.phone?.trim() || null,
    priority: transformPriorityToApi(patient.priority),
    treatment_status: transformStatusToApi(patient.status),
  };

  // For updates, include the id
  if (!isCreate && patient.id) {
    return {
      id: parseInt(patient.id, 10),
      ...apiPatient,
    };
  }

  return apiPatient;
};

// Transform Patient specifically for creation with all required fields
export const transformPatientToApiCreate = (patient: Omit<Patient, 'id'>) => {
  return {
    name: patient.name.trim(),
    phone: patient.phone?.trim() || undefined,
    priority: transformPriorityToApi(patient.priority),
    treatment_status: transformStatusToApi(patient.status),
    birth_date: patient.birthDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    main_complaint: patient.mainComplaint?.trim() || undefined,
  };
};

// Transform local priority to API priority
export const transformPriorityToApi = (localPriority: Priority): PatientPriority => {
  switch (localPriority) {
    case "1":
      return PatientPriority.EMERGENCY;
    case "2":
      return PatientPriority.INTERMEDIATE;
    case "3":
      return PatientPriority.NORMAL;
    default:
      return PatientPriority.NORMAL;
  }
};

// Transform local status to API status
export const transformStatusToApi = (localStatus: Status): TreatmentStatus => {
  switch (localStatus) {
    case "T":
      return TreatmentStatus.IN_TREATMENT;
    case "A":
      return TreatmentStatus.DISCHARGED;
    case "F":
      return TreatmentStatus.ABSENT;
    default:
      return TreatmentStatus.IN_TREATMENT;
  }
};

// Transform local attendance type to API attendance type
export const transformAttendanceTypeToApi = (localType: AttendanceType): ApiAttendanceType => {
  switch (localType) {
    case "spiritual":
      return ApiAttendanceType.SPIRITUAL;
    case "lightBath":
      return ApiAttendanceType.LIGHT_BATH;
    case "rod":
      return ApiAttendanceType.ROD;
    default:
      return ApiAttendanceType.SPIRITUAL;
  }
};

// Transform local attendance progression to API attendance status
export const transformAttendanceProgressionToApi = (localProgression: AttendanceProgression): ApiAttendanceStatus => {
  switch (localProgression) {
    case "scheduled":
      return ApiAttendanceStatus.SCHEDULED;
    case "checkedIn":
      return ApiAttendanceStatus.CHECKED_IN;
    case "onGoing":
      return ApiAttendanceStatus.IN_PROGRESS;
    case "completed":
      return ApiAttendanceStatus.COMPLETED;
    default:
      return ApiAttendanceStatus.SCHEDULED;
  }
};

// Define interface for individual attendance records
interface IAttendanceRecord {
  attendanceId: number;
  patientId: string;
  patientName: string;
  attendanceType: AttendanceType;
  attendanceProgression: AttendanceProgression;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  notes: string;
  checkedInTime?: string; // HH:mm:ss time only
  startedTime?: string; // HH:mm:ss time only  
  completedTime?: string; // HH:mm:ss time only
  cancelledDate?: string; // YYYY-MM-DD date only (for cancellations)
}

// Transform a single attendance from API to local format
export const transformAttendanceFromApi = (apiAttendance: AttendanceResponseDto): IAttendanceRecord => {
  // Get patient info from nested patient object if available
  const patientName = apiAttendance.patient?.name || `Patient ${apiAttendance.patient_id}`;
  const patientPriority = apiAttendance.patient?.priority || PatientPriority.NORMAL;
  
  return {
    attendanceId: apiAttendance.id,
    patientId: apiAttendance.patient_id.toString(),
    patientName: patientName,
    attendanceType: transformAttendanceType(apiAttendance.type),
    attendanceProgression: transformAttendanceProgression(apiAttendance.status),
    scheduledDate: apiAttendance.scheduled_date.toString(),
    scheduledTime: apiAttendance.scheduled_time,
    priority: transformPriority(patientPriority),
    notes: apiAttendance.notes || '',
    checkedInTime: apiAttendance.checked_in_time,
    startedTime: apiAttendance.started_time,
    completedTime: apiAttendance.completed_time,
    cancelledDate: apiAttendance.cancelled_date,
  };
};

// Transform attendance status details from API
export const transformAttendanceStatusFromApi = (apiAttendance: AttendanceResponseDto): AttendanceStatusDetail => {
  const patientName = apiAttendance.patient?.name || `Patient ${apiAttendance.patient_id}`;
  const patientPriority = apiAttendance.patient?.priority || PatientPriority.NORMAL;
  
  return {
    name: patientName,
    priority: transformPriority(patientPriority),
    checkedInTime: apiAttendance.checked_in_time,
    onGoingTime: apiAttendance.started_time,
    completedTime: apiAttendance.completed_time,
    attendanceId: apiAttendance.id,
    patientId: apiAttendance.patient_id,
  };
};

/**
 * Transform an array of API attendances for the attendances list
 */
export const transformAttendancesForList = (apiAttendances: AttendanceResponseDto[]): {
  attendances: IAttendanceRecord[];
  columns: {
    scheduled: IAttendanceRecord[];
    checkedIn: IAttendanceRecord[];
    onGoing: IAttendanceRecord[];
    completed: IAttendanceRecord[];
  };
} => {
  const attendances = apiAttendances.map(transformAttendanceFromApi);
  
  const columns = {
    scheduled: attendances.filter(a => a.attendanceProgression === 'scheduled'),
    checkedIn: attendances.filter(a => a.attendanceProgression === 'checkedIn'),
    onGoing: attendances.filter(a => a.attendanceProgression === 'onGoing'),
    completed: attendances.filter(a => a.attendanceProgression === 'completed'),
  };

  return { attendances, columns };
};

/**
 * Helper function to format date for API requests (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper function to format time for API requests (HH:MM:SS)
 */
export const formatTimeForApi = (time: string): string => {
  // If time is already in HH:MM:SS format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // If time is in HH:MM format, add seconds
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }
  
  // Default to current time in proper format
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
};

/**
 * Transform priority label for display
 */
export const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case "1":
      return "Exceção";
    case "2":
      return "Idoso/crianças";
    case "3":
      return "Padrão";
    default:
      return "Padrão";
  }
};

/**
 * Transform attendance type label for display
 */
export const getAttendanceTypeLabel = (type: AttendanceType): string => {
  switch (type) {
    case "spiritual":
      return "Consulta Espiritual";
    case "lightBath":
      return "Banho de Luz";
    case "rod":
      return "Bastão";
    default:
      return "Consulta Espiritual";
  }
};

/**
 * Transform status label for display
 */
export const getStatusLabel = (status: Status): string => {
  switch (status) {
    case "T":
      return "Em Tratamento";
    case "A":
      return "Alta Médica";
    case "F":
      return "Faltas Consecutivas";
    default:
      return "Em Tratamento";
  }
};

/**
 * Transform attendance progression label for display
 */
export const getAttendanceProgressionLabel = (progression: AttendanceProgression): string => {
  switch (progression) {
    case "scheduled":
      return "Agendado";
    case "checkedIn":
      return "Chegou";
    case "onGoing":
      return "Em Andamento";
    case "completed":
      return "Finalizado";
    default:
      return "Agendado";
  }
};
