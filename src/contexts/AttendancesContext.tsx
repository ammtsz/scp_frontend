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
import { IAttendanceByDate, IAttendanceStatusDetail } from "@/types/globals";
import { transformAttendanceWithPatientByDate } from "@/utils/apiTransformers";
import { AttendanceStatus } from "@/api/types";

// Interfaces for the new end-of-day workflow
interface AbsenceJustification {
  attendanceId: number;
  patientName: string;
  justified: boolean;
  notes: string;
}

interface EndOfDayResult {
  type: "incomplete" | "scheduled_absences" | "completed";
  incompleteAttendances?: IAttendanceStatusDetail[];
  scheduledAbsences?: IAttendanceStatusDetail[];
  completionData?: {
    totalPatients: number;
    completedPatients: number;
    missedPatients: number;
    completionTime: Date;
  };
}

// Legacy interface for backward compatibility
interface EndOfDayData {
  incompleteAttendances: IAttendanceStatusDetail[];
  scheduledAbsences: IAttendanceStatusDetail[];
  absenceJustifications: Array<{
    patientId: number;
    patientName: string;
    justified: boolean;
    notes: string;
  }>;
}

interface AttendancesContextProps {
  attendancesByDate: IAttendanceByDate | null;
  setAttendancesByDate: React.Dispatch<
    React.SetStateAction<IAttendanceByDate | null>
  >;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  dataLoading: boolean;
  error: string | null;
  loadAttendancesByDate: (date: string) => Promise<IAttendanceByDate | null>;
  bulkUpdateStatus: (ids: number[], status: string) => Promise<boolean>;
  initializeSelectedDate: () => Promise<void>;
  refreshCurrentDate: () => Promise<void>;
  // New end-of-day workflow functions
  checkEndOfDayStatus: () => EndOfDayResult;
  finalizeEndOfDay: (data?: EndOfDayData) => Promise<EndOfDayResult>;
  handleIncompleteAttendances: (
    attendances: IAttendanceStatusDetail[],
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
    useState<IAttendanceByDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Enhanced function using automatic case conversion
  const loadAttendancesByDate = useCallback(
    async (date: string): Promise<IAttendanceByDate | null> => {
      try {
        setDataLoading(true);
        setError(null);

        // Using existing API but with automatic case conversion
        const result = await getAttendancesByDate(date);

        if (result.success && result.value) {
          // Transform the structure for component format
          // Note: We still use the existing transformer for now, but it now gets camelCase data
          const attendancesByDateMapped = transformAttendanceWithPatientByDate(
            result.value, // Keep using original for compatibility
            date
          );

          setAttendancesByDate(attendancesByDateMapped);
          return attendancesByDateMapped;
        } else {
          console.error("Failed to load attendances for date:", result.error);
          setError(result.error || "Erro ao carregar atendimentos");
          return null;
        }
      } catch (error) {
        console.error("Error loading attendances for date:", error);
        setError("Erro ao carregar atendimentos");
        return null;
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  const refreshCurrentDate = useCallback(async () => {
    await loadAttendancesByDate(selectedDate);
  }, [loadAttendancesByDate, selectedDate]);

  const initializeSelectedDate = useCallback(async () => {
    try {
      setLoading(true);

      // Using existing API with case conversion
      const result = await getNextAttendanceDate();

      if (result.success && result.value?.next_date) {
        setSelectedDate(result.value.next_date);
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setSelectedDate(today);
      }
    } catch (error) {
      console.error("Error getting next attendance date:", error);
      const today = new Date().toISOString().slice(0, 10);
      setSelectedDate(today);
      setError("Erro ao obter próxima data de atendimento");
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateStatus = async (
    ids: number[],
    status: string
  ): Promise<boolean> => {
    try {
      // Using existing API with case conversion for the request
      const result = await bulkUpdateAttendanceStatus(
        ids,
        status as AttendanceStatus
      );

      if (result.success) {
        // Refresh current date after bulk update
        await refreshCurrentDate();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in bulk update:", error);
      return false;
    }
  };

  // Treatment workflow functions - removed createSpiritualConsultationRecord

  // New end-of-day workflow implementation
  const checkEndOfDayStatus = useCallback((): EndOfDayResult => {
    if (!attendancesByDate) {
      return {
        type: "completed",
        completionData: {
          totalPatients: 0,
          completedPatients: 0,
          missedPatients: 0,
          completionTime: new Date(),
        },
      };
    }

    // Check for incomplete attendances (checked-in or ongoing)
    const incompleteAttendances: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      ["checkedIn", "onGoing"].forEach((status) => {
        const typeData =
          attendancesByDate[type as keyof typeof attendancesByDate];
        if (typeData && typeof typeData === "object") {
          const statusData = typeData[status as keyof typeof typeData];
          if (Array.isArray(statusData)) {
            incompleteAttendances.push(
              ...(statusData as IAttendanceStatusDetail[])
            );
          }
        }
      });
    });

    if (incompleteAttendances.length > 0) {
      return { type: "incomplete", incompleteAttendances };
    }

    // Check for scheduled absences
    const scheduledAbsences: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData =
        attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
        const scheduledData = typeData.scheduled;
        if (Array.isArray(scheduledData)) {
          scheduledAbsences.push(
            ...(scheduledData as IAttendanceStatusDetail[])
          );
        }
      }
    });

    if (scheduledAbsences.length > 0) {
      return { type: "scheduled_absences", scheduledAbsences };
    }

    // All patients completed - calculate stats
    const completedAttendances: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData =
        attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object" && "completed" in typeData) {
        const completedData = typeData.completed;
        if (Array.isArray(completedData)) {
          completedAttendances.push(
            ...(completedData as IAttendanceStatusDetail[])
          );
        }
      }
    });

    return {
      type: "completed",
      completionData: {
        totalPatients: completedAttendances.length,
        completedPatients: completedAttendances.length,
        missedPatients: 0,
        completionTime: new Date(),
      },
    };
  }, [attendancesByDate]);

