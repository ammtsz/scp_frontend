import { IAttendanceType, IAttendanceProgression } from "@/types/globals";

export interface IDraggedItem {
  type: IAttendanceType;
  status: IAttendanceProgression;
  idx: number;
}
