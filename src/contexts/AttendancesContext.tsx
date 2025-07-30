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
} from "@/api/attendances";
import { transformAttendanceWithPatientByDate } from "@/utils/apiTransformers";
import { IAttendanceByDate } from "@/types/globals";
import { AttendanceStatus } from "@/api/types";

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

  // Simple function without useCallback to avoid dependency issues
  const loadAttendancesByDate = async (
    date: string
  ): Promise<IAttendanceByDate | null> => {
    try {
      setDataLoading(true);
      setError(null);

      const result = await getAttendancesByDate(date);

      if (result.success && result.value) {
        // Transform the data with patient information
        const attendancesByDateMapped = transformAttendanceWithPatientByDate(
          result.value,
          date
        );
        console.log({
          attendancesApi: result.value,
          attendancesMapped: attendancesByDateMapped,
        });

        // Always update the current attendances
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
  };

  const refreshCurrentDate = async () => {
    await loadAttendancesByDate(selectedDate);
  };

  const initializeSelectedDate = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getNextAttendanceDate();
      if (result.success && result.value?.next_date) {
        const nextDate = result.value.next_date;
        setSelectedDate(nextDate);
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

  useEffect(() => {
    initializeSelectedDate();
  }, [initializeSelectedDate]);

  useEffect(() => {
    if (selectedDate) {
      loadAttendancesByDate(selectedDate);
    }
  }, [selectedDate]);

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