  const handleIncompleteAttendances = useCallback(
    async (
      attendances: IAttendanceStatusDetail[],
      action: "complete" | "reschedule"
    ): Promise<boolean> => {
      try {
        for (const attendance of attendances) {
          if (attendance.attendanceId) {
            if (action === "complete") {
              await completeAttendance(attendance.attendanceId.toString());
            } else {
              // Reschedule: move back to scheduled status
              await updateAttendance(attendance.attendanceId.toString(), {
                status: AttendanceStatus.SCHEDULED,
              });
            }
          }
        }
        await refreshCurrentDate();
        return true;
      } catch (error) {
        console.error("Error handling incomplete attendances:", error);
        setError("Erro ao processar atendimentos incompletos");
        return false;
      }
    },
    [refreshCurrentDate]
  );

  const handleAbsenceJustifications = useCallback(
    async (justifications: AbsenceJustification[]): Promise<boolean> => {
      try {
        for (const justification of justifications) {
          await markAttendanceAsMissed(
            justification.attendanceId.toString(),
            justification.justified,
            justification.notes || ""
          );

          // If unjustified, increment missing appointments streak
          if (!justification.justified && attendancesByDate) {
            // Find patient and update missing appointments streak
            // This would require additional API call to update patient data
            // For now, we'll track it in the attendance notes
            await updateAttendance(justification.attendanceId.toString(), {
              notes: justification.notes || "Falta não justificada",
            });
          }
        }
        await refreshCurrentDate();
        return true;
      } catch (error) {
        console.error("Error handling absence justifications:", error);
        setError("Erro ao processar justificativas de faltas");
        return false;
      }
    },
    [attendancesByDate, refreshCurrentDate]
  );

