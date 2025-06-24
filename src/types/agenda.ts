export interface Agenda {
  id: string;
  type: 'spiritual' | 'lightBath' | 'staff';
  date: string;
  patients: string[]; // patient IDs
}
