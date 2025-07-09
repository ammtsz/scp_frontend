export interface Agenda {
  id: string;
  type: 'spiritual' | 'lightBath' | 'rod';
  date: string;
  patients: string[]; // patient IDs
}

export type AgendaItem = {
  id: string;
  date: string;
  type: "spiritual" | "lightBath";
  patients: string[];
};