  // Enhanced finalizeEndOfDay function that combines legacy support with new workflow
  const finalizeEndOfDay = useCallback(
    async (data?: EndOfDayData): Promise<EndOfDayResult> => {
      try {
        if (!attendancesByDate) {
          setError("Nenhum atendimento carregado para finalizar o dia");
          return {
            type: "completed",
            completionData: {
              totalPatients: 0,
              completedPatients: 0,
              missedPatients: 0,
              completionTime: new Date(),
            },
          };
        }

        // If data is provided, use legacy implementation
        if (data) {
          // Step 1: Mark scheduled absences as missed with justifications
          for (const absence of data.scheduledAbsences) {
            const justification = data.absenceJustifications.find(
              (j) => j.patientId === absence.patientId
            );

            if (justification && absence.attendanceId) {
              await markAttendanceAsMissed(
                absence.attendanceId.toString(),
                justification.justified,
                justification.notes
              );
            }
          }

          // Step 2: Handle incomplete attendances (checked in but not completed)
          for (const incomplete of data.incompleteAttendances) {
            // Mark incomplete attendances as cancelled for rescheduling
            if (incomplete.attendanceId) {
              await updateAttendance(incomplete.attendanceId.toString(), {
                status: AttendanceStatus.CANCELLED,
              });
            }
          }
        } else {
          // Use new workflow - handle both incomplete and scheduled separately

          // Check for incomplete attendances (checked-in or ongoing)
          const incompleteAttendances: IAttendanceStatusDetail[] = [];
          ["spiritual", "lightBath", "rod"].forEach((type) => {
            ["checkedIn", "onGoing"].forEach((status) => {
              const typeData =
                attendancesByDate[type as keyof typeof attendancesByDate];
              if (typeData && typeof typeData === "object") {
                const statusData = typeData[status as keyof typeof typeData];
                if (Array.isArray(statusData)) {
                  incompleteAttendances.push(
                    ...(statusData as IAttendanceStatusDetail[])
                  );
                }
              }
            });
          });

          if (incompleteAttendances.length > 0) {
            // Auto-reschedule incomplete attendances
            const success = await handleIncompleteAttendances(
              incompleteAttendances,
              "reschedule"
            );
            if (!success) {
              throw new Error("Failed to handle incomplete attendances");
            }
          }

          // Check for scheduled absences separately
          const scheduledAbsences: IAttendanceStatusDetail[] = [];
          ["spiritual", "lightBath", "rod"].forEach((type) => {
            const typeData =
              attendancesByDate[type as keyof typeof attendancesByDate];
            if (
              typeData &&
              typeof typeData === "object" &&
              "scheduled" in typeData
            ) {
              const scheduledData = typeData.scheduled;
              if (Array.isArray(scheduledData)) {
                scheduledAbsences.push(
                  ...(scheduledData as IAttendanceStatusDetail[])
                );
              }
            }
          });

          if (scheduledAbsences.length > 0) {
            // Auto-mark all as unjustified
            const justifications: AbsenceJustification[] =
              scheduledAbsences.map((attendance) => ({
                attendanceId: attendance.attendanceId!,
                patientName: attendance.name,
                justified: false,
                notes: "",
              }));
            const success = await handleAbsenceJustifications(justifications);
            if (!success) {
              throw new Error("Failed to handle absence justifications");
            }
          }
        }

        // Refresh the data to show updated status
        await refreshCurrentDate();

        // Calculate and return final statistics
        let totalPatients = 0;
        let completedPatients = 0;
        let missedPatients = 0;

        ["spiritual", "lightBath", "rod"].forEach((type) => {
          const typeData =
            attendancesByDate[type as keyof typeof attendancesByDate];
          if (typeData && typeof typeData === "object") {
            Object.keys(typeData).forEach((status) => {
              const statusData = typeData[status as keyof typeof typeData];
              if (Array.isArray(statusData)) {
                const attendances = statusData as IAttendanceStatusDetail[];
                totalPatients += attendances.length;
                if (status === "completed") {
                  completedPatients += attendances.length;
                } else if (status === "missed") {
                  missedPatients += attendances.length;
                }
              }
            });
          }
        });

        return {
          type: "completed",
          completionData: {
            totalPatients,
            completedPatients,
            missedPatients,
            completionTime: new Date(),
          },
        };
      } catch (error) {
        console.error("Error finalizing end of day:", error);
        setError(
          "Erro ao finalizar dia: alguns atendimentos podem não ter sido atualizados"
        );
        return {
          type: "completed",
          completionData: {
            totalPatients: 0,
            completedPatients: 0,
            missedPatients: 0,
            completionTime: new Date(),
          },
        };
      }
    },
    [
      attendancesByDate,
      refreshCurrentDate,
      handleIncompleteAttendances,
      handleAbsenceJustifications,
    ]
  );

  useEffect(() => {
    initializeSelectedDate();
  }, [initializeSelectedDate]);

  useEffect(() => {
    if (selectedDate) {
      loadAttendancesByDate(selectedDate);
    }
  }, [selectedDate, loadAttendancesByDate]);

  return (
    <AttendancesContext.Provider
      value={{
        attendancesByDate,
        setAttendancesByDate,
        selectedDate,
        setSelectedDate,
        loading,
        dataLoading,
        error,
        loadAttendancesByDate,
        initializeSelectedDate,
        refreshCurrentDate,
        bulkUpdateStatus,
        checkEndOfDayStatus,
        finalizeEndOfDay,
        handleIncompleteAttendances,
        handleAbsenceJustifications,
      }}
    >
      {children}
    </AttendancesContext.Provider>
  );
};

export function useAttendances() {
  const context = useContext(AttendancesContext);
  if (!context)
    throw new Error(
      "useAttendances must be used within an AttendancesProvider"
    );
  return context;
}
