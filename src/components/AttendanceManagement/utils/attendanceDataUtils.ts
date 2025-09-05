import type { IAttendanceStatusDetail, IAttendanceType } from "@/types/globals";
import type { IAttendanceByDate } from "@/types/globals";

// Enhanced interface to include attendance type
export interface IAttendanceStatusDetailWithType extends IAttendanceStatusDetail {
  attendanceType: IAttendanceType;
}

export const getIncompleteAttendances = (attendancesByDate: IAttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const incomplete: IAttendanceStatusDetailWithType[] = [];
  // Collect all incomplete attendances from all types and statuses
  (["spiritual", "lightBath", "rod"] as IAttendanceType[]).forEach((type) => {
    ["checkedIn", "onGoing"].forEach((status) => {
      const typeData = attendancesByDate[type];
      if (typeData && typeof typeData === "object") {
        const statusData = typeData[status as keyof typeof typeData];
        if (Array.isArray(statusData)) {
          const attendancesWithType = (statusData as IAttendanceStatusDetail[]).map(attendance => ({
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

export const getCompletedAttendances = (attendancesByDate: IAttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const completed: IAttendanceStatusDetailWithType[] = [];
  // Collect all completed attendances from all types
  (["spiritual", "lightBath", "rod"] as IAttendanceType[]).forEach((type) => {
    const typeData = attendancesByDate[type];
    if (typeData && typeof typeData === "object" && "completed" in typeData) {
      const completedData = typeData.completed;
      if (Array.isArray(completedData)) {
        const attendancesWithType = (completedData as IAttendanceStatusDetail[]).map(attendance => ({
          ...attendance,
          attendanceType: type
        }));
        completed.push(...attendancesWithType);
      }
    }
  });

  return completed;
};

export const getScheduledAbsences = (attendancesByDate: IAttendanceByDate | null): IAttendanceStatusDetailWithType[] => {
  if (!attendancesByDate) return [];

  const scheduled: IAttendanceStatusDetailWithType[] = [];
  // Collect all scheduled attendances from all types
  (["spiritual", "lightBath", "rod"] as IAttendanceType[]).forEach((type) => {
    const typeData = attendancesByDate[type];
    if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
      const scheduledData = typeData.scheduled;
      if (Array.isArray(scheduledData)) {
        const attendancesWithType = (scheduledData as IAttendanceStatusDetail[]).map(attendance => ({
          ...attendance,
          attendanceType: type
        }));
        scheduled.push(...attendancesWithType);
      }
    }
  });

  return scheduled;
};
