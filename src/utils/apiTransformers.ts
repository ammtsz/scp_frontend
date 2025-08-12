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
  IAttendanceByDate,
  IAttendanceStatusDetail
} from '@/types/globals';

// Transform API Priority to local Priority
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

// Transform API Status to local Status
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

// Transform Patients array from API to local format
export const transformPatientsFromApi = (apiPatients: PatientResponseDto[]): IPatients[] => {
  return apiPatients.map(transformPatientFromApi);
};

// Transform detailed Patient from API to local format (for patient detail view)
export const transformPatientDetailFromApi = (apiPatient: PatientResponseDto): IPatient => {
  const basePatient = transformPatientFromApi(apiPatient);
  
  return {
    ...basePatient,
    birthDate: apiPatient.birth_date ? new Date(apiPatient.birth_date) : new Date(),
    mainComplaint: apiPatient.main_complaint || '',
    startDate: new Date(apiPatient.start_date),
    dischargeDate: apiPatient.discharge_date ? new Date(apiPatient.discharge_date) : null,
    nextAttendanceDates: [], // This would need to be populated from attendances API
    currentRecommendations: {
      date: new Date(),
      food: '',
      water: '',
      ointment: '',
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 0,
    },
    previousAttendances: [], // This would need to be populated from attendances API
  };
};

// Transform attendances from API to local IAttendanceByDate format
// This groups attendances by date and type, organizing them by status
export const transformAttendancesFromApi = (
  apiAttendances: AttendanceResponseDto[], 
  apiPatients: PatientResponseDto[]
): IAttendanceByDate[] => {
  // Create a map of patient ID to patient data for quick lookup
  const patientsMap = new Map(apiPatients.map(p => [p.id, p]));
  
  // Group attendances by date
  const attendancesByDate = new Map<string, AttendanceResponseDto[]>();
  
  apiAttendances.forEach(attendance => {
    const dateKey = attendance.scheduled_date;
    if (!attendancesByDate.has(dateKey)) {
      attendancesByDate.set(dateKey, []);
    }
    attendancesByDate.get(dateKey)!.push(attendance);
  });
  
  // Transform each date's attendances into IAttendanceByDate format
  const result: IAttendanceByDate[] = [];
  
  attendancesByDate.forEach((dateAttendances, dateKey) => {
    const date = new Date(dateKey);
    
    // Initialize the attendance structure for this date
    const attendanceForDate: IAttendanceByDate = {
      date,
      spiritual: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
      lightBath: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
      rod: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
    };
    
    // Process each attendance for this date
    dateAttendances.forEach(attendance => {
      const patient = patientsMap.get(attendance.patient_id);
      if (!patient) return; // Skip if patient not found
      
      const attendanceDetail: IAttendanceStatusDetail = {
        name: patient.name,
        priority: transformPriority(patient.priority),
        checkedInTime: attendance.checked_in_at ? new Date(attendance.checked_in_at) : null,
        onGoingTime: attendance.started_at ? new Date(attendance.started_at) : null,
        completedTime: attendance.completed_at ? new Date(attendance.completed_at) : null,
      };
      
      const type = transformAttendanceType(attendance.type);
      const progression = transformAttendanceProgression(attendance.status);
      
      // Skip cancelled attendances
      if (attendance.status === AttendanceStatus.CANCELLED) {
        return;
      }
      
      attendanceForDate[type][progression].push(attendanceDetail);
    });
    
    result.push(attendanceForDate);
  });
  
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Simplified transformation for attendances when patient data is not available
// This version uses patient_id as name placeholder
export const transformAttendancesFromApiSimple = (
  apiAttendances: AttendanceResponseDto[]
): IAttendanceByDate[] => {
  // Group attendances by date
  const attendancesByDate = new Map<string, AttendanceResponseDto[]>();
  
  apiAttendances.forEach(attendance => {
    const dateKey = attendance.scheduled_date;
    if (!attendancesByDate.has(dateKey)) {
      attendancesByDate.set(dateKey, []);
    }
    attendancesByDate.get(dateKey)!.push(attendance);
  });
  
  // Transform each date's attendances into IAttendanceByDate format
  const result: IAttendanceByDate[] = [];
  
  attendancesByDate.forEach((dateAttendances, dateKey) => {
    const date = new Date(dateKey);
    
    // Initialize the attendance structure for this date
    const attendanceForDate: IAttendanceByDate = {
      date,
      spiritual: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
      lightBath: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
      rod: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
    };
    
    // Process each attendance for this date
    dateAttendances.forEach(attendance => {
      const attendanceDetail: IAttendanceStatusDetail = {
        name: `Paciente ${attendance.patient_id}`, // Placeholder until we have patient data
        priority: "3" as IPriority, // Default priority
        checkedInTime: attendance.checked_in_at ? new Date(attendance.checked_in_at) : null,
        onGoingTime: attendance.started_at ? new Date(attendance.started_at) : null,
        completedTime: attendance.completed_at ? new Date(attendance.completed_at) : null,
      };
      
      const type = transformAttendanceType(attendance.type);
      const progression = transformAttendanceProgression(attendance.status);
      
      // Skip cancelled attendances
      if (attendance.status === AttendanceStatus.CANCELLED) {
        return;
      }
      
      attendanceForDate[type][progression].push(attendanceDetail);
    });
    
    result.push(attendanceForDate);
  });
  
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Transform API attendance array (with patient data) to single IAttendanceByDate
export const transformAttendanceWithPatientByDate = (
  apiAttendances: AttendanceResponseDto[],
  date: string
): IAttendanceByDate => {
  const dateObj = new Date(date);
  
  // Initialize the structure
  const attendance: IAttendanceByDate = {
    date: dateObj,
    spiritual: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
    lightBath: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
    rod: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
  };

  // Group attendances by type and status
  apiAttendances.forEach((apiAttendance) => {
    // Skip cancelled attendances
    if (apiAttendance.status === AttendanceStatus.CANCELLED) {
      return;
    }

    const type = transformAttendanceType(apiAttendance.type);
    const status = transformAttendanceProgression(apiAttendance.status);

    const patient: IAttendanceStatusDetail = {
      name: apiAttendance.patient?.name || `Paciente ${apiAttendance.patient_id}`,
      priority: apiAttendance.patient?.priority ? transformPriority(apiAttendance.patient.priority) : "3",
      checkedInTime: apiAttendance.checked_in_at ? new Date(apiAttendance.checked_in_at) : null,
      onGoingTime: apiAttendance.started_at ? new Date(apiAttendance.started_at) : null,
      completedTime: apiAttendance.completed_at ? new Date(apiAttendance.completed_at) : null,
      // Include IDs for backend sync
      attendanceId: apiAttendance.id,
      patientId: apiAttendance.patient_id,
    };

    attendance[type][status].push(patient);
  });

  return attendance;
};
