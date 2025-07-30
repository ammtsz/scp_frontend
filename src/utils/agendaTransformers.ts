import { 
  AttendanceResponseDto,
  PatientResponseDto,
  AttendanceType,
  AttendanceStatus 
} from '@/api/types';
import { 
  IPriority, 
  IAgenda,
  IAgendaItem
} from '@/types/globals';
import { transformPriority } from './apiTransformers';

// Transform attendances from API to IAgenda format
export const transformAttendancesToAgenda = (
  apiAttendances: AttendanceResponseDto[],
  apiPatients?: PatientResponseDto[]
): IAgenda => {
  // Create a map of patient ID to patient data for quick lookup
  const patientsMap = apiPatients ? new Map(apiPatients.map(p => [p.id, p])) : new Map();
  
  // Group attendances by type and date
  const spiritualAttendances: IAgendaItem[] = [];
  const lightBathAttendances: IAgendaItem[] = [];
  
  // Group by date first
  const attendancesByDate = new Map<string, AttendanceResponseDto[]>();
  
  apiAttendances.forEach(attendance => {
    // Only include scheduled attendances for agenda
    if (attendance.status !== AttendanceStatus.SCHEDULED) return;
    
    const dateKey = attendance.scheduled_date;
    if (!attendancesByDate.has(dateKey)) {
      attendancesByDate.set(dateKey, []);
    }
    attendancesByDate.get(dateKey)!.push(attendance);
  });
  
  // Transform to agenda format
  attendancesByDate.forEach((dateAttendances, dateKey) => {
    const date = new Date(dateKey);
    
    const spiritualPatientsForDate: { id: string; name: string; priority: IPriority }[] = [];
    const lightBathPatientsForDate: { id: string; name: string; priority: IPriority }[] = [];
    
    dateAttendances.forEach(attendance => {
      const patient = patientsMap.get(attendance.patient_id);
      const patientInfo = {
        id: attendance.patient_id.toString(),
        name: patient ? patient.name : `Paciente ${attendance.patient_id}`,
        priority: patient ? transformPriority(patient.priority) : "3" as IPriority,
      };
      
      if (attendance.type === AttendanceType.SPIRITUAL) {
        spiritualPatientsForDate.push(patientInfo);
      } else if (attendance.type === AttendanceType.LIGHT_BATH) {
        lightBathPatientsForDate.push(patientInfo);
      }
    });
    
    if (spiritualPatientsForDate.length > 0) {
      spiritualAttendances.push({
        date,
        patients: spiritualPatientsForDate,
      });
    }
    
    if (lightBathPatientsForDate.length > 0) {
      lightBathAttendances.push({
        date,
        patients: lightBathPatientsForDate,
      });
    }
  });
  
  return {
    spiritual: spiritualAttendances.sort((a, b) => a.date.getTime() - b.date.getTime()),
    lightBath: lightBathAttendances.sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
};
