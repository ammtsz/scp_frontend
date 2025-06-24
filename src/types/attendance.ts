export interface AttendanceList {
  id: string;
  date: string;
  type: 'spiritual' | 'lightBath' | 'staff';
  patients: string[]; // patient IDs in order
}
