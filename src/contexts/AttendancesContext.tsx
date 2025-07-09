"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockAttendance } from "@/services/mockData";
import { Attendance } from "@/types/attendance";

interface AttendancesContextProps {
  attendances: Attendance[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

const AttendancesContext = createContext<AttendancesContextProps | undefined>(
  undefined
);

export const AttendancesProvider = ({ children }: { children: ReactNode }) => {
  const [attendances, setAttendances] = useState<Attendance[]>(mockAttendance);
  return (
    <AttendancesContext.Provider value={{ attendances, setAttendances }}>
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
