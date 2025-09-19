"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getTreatmentRecords,
  getTreatmentRecordByAttendance,
  createTreatmentRecord,
  updateTreatmentRecord,
  deleteTreatmentRecord,
} from "@/api/treatment-records";
import type {
  TreatmentRecordResponseDto,
  CreateTreatmentRecordRequest,
  UpdateTreatmentRecordRequest,
} from "@/api/types";

interface TreatmentRecordsContextType {
  treatmentRecords: TreatmentRecordResponseDto[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshTreatmentRecords: () => Promise<void>;
  getTreatmentRecordForAttendance: (
    attendanceId: number
  ) => Promise<TreatmentRecordResponseDto | null>;
  createRecord: (
    data: CreateTreatmentRecordRequest
  ) => Promise<TreatmentRecordResponseDto | null>;
  updateRecord: (
    id: number,
    data: UpdateTreatmentRecordRequest
  ) => Promise<TreatmentRecordResponseDto | null>;
  deleteRecord: (id: number) => Promise<boolean>;
}

const TreatmentRecordsContext = createContext<
  TreatmentRecordsContextType | undefined
>(undefined);

export const useTreatmentRecords = () => {
  const context = useContext(TreatmentRecordsContext);
  if (!context) {
    throw new Error(
      "useTreatmentRecords must be used within TreatmentRecordsProvider"
    );
  }
  return context;
};

interface TreatmentRecordsProviderProps {
  children: React.ReactNode;
}

export const TreatmentRecordsProvider: React.FC<
  TreatmentRecordsProviderProps
> = ({ children }) => {
  const [treatmentRecords, setTreatmentRecords] = useState<
    TreatmentRecordResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTreatmentRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTreatmentRecords();
      if (result.success && result.value) {
        setTreatmentRecords(result.value);
      } else {
        setError(result.error || "Failed to load treatment records");
      }
    } catch (err) {
      setError("Failed to load treatment records");
      console.error("Error refreshing treatment records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTreatmentRecordForAttendance = useCallback(
    async (
      attendanceId: number
    ): Promise<TreatmentRecordResponseDto | null> => {
      try {
        const result = await getTreatmentRecordByAttendance(
          attendanceId.toString()
        );
        if (result.success && result.value) {
          return result.value;
        } else {
          console.log(
            `No treatment record found for attendance ${attendanceId}`
          );
          return null;
        }
      } catch (err) {
        console.error("Error fetching treatment record:", err);
        return null;
      }
    },
    []
  );

  const createRecord = useCallback(
    async (
      data: CreateTreatmentRecordRequest
    ): Promise<TreatmentRecordResponseDto | null> => {
      setError(null);

      try {
        const result = await createTreatmentRecord(data);
        if (result.success && result.value) {
          setTreatmentRecords((prev) => [...prev, result.value!.record]);
          return result.value.record;
        } else {
          setError(result.error || "Failed to create treatment record");
          return null;
        }
      } catch (err) {
        setError("Failed to create treatment record");
        console.error("Error creating treatment record:", err);
        return null;
      }
    },
    []
  );

  const updateRecord = useCallback(
    async (
      id: number,
      data: UpdateTreatmentRecordRequest
    ): Promise<TreatmentRecordResponseDto | null> => {
      setError(null);

      try {
        const result = await updateTreatmentRecord(id.toString(), data);
        if (result.success && result.value) {
          setTreatmentRecords((prev) =>
            prev.map((record) => (record.id === id ? result.value! : record))
          );
          return result.value;
        } else {
          setError(result.error || "Failed to update treatment record");
          return null;
        }
      } catch (err) {
        setError("Failed to update treatment record");
        console.error("Error updating treatment record:", err);
        return null;
      }
    },
    []
  );

  const deleteRecord = useCallback(async (id: number): Promise<boolean> => {
    setError(null);

    try {
      const result = await deleteTreatmentRecord(id.toString());
      if (result.success) {
        setTreatmentRecords((prev) =>
          prev.filter((record) => record.id !== id)
        );
        return true;
      } else {
        setError(result.error || "Failed to delete treatment record");
        return false;
      }
    } catch (err) {
      setError("Failed to delete treatment record");
      console.error("Error deleting treatment record:", err);
      return false;
    }
  }, []);

  const value: TreatmentRecordsContextType = {
    treatmentRecords,
    loading,
    error,
    refreshTreatmentRecords,
    getTreatmentRecordForAttendance,
    createRecord,
    updateRecord,
    deleteRecord,
  };

  return (
    <TreatmentRecordsContext.Provider value={value}>
      {children}
    </TreatmentRecordsContext.Provider>
  );
};

export default TreatmentRecordsProvider;
