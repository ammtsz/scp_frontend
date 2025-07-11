// PATIENT_TABLE
//   id
//   name
//   phone
//   priority
//   status
//   birthDate
//   mainComplaint
//   startDate
//   dischargeDate

// ATTENDANCES_TABLE
//   id
//   patient_id  
//   date
//   type
//   scheduled
//   checkedIn
//   onGoing
//   completed


// RECOMMENDATIONS_TABLE
//   id
//   attendance_id
//   patient_id
//   food
//   water
//   ointment
//   lightBath
//   spiritualTreatment
//   returnWeeks

// PATIENT_STATUS_TABLE
//   N
//   I
//   A
//   T
//   F

// PRIORITY_TABLE
//   N
//   I
//   E

// ATTENDANCE_TYPE_TABLE
//   spiritual
//   lightBath

// ATTENDANCE_STATUS_TABLE
//   scheduled
//   checkedIn
//   onGoing
//   completed


export type IPriority = "N" | "I" | "E";
export type IStatus = "T" | "A" | "F" | "N" | "I";
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

export interface IAttendanceStatus {
    scheduled: {name: string, priority: IPriority}[],
    checkedIn: {name: string, priority: IPriority, time: Date}[],
    onGoing: {name: string, priority: IPriority, time: Date}[],
    completed: {name: string, priority: IPriority, time: Date}[],
  }

export type IAttendance = {
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
