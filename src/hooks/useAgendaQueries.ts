/**
 * Agenda React Query Hooks
 * 
 * Server state management for agenda data using React Query.
 * This replaces the server state portion of AgendaContext.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttendancesForAgenda,
  deleteAttendance,
  createAttendance,
} from '@/api/attendances';
import {
  AttendanceAgendaDto,
  AttendanceType,
  CreateAttendanceRequest,
} from '@/api/types';
import { Agenda, CalendarAgenda, Priority } from '@/types/types';
import { transformAttendanceType } from '@/utils/apiTransformers';

// Transform backend data to frontend agenda format
const transformToAgenda = (
  attendances: AttendanceAgendaDto[]
): CalendarAgenda => {
  const spiritual: Agenda["spiritual"] = [];
  const lightBath: Agenda["lightBath"] = [];

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
      priority: attendance.patient_priority as Priority,
      attendanceId: attendance.id,
      type: attendance.type,
    });
    return acc;
  }, {} as Record<string, Record<string, Array<{ id: string; name: string; priority: Priority; attendanceId: number; type: AttendanceType }>>>);

  // Convert grouped data to frontend format
  Object.entries(grouped.spiritual || {}).forEach(([date, patients]) => {
    spiritual.push({
      date: new Date(date + "T00:00:00"),
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
      date: new Date(date + "T00:00:00"),
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

// Query Keys
const agendaKeys = {
  all: ['agenda'] as const,
  lists: () => [...agendaKeys.all, 'list'] as const,
  list: (filters?: { status?: string; type?: string; limit?: number }) => 
    [...agendaKeys.lists(), filters] as const,
} as const;

/**
 * Hook to fetch agenda attendences with optional filters
 */
export const useAgendaAttendances = (filters?: {
  status?: string;
  type?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: agendaKeys.list(filters),
    queryFn: async (): Promise<AttendanceAgendaDto[]> => {
      const result = await getAttendancesForAgenda(filters);
      if (result.success && result.value) {
        return result.value;
      } else {
        throw new Error(result.error || "Erro ao carregar agenda");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch transformed agenda data (calendar format)
 */
export const useAgenda = (filters?: {
  status?: string;
  type?: string;
  limit?: number;
}) => {
  const query = useAgendaAttendances(filters);
  
  return {
    ...query,
    data: query.data ? transformToAgenda(query.data) : undefined,
    agenda: query.data ? transformToAgenda(query.data) : { spiritual: [], lightBath: [] },
  };
};

/**
 * Hook to fetch scheduled agenda attendances (most common use case)
 */
export const useScheduledAgenda = () => {
  return useAgenda({ status: "scheduled" });
};

/**
 * Mutation to remove patient from agenda
 */
export const useRemovePatientFromAgenda = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceId: number) => {
      const result = await deleteAttendance(attendanceId.toString());
      if (result.success) {
        return result.value;
      } else {
        throw new Error(result.error || "Failed to remove patient from agenda");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch agenda queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
    onError: (error) => {
      console.error("Error removing patient from agenda:", error);
    },
  });
};

/**
 * Mutation to add patient to agenda
 */
export const useAddPatientToAgenda = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceData: CreateAttendanceRequest) => {
      const result = await createAttendance(attendanceData);
      if (result.success) {
        return result.value;
      } else {
        throw new Error(result.error || "Failed to add patient to agenda");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch agenda queries
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
    },
    onError: (error) => {
      console.error("Error adding patient to agenda:", error);
    },
  });
};

/**
 * Utility hook for manual agenda refresh
 */
export const useRefreshAgenda = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: agendaKeys.all });
  };
};