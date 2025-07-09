"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockPatients } from "@/services/mockData";
import { Patient } from "@/types/patient";

interface PatientsContextProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientsContext = createContext<PatientsContextProps | undefined>(
  undefined
);

export const PatientsProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  return (
    <PatientsContext.Provider value={{ patients, setPatients }}>
      {children}
    </PatientsContext.Provider>
  );
};

export function usePatients() {
  const context = useContext(PatientsContext);
  if (!context)
    throw new Error("usePatients must be used within a PatientsProvider");
  return context;
}
