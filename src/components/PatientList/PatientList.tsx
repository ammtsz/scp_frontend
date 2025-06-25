"use client";

import React, { useState, useEffect } from "react";
import { Patient } from "@/types/patient";

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: "1",
    registrationNumber: 1,
    name: "Maria Silva",
    birthDate: "1980-05-10",
    phone: "(11) 91234-5678",
    priority: "N",
    mainComplaint: "Dor de cabeça",
    status: "T",
    spiritualConsultation: {
      startDate: "2024-06-01",
      nextDate: "2024-06-15",
      dischargeDate: "",
      recommendations: {
        food: "",
        water: "",
        ointment: "",
        lightBath: false,
        staff: false,
        spiritualTreatment: false,
        returnWeeks: 2,
      },
    },
    lightBaths: [],
    staffs: [],
    attendances: [],
    history: [],
  },
  // Add more mock patients as needed
];

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Replace with API call
    setPatients(mockPatients);
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Pacientes</h2>
      <input
        className="input input-bordered w-full mb-4"
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="table w-full">
        <thead>
          <tr>
            <th>Registro</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.registrationNumber}</td>
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
