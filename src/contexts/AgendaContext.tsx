"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockAgenda } from "@/api/mockData";
import { IAgenda } from "@/types/globals";

interface AgendaContextProps {
  agenda: IAgenda;
  setAgenda: React.Dispatch<React.SetStateAction<IAgenda>>;
}

const AgendaContext = createContext<AgendaContextProps | undefined>(undefined);

export const AgendaProvider = ({ children }: { children: ReactNode }) => {
  const [agenda, setAgenda] = useState<IAgenda>(mockAgenda);
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
