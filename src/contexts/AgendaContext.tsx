"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  getAttendancesForAgenda,
  deleteAttendance,
  createAttendance,
} from "@/api/attendances";
import {
  AttendanceAgendaDto,
  AttendanceType,
  CreateAttendanceRequest,
} from "@/api/types";
import { IAgenda, ICalendarAgenda, IPriority } from "@/types/globals";
import { transformAttendanceType } from "@/utils/apiTransformers";

// Transform backend data to frontend agenda format
const transformToAgenda = (
  attendances: AttendanceAgendaDto[]
): ICalendarAgenda => {
  const spiritual: IAgenda["spiritual"] = [];
  const lightBath: IAgenda["lightBath"] = [];

  // Group attendances by date and type
  const grouped = attendances.reduce((acc, attendance) => {
    const dateKey = attendance.scheduled_date;
    // Rod attendances should be grouped with lightBath in calendar view
    const type =
      attendance.type === AttendanceType.SPIRITUAL ? "spiritual" : "lightBath";

    if (!acc[type]) acc[type] = {};
    if (!acc[type][dateKey]) acc[type][dateKey] = [];

    acc[type][dateKey].push({
      id: attendance.patient_id.toString(),
      name: attendance.patient_name,
      priority: attendance.patient_priority as IPriority,
      attendanceId: attendance.id,
      type: attendance.type, // Use the specific attendance type
    });
    return acc;
  }, {} as Record<string, Record<string, Array<{ id: string; name: string; priority: IPriority; attendanceId: number; type: AttendanceType }>>>);

  // Convert grouped data to frontend format
  Object.entries(grouped.spiritual || {}).forEach(([date, patients]) => {
    spiritual.push({
      date: new Date(date + "T00:00:00"), // Add time to ensure local timezone interpretation
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        priority: p.priority,
        attendanceId: p.attendanceId,
        attendanceType: transformAttendanceType(p.type),
      })),
    });
  });

  Object.entries(grouped.lightBath || {}).forEach(([date, patients]) => {
    lightBath.push({
      date: new Date(date + "T00:00:00"), // Add time to ensure local timezone interpretation
      patients: patients.map((p) => ({
        id: p.id,
        name: p.name,
        priority: p.priority,
        attendanceId: p.attendanceId,
        attendanceType: transformAttendanceType(p.type),
      })),
    });
  });

  return { spiritual, lightBath };
};

interface AgendaContextProps {
  agenda: ICalendarAgenda;
  loading: boolean;
  error: string | null;
  loadAgendaAttendances: (filters?: {
    status?: string;
    type?: string;
    limit?: number;
  }) => Promise<AttendanceAgendaDto[]>;
  refreshAgenda: () => Promise<void>;
  removePatientFromAgenda: (attendanceId: number) => Promise<boolean>;
  addPatientToAgenda: (
    attendanceData: CreateAttendanceRequest
  ) => Promise<boolean>;
}

const AgendaContext = createContext<AgendaContextProps | undefined>(undefined);

export const AgendaProvider = ({ children }: { children: ReactNode }) => {
  const [agenda, setAgenda] = useState<ICalendarAgenda>({
    spiritual: [],
    lightBath: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgendaAttendances = useCallback(
    async (filters?: {
      status?: string;
      type?: string;
      limit?: number;
    }): Promise<AttendanceAgendaDto[]> => {
      const result = await getAttendancesForAgenda(filters);
      if (result.success && result.value) {
        return result.value;
      } else {
        const errorMessage = result.error || "Erro ao carregar agenda";
        console.error("Failed to load agenda attendances:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const refreshAgenda = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get only scheduled attendances for the agenda view
      const attendances = await loadAgendaAttendances({ status: "scheduled" });
      const transformedAgenda = transformToAgenda(attendances);
      setAgenda(transformedAgenda);
    } catch (err) {
      // Always use user-friendly Portuguese error message
      setError("Erro ao carregar agenda");
      console.error("Error refreshing agenda:", err);
    } finally {
      setLoading(false);
    }
  }, [loadAgendaAttendances]);

  const removePatientFromAgenda = useCallback(
    async (attendanceId: number): Promise<boolean> => {
      try {
        const result = await deleteAttendance(attendanceId.toString());
        if (result.success) {
          // Refresh agenda after successful deletion
          await refreshAgenda();
          return true;
        } else {
          setError(result.error || "Failed to remove patient from agenda");
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove patient";
        setError(errorMessage);
        console.error("Error removing patient from agenda:", err);
        return false;
      }
    },
    [refreshAgenda]
  );

  const addPatientToAgenda = useCallback(
    async (attendanceData: CreateAttendanceRequest): Promise<boolean> => {
      try {
        const result = await createAttendance(attendanceData);
        if (result.success) {
          // Refresh agenda after successful creation
          await refreshAgenda();
          return true;
        } else {
          setError(result.error || "Failed to add patient to agenda");
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add patient";
        setError(errorMessage);
        console.error("Error adding patient to agenda:", err);
        return false;
      }
    },
    [refreshAgenda]
  );

  // Load agenda on mount
  useEffect(() => {
    refreshAgenda();
  }, [refreshAgenda]);

  return (
    <AgendaContext.Provider
      value={{
        agenda,
        loading,
        error,
        loadAgendaAttendances,
        refreshAgenda,
        removePatientFromAgenda,
        addPatientToAgenda,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};

export function useAgenda() {
  const context = useContext(AgendaContext);
  if (!context)
    throw new Error("useAgenda must be used within an AgendaProvider");
  return context;
}
