import type { IAttendanceType } from "@/types/globals";

export interface AbsenceJustification {
  patientId: number;
  patientName: string;
  attendanceType: IAttendanceType;
  justified?: boolean; // Optional until user selects
  justification?: string;
}

export interface ScheduledAbsence {
  patientId: number;
  patientName: string;
  attendanceType: IAttendanceType;
}
