"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockAgenda } from "@/services/mockData";
import { AgendaItem } from "@/types/agenda";

interface AgendaContextProps {
  agenda: AgendaItem[];
  setAgenda: React.Dispatch<React.SetStateAction<AgendaItem[]>>;
}

const AgendaContext = createContext<AgendaContextProps | undefined>(undefined);

export const AgendaProvider = ({ children }: { children: ReactNode }) => {
  const [agenda, setAgenda] = useState<AgendaItem[]>(mockAgenda);
  return (
    <AgendaContext.Provider value={{ agenda, setAgenda }}>
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
