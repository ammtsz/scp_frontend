import { 
  PatientResponseDto, 
  PatientPriority,
  TreatmentStatus,
  AttendanceResponseDto,
  AttendanceType,
  AttendanceStatus 
} from '@/api/types';
import { 
  IPatients, 
  IPatient, 
  IPriority, 
  IStatus, 
  IAttendanceType,
  IAttendanceProgression,
  IAttendanceStatusDetail,
  IAttendanceByDate
} from '@/types/globals';

export const transformPriority = (apiPriority: PatientPriority): IPriority => {
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

export const transformStatus = (apiStatus: TreatmentStatus): IStatus => {
  switch (apiStatus) {
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
export const transformAttendanceType = (apiType: AttendanceType): IAttendanceType => {
  switch (apiType) {
    case AttendanceType.SPIRITUAL:
      return "spiritual";
    case AttendanceType.LIGHT_BATH:
      return "lightBath";
    case AttendanceType.ROD:
      return "rod";
    default:
      return "spiritual";
  }
};

// Transform API AttendanceStatus to local AttendanceProgression
export const transformAttendanceProgression = (apiStatus: AttendanceStatus): IAttendanceProgression => {
  switch (apiStatus) {
    case AttendanceStatus.SCHEDULED:
      return "scheduled";
    case AttendanceStatus.CHECKED_IN:
      return "checkedIn";
    case AttendanceStatus.IN_PROGRESS:
      return "onGoing";
    case AttendanceStatus.COMPLETED:
      return "completed";
    default:
      return "scheduled";
  }
};

// Transform Patient from API to local format
export const transformPatientFromApi = (apiPatient: PatientResponseDto): IPatients => {
  return {
    id: apiPatient.id.toString(),
    name: apiPatient.name,
    phone: apiPatient.phone || '',
    priority: transformPriority(apiPatient.priority),
    status: transformStatus(apiPatient.treatment_status),
  };
};

// Transform single patient to IPatient format for editing
export const transformSinglePatientFromApi = (apiPatient: PatientResponseDto): IPatient => {
  return {
    id: apiPatient.id.toString(),
    name: apiPatient.name,
    phone: apiPatient.phone || '',
    priority: transformPriority(apiPatient.priority),
    status: transformStatus(apiPatient.treatment_status),
    // Required IPatient properties with default values
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

// Transform array of attendances by date into IAttendanceByDate format
export const transformAttendanceWithPatientByDate = (
  apiAttendances: AttendanceResponseDto[], 
  date: string
): IAttendanceByDate => {
  const result: IAttendanceByDate = {
    date: new Date(date),
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
export const transformPatientsFromApi = (apiPatients: PatientResponseDto[]): IPatients[] => {
  return apiPatients.map(transformPatientFromApi);
};

// Transform IPatient to create/update payload for API
export const transformPatientToApi = (patient: IPatient, isCreate: boolean = false) => {
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

// Transform local priority to API priority
export const transformPriorityToApi = (localPriority: IPriority): PatientPriority => {
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
export const transformStatusToApi = (localStatus: IStatus): TreatmentStatus => {
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
export const transformAttendanceTypeToApi = (localType: IAttendanceType): AttendanceType => {
  switch (localType) {
    case "spiritual":
      return AttendanceType.SPIRITUAL;
    case "lightBath":
      return AttendanceType.LIGHT_BATH;
    case "rod":
      return AttendanceType.ROD;
    default:
      return AttendanceType.SPIRITUAL;
  }
};

// Transform local attendance progression to API attendance status
export const transformAttendanceProgressionToApi = (localProgression: IAttendanceProgression): AttendanceStatus => {
  switch (localProgression) {
    case "scheduled":
      return AttendanceStatus.SCHEDULED;
    case "checkedIn":
      return AttendanceStatus.CHECKED_IN;
    case "onGoing":
      return AttendanceStatus.IN_PROGRESS;
    case "completed":
      return AttendanceStatus.COMPLETED;
    default:
      return AttendanceStatus.SCHEDULED;
  }
};

// Define interface for individual attendance records
interface IAttendanceRecord {
  attendanceId: number;
  patientId: string;
  patientName: string;
  attendanceType: IAttendanceType;
  attendanceProgression: IAttendanceProgression;
  scheduledDate: string;
  scheduledTime: string;
  priority: IPriority;
  notes: string;
  checkedInAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
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
    checkedInAt: apiAttendance.checked_in_at ? new Date(apiAttendance.checked_in_at).toISOString() : null,
    startedAt: apiAttendance.started_at ? new Date(apiAttendance.started_at).toISOString() : null,
    completedAt: apiAttendance.completed_at ? new Date(apiAttendance.completed_at).toISOString() : null,
  };
};

// Transform attendance status details from API
export const transformAttendanceStatusFromApi = (apiAttendance: AttendanceResponseDto): IAttendanceStatusDetail => {
  const patientName = apiAttendance.patient?.name || `Patient ${apiAttendance.patient_id}`;
  const patientPriority = apiAttendance.patient?.priority || PatientPriority.NORMAL;
  
  return {
    name: patientName,
    priority: transformPriority(patientPriority),
    checkedInTime: apiAttendance.checked_in_at ? new Date(apiAttendance.checked_in_at) : null,
    onGoingTime: apiAttendance.started_at ? new Date(apiAttendance.started_at) : null,
    completedTime: apiAttendance.completed_at ? new Date(apiAttendance.completed_at) : null,
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
export const getPriorityLabel = (priority: IPriority): string => {
  switch (priority) {
    case "1":
      return "Urgente";
    case "2":
      return "Intermediário";
    case "3":
      return "Normal";
    default:
      return "Normal";
  }
};

/**
 * Transform attendance type label for display
 */
export const getAttendanceTypeLabel = (type: IAttendanceType): string => {
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
export const getStatusLabel = (status: IStatus): string => {
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
export const getAttendanceProgressionLabel = (progression: IAttendanceProgression): string => {
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
