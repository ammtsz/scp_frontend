import { useAttendances } from "@/contexts/AttendancesContext";

export function useAttendanceList(externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null) {
  console.log(externalCheckIn)

  const { attendances } = useAttendances();
  
  return { attendances};
}
