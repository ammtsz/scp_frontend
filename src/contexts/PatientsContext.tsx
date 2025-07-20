"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockPatients } from "@/api/mockData";
import { IPatients } from "@/types/globals";
interface PatientsContextProps {
  patients: IPatients[];
  setPatients: React.Dispatch<React.SetStateAction<IPatients[]>>;
}

const PatientsContext = createContext<PatientsContextProps | undefined>(
  undefined
);

export const PatientsProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<IPatients[]>(mockPatients);
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
