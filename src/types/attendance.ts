export interface AttendanceList {
  id: string;
  date: string;
  type: 'spiritual' | 'lightBath' | 'rod';
  patients: string[]; // patient IDs in order
}

export type Attendance = {
  date: string;
  type: "spiritual" | "lightBath";
  patients: string[];
  notes?: string;
  recommendations?: import("@/types/patient").Recommendations;
};
