"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getPatients } from "@/api/patients";
import { transformPatientsFromApi } from "@/utils/apiTransformers";
import { IPatients } from "@/types/globals";

interface PatientsContextProps {
  patients: IPatients[];
  setPatients: React.Dispatch<React.SetStateAction<IPatients[]>>;
  loading: boolean;
  error: string | null;
  refreshPatients: () => Promise<void>;
}

const PatientsContext = createContext<PatientsContextProps | undefined>(
  undefined
);

export const PatientsProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<IPatients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPatients();

      if (result.success && result.value) {
        const transformedPatients = transformPatientsFromApi(result.value);
        setPatients(transformedPatients);
      } else {
        setError(result.error || "Erro desconhecido");
      }
    } catch {
      setError("Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPatients();
  }, []);

  return (
    <PatientsContext.Provider
      value={{ patients, setPatients, loading, error, refreshPatients }}
    >
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
