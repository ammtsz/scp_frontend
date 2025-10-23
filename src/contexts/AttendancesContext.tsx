/**
 * AttendancesContext - Migrated to Unified Type System
 *
 * This is the migrated version of AttendancesContext using the new unified type system.
 * It maintains backward compatibility while gradually adopting new types.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  getAttendancesByDate,
  getNextAttendanceDate,
  bulkUpdateAttendanceStatus,
  updateAttendance,
  markAttendanceAsMissed,
  completeAttendance,
} from "@/api/attendances";
import {
  AttendanceByDate,
  AttendanceStatusDetail,
  AttendanceStatus,
} from "@/types/types";
import { AttendanceStatus as ApiAttendanceStatus } from "@/api/types";
import { transformAttendanceWithPatientByDate } from "@/utils/apiTransformers";

// Interfaces for the end-of-day workflow
interface AbsenceJustification {
  attendanceId: number;
  patientName: string;
  justified: boolean;
  notes: string;
}

interface EndOfDayResult {
  type: "incomplete" | "scheduled_absences" | "completed";
  incompleteAttendances?: AttendanceStatusDetail[];
  scheduledAbsences?: AttendanceStatusDetail[];
  completionData?: {
    totalPatients: number;
    completedPatients: number;
    missedPatients: number;
    completionTime: Date;
  };
}

// Legacy interface for backward compatibility during migration
interface EndOfDayData {
  incompleteAttendances: AttendanceStatusDetail[];
  scheduledAbsences: AttendanceStatusDetail[];
  absenceJustifications: Array<{
    patientId: number;
    patientName: string;
    justified: boolean;
    notes: string;
  }>;
}

interface AttendancesContextProps {
  attendancesByDate: AttendanceByDate | null;
  setAttendancesByDate: React.Dispatch<
    React.SetStateAction<AttendanceByDate | null>
  >;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  dataLoading: boolean;
  error: string | null;
  loadAttendancesByDate: (date: string) => Promise<AttendanceByDate | null>;
  bulkUpdateStatus: (ids: number[], status: string) => Promise<boolean>;
  initializeSelectedDate: () => Promise<void>;
  refreshCurrentDate: () => Promise<void>;
  // End-of-day workflow functions
  checkEndOfDayStatus: () => EndOfDayResult;
  finalizeEndOfDay: (data?: EndOfDayData) => Promise<EndOfDayResult>;
  handleIncompleteAttendances: (
    attendances: AttendanceStatusDetail[],
    action: "complete" | "reschedule"
  ) => Promise<boolean>;
  handleAbsenceJustifications: (
    justifications: AbsenceJustification[]
  ) => Promise<boolean>;
}

const AttendancesContext = createContext<AttendancesContextProps | undefined>(
  undefined
);

export const AttendancesProvider = ({ children }: { children: ReactNode }) => {
  const [attendancesByDate, setAttendancesByDate] =
    useState<AttendanceByDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Enhanced function using unified types and automatic case conversion
  const loadAttendancesByDate = useCallback(
    async (date: string): Promise<AttendanceByDate | null> => {
      try {
        setDataLoading(true);
        setError(null);

        const response = await getAttendancesByDate(date);
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch attendances");
        }
        const transformedData = transformAttendanceWithPatientByDate(
          response.value || [],
          date
        );

        setAttendancesByDate(transformedData);
        return transformedData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load attendances";
        setError(errorMessage);
        console.error("Error loading attendances by date:", err);
        return null;
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  // Refresh current date data
  const refreshCurrentDate = useCallback(async (): Promise<void> => {
    await loadAttendancesByDate(selectedDate);
  }, [loadAttendancesByDate, selectedDate]);

  // Bulk update status with unified types
  const bulkUpdateStatus = useCallback(
    async (ids: number[], status: string): Promise<boolean> => {
      try {
        await bulkUpdateAttendanceStatus(ids, status as ApiAttendanceStatus);
        await refreshCurrentDate();
        return true;
      } catch (err) {
        console.error("Error updating attendance status:", err);
        return false;
      }
    },
    [refreshCurrentDate]
  );

  // Initialize selected date
  const initializeSelectedDate = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getNextAttendanceDate();
      if (response.success && response.value?.next_date) {
        setSelectedDate(response.value.next_date);
        await loadAttendancesByDate(response.value.next_date);
      } else {
        // Use current date as fallback instead of selectedDate state
        const currentDate = new Date().toISOString().slice(0, 10);
        await loadAttendancesByDate(currentDate);
      }
    } catch (err) {
      console.error("Error initializing selected date:", err);
      // Use current date as fallback instead of selectedDate state
      const currentDate = new Date().toISOString().slice(0, 10);
      await loadAttendancesByDate(currentDate);
    } finally {
      setLoading(false);
    }
  }, [loadAttendancesByDate]);

  // Check end-of-day status with unified types
  const checkEndOfDayStatus = useCallback((): EndOfDayResult => {
    if (!attendancesByDate) {
      return { type: "incomplete", incompleteAttendances: [] };
    }

    const isAttendanceStatus = (value: unknown): value is AttendanceStatus => {
      const candidate = value as AttendanceStatus;
      return !!(
        value &&
        typeof value === "object" &&
        Array.isArray(candidate.scheduled) &&
        Array.isArray(candidate.checkedIn) &&
        Array.isArray(candidate.onGoing)
      );
    };

    const allAttendances = Object.values(attendancesByDate)
      .filter(isAttendanceStatus)
      .flatMap((typeData) => [
        ...typeData.scheduled,
        ...typeData.checkedIn,
        ...typeData.onGoing,
      ]);

    const scheduledAttendances = Object.values(attendancesByDate)
      .filter(isAttendanceStatus)
      .flatMap((typeData) => typeData.scheduled);

    if (allAttendances.length === 0) {
      return { type: "completed" };
    }

    if (scheduledAttendances.length > 0) {
      return {
        type: "scheduled_absences",
        scheduledAbsences: scheduledAttendances,
      };
    }

    return {
      type: "incomplete",
      incompleteAttendances: allAttendances,
    };
  }, [attendancesByDate]);

  // Finalize end-of-day with unified types
  const finalizeEndOfDay = useCallback(
    async (data?: EndOfDayData): Promise<EndOfDayResult> => {
      try {
        if (!attendancesByDate) {
          throw new Error("No attendance data available");
        }

        const completedAttendances = Object.values(attendancesByDate)
          .filter(
            (typeData) =>
              typeof typeData === "object" &&
              typeData !== null &&
              !!(typeData as AttendanceStatus).completed
          )
          .reduce(
            (total, typeData) =>
              total + ((typeData as AttendanceStatus).completed?.length || 0),
            0
          );

        let missedCount = 0;

        // Handle absence justifications if provided
        if (data?.absenceJustifications) {
          for (const justification of data.absenceJustifications) {
            if (!justification.justified) {
              // Mark as missed if not justified
              await markAttendanceAsMissed(
                justification.patientId.toString(),
                false,
                justification.notes
              );
              missedCount++;
            }
          }
        }

        return {
          type: "completed",
          completionData: {
            totalPatients: completedAttendances + missedCount,
            completedPatients: completedAttendances,
            missedPatients: missedCount,
            completionTime: new Date(),
          },
        };
      } catch (err) {
        console.error("Error finalizing end of day:", err);
        throw err;
      }
    },
    [attendancesByDate]
  );

  // Handle incomplete attendances with unified types
  const handleIncompleteAttendances = useCallback(
    async (
      attendances: AttendanceStatusDetail[],
      action: "complete" | "reschedule"
    ): Promise<boolean> => {
      try {
        for (const attendance of attendances) {
          if (!attendance.attendanceId) continue;

          if (action === "complete") {
            await completeAttendance(attendance.attendanceId.toString());
          } else if (action === "reschedule") {
            // Reschedule logic would go here
            await updateAttendance(attendance.attendanceId.toString(), {
              status: ApiAttendanceStatus.SCHEDULED,
            });
          }
        }

        await refreshCurrentDate();
        return true;
      } catch (err) {
        console.error("Error handling incomplete attendances:", err);
        return false;
      }
    },
    [refreshCurrentDate]
  );

  // Handle absence justifications with unified types
  const handleAbsenceJustifications = useCallback(
    async (justifications: AbsenceJustification[]): Promise<boolean> => {
      try {
        for (const justification of justifications) {
          if (justification.justified) {
            // Update attendance with justified absence
            await updateAttendance(justification.attendanceId.toString(), {
              absence_justified: true,
              absence_notes: justification.notes,
              status: ApiAttendanceStatus.MISSED,
            });
          } else {
            // Mark as missed without justification
            await markAttendanceAsMissed(
              justification.attendanceId.toString(),
              false,
              justification.notes
            );
          }
        }

        await refreshCurrentDate();
        return true;
      } catch (err) {
        console.error("Error handling absence justifications:", err);
        return false;
      }
    },
    [refreshCurrentDate]
  );

  // Load data on mount (only once)
  useEffect(() => {
    initializeSelectedDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  // Load data when selected date changes
  useEffect(() => {
    if (selectedDate) {
      loadAttendancesByDate(selectedDate);
    }
  }, [selectedDate, loadAttendancesByDate]);

  const contextValue: AttendancesContextProps = {
    attendancesByDate,
    setAttendancesByDate,
    selectedDate,
    setSelectedDate,
    loading,
    dataLoading,
    error,
    loadAttendancesByDate,
    bulkUpdateStatus,
    initializeSelectedDate,
    refreshCurrentDate,
    checkEndOfDayStatus,
    finalizeEndOfDay,
    handleIncompleteAttendances,
    handleAbsenceJustifications,
  };

  return (
    <AttendancesContext.Provider value={contextValue}>
      {children}
    </AttendancesContext.Provider>
  );
};

export const useAttendances = (): AttendancesContextProps => {
  const context = useContext(AttendancesContext);
  if (!context) {
    throw new Error(
      "useAttendances must be used within an AttendancesProvider"
    );
  }
  return context;
};

// Export types for use in components
export type {
  AttendancesContextProps,
  AbsenceJustification,
  EndOfDayResult,
  EndOfDayData,
};
