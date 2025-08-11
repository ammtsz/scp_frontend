export type IPriority = "1" | "2" | "3";
export type IStatus = "T" | "A" | "F";
export type IAttendanceType = "spiritual" | "lightBath";
export type IAttendanceProgression = "scheduled" | "checkedIn" | "onGoing" | "completed";

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
  checkedInTime?: Date | null; 
  onGoingTime?: Date | null; 
  completedTime?: Date | null;
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
  }[];
}

export type IAgenda = {
  [K in IAttendanceType]: IAgendaItem[];
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
