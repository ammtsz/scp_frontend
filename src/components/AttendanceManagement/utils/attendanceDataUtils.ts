import type { AttendanceStatusDetail, AttendanceType } from "@/types/types";
import type { AttendanceByDate } from "@/types/types";

// Enhanced interface to include attendance type
export interface IAttendanceStatusDetailWithType extends AttendanceStatusDetail {
  attendanceType: AttendanceType;
}

export const getIncompleteAttendances = (attendancesByDate: AttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const incomplete: IAttendanceStatusDetailWithType[] = [];
  // Collect all incomplete attendances from all types and statuses
  (["spiritual", "lightBath", "rod"] as AttendanceType[]).forEach((type) => {
    ["checkedIn", "onGoing"].forEach((status) => {
      const typeData = attendancesByDate[type];
      if (typeData && typeof typeData === "object") {
        const statusData = typeData[status as keyof typeof typeData];
        if (Array.isArray(statusData)) {
          const attendancesWithType = (statusData as AttendanceStatusDetail[]).map(attendance => ({
            ...attendance,
            attendanceType: type
          }));
          incomplete.push(...attendancesWithType);
        }
      }
    });
  });

  return incomplete;
};

export const getCompletedAttendances = (attendancesByDate: AttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const completed: IAttendanceStatusDetailWithType[] = [];
  // Collect all completed attendances from all types
  (["spiritual", "lightBath", "rod"] as AttendanceType[]).forEach((type) => {
    const typeData = attendancesByDate[type];
    if (typeData && typeof typeData === "object" && "completed" in typeData) {
      const completedData = typeData.completed;
      if (Array.isArray(completedData)) {
        const attendancesWithType = (completedData as AttendanceStatusDetail[]).map(attendance => ({
          ...attendance,
          attendanceType: type
        }));
        completed.push(...attendancesWithType);
      }
    }
  });

  return completed;
};

export const getScheduledAbsences = (attendancesByDate: AttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const scheduled: IAttendanceStatusDetailWithType[] = [];
  // Collect all scheduled attendances from all types
  (["spiritual", "lightBath", "rod"] as AttendanceType[]).forEach((type) => {
    const typeData = attendancesByDate[type];
    if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
      const scheduledData = typeData.scheduled;
      if (Array.isArray(scheduledData)) {
        const attendancesWithType = (scheduledData as AttendanceStatusDetail[]).map(attendance => ({
          ...attendance,
          attendanceType: type
        }));
        scheduled.push(...attendancesWithType);
      }
    }
  });

  return scheduled;
};
