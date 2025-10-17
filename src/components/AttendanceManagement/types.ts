import { IAttendanceType, IAttendanceProgression } from "@/types/globals";

export interface IDraggedItem {
  type: IAttendanceType;
  status: IAttendanceProgression;
  idx: number;
  patientId: number; // Use patient ID for better tracking with sorted lists
  isCombinedTreatment?: boolean; // Flag to indicate if this is a combined treatment card
  treatmentTypes?: IAttendanceType[]; // All treatment types for combined cards
}
