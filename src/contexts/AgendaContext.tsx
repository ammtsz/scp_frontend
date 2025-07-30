"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { getAttendancesForAgenda } from "@/api/attendances";
import { AttendanceAgendaDto } from "@/api/types";

interface AgendaContextProps {
  loadAgendaAttendances: (filters?: {
    status?: string;
    type?: string;
    limit?: number;
  }) => Promise<AttendanceAgendaDto[]>;
}

const AgendaContext = createContext<AgendaContextProps | undefined>(undefined);

export const AgendaProvider = ({ children }: { children: ReactNode }) => {
  const loadAgendaAttendances = useCallback(
    async (filters?: {
      status?: string;
      type?: string;
      limit?: number;
    }): Promise<AttendanceAgendaDto[]> => {
      try {
        const result = await getAttendancesForAgenda(filters);
        if (result.success && result.value) {
          return result.value;
        } else {
          console.error("Failed to load agenda attendances:", result.error);
          return [];
        }
      } catch (error) {
        console.error("Error loading agenda attendances:", error);
        return [];
      }
    },
    []
  );

  return (
    <AgendaContext.Provider
      value={{
        loadAgendaAttendances,
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
