import { IAttendanceType, IAttendanceProgression } from "@/types/globals";

export interface IDraggedItem {
  type: IAttendanceType;
  status: IAttendanceProgression;
  idx: number;
  patientId: number; // Use patient ID for better tracking with sorted lists
}
