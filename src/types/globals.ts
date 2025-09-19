export type IPriority = "1" | "2" | "3";
export type IStatus = "N" | "T" | "A" | "F";
export type IAttendanceType = "spiritual" | "lightBath" | "rod" | "combined"; // combined for calendar view
export type IAttendanceProgression = "scheduled" | "checkedIn" | "onGoing" | "completed";

// UI section types for the room layout
export type IUISection = "spiritual" | "mixed"; // spiritual room and mixed room (lightBath + rod)

export interface IRecommendations {
  food: string;
  water: string;
  ointment: string;
  lightBath: boolean;
  rod: boolean;
  spiritualTreatment: boolean;
  returnWeeks: number;
}

export interface IAttendanceStatusDetail {
  name: string; 
  priority: IPriority; 
  checkedInTime?: string | null; 
  onGoingTime?: string | null; 
  completedTime?: string | null;
  // Backend sync data
  attendanceId?: number;
  patientId?: number;
}


export interface IAttendanceStatus {
    scheduled: IAttendanceStatusDetail[],
    checkedIn: IAttendanceStatusDetail[],
    onGoing: IAttendanceStatusDetail[],
    completed: IAttendanceStatusDetail[],
  }

export type IAttendanceByDate = {
  date: Date;
} & {
  [type in IAttendanceType]: IAttendanceStatus;
};

export interface IAgendaItem {
  date: Date;
  patients: {
    id: string;
    name: string;
    priority: IPriority;
    attendanceId?: number; // Backend attendance ID for deletion
    attendanceType?: IAttendanceType; // Specific attendance type for individual patients
  }[];
}

export type IAgenda = {
  [K in IAttendanceType]: IAgendaItem[];
};

// Specialized agenda type for calendar view (combines lightBath and rod into lightBath)
export type ICalendarAgenda = {
  spiritual: IAgendaItem[];
  lightBath: IAgendaItem[];
};

export interface IPatients {
  name: string,
  id: string,
  phone: string,
  priority: IPriority,
  status: IStatus,
};

export interface IPatient extends IPatients {
  birthDate: Date,
  mainComplaint: string,
  startDate: Date,
  dischargeDate: Date | null,
  nextAttendanceDates: {
    date: Date,
    type: IAttendanceType
  }[],
  currentRecommendations: {
    date: Date,
  } & IRecommendations,
  previousAttendances: IPreviousAttendance[]
}

export interface IPreviousAttendance {
  attendanceId: string;
  date: Date;
  type: IAttendanceType;
  notes: string;
  recommendations: IRecommendations | null;
}
