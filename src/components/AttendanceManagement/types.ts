import { IAttendanceType, IAttendanceProgression } from "@/types/globals";

export interface IDraggedItem {
  type: IAttendanceType;
  status: IAttendanceProgression;
  idx: number;
  name: string; // Add patient name for better tracking with sorted lists
}
