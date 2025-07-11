import { useState } from "react";
import { IAttendance, IAttendanceType, IPriority } from "@/types/db";

export function useAttendanceListV2(attendances: IAttendance[], checkedInPatients: Record<IAttendanceType, string[]>, completedPatients: Record<IAttendanceType, string[]>, selectedDate: string) {
  // Returns the closest attendance date as a string (YYYY-MM-DD)
  const getClosestAttendanceDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureOrToday = attendances
      .map((a) => a.date)
      .filter((date) => date.toISOString().slice(0, 10) >= today)
      .sort();

    if (futureOrToday.length > 0) return futureOrToday[0].toISOString().slice(0, 10);

    const past = attendances
      .map((a) => a.date)
      .filter((date) => date.toISOString().slice(0, 10) < today)
      .sort();
    return past.length > 0 ? past[past.length - 1].toISOString().slice(0, 10) : "";
  };

  // Drag and drop logic for new IAttendance structure
  function movePatient(
    type: IAttendanceType,
    patientName: string,
    fromStatus: keyof IAttendance[IAttendanceType],
    toStatus: keyof IAttendance[IAttendanceType]
  ) {
    // Find the attendance for the selected date
    const attendanceForDate = attendances.find(
      (a) => a.date.toISOString().slice(0, 10) === selectedDate
    );
    if (!attendanceForDate) return attendances;

    // Find the patient object in the fromStatus array
    const patientObj = attendanceForDate[type][fromStatus].find(
      (p) => p.name === patientName
    );
    if (!patientObj) return attendances;

    // Remove from fromStatus
    const newFromArr = attendanceForDate[type][fromStatus].filter(
      (p) => p.name !== patientName
    );

    // Add to toStatus (with time if moving to checkedIn/onGoing/completed)
    const newToArr = [...attendanceForDate[type][toStatus]];
    if (["checkedIn", "onGoing", "completed"].includes(toStatus)) {
      newToArr.push({ ...patientObj, time: new Date() });
    } else {
      // scheduled
      newToArr.push({ name: patientObj.name, priority: patientObj.priority });
    }

    // Build new attendance object
    const newAttendance = attendances.map((a) => {
      if (a.date.toISOString().slice(0, 10) === selectedDate) {
        return {
          ...a,
          [type]: {
            ...a[type],
            [fromStatus]: newFromArr,
            [toStatus]: newToArr,
          },
        };
      }
      return a;
    });
    return newAttendance;
  }

  return { getClosestAttendanceDate, movePatient };
}
