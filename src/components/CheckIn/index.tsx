import React, { useState } from "react";

const CheckIn: React.FC = () => {
  const [patientId, setPatientId] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to check in patient
    setCheckedIn(true);
  };

  return (
    <form
      className="max-w-md mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]"
      onSubmit={handleCheckIn}
    >
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)] text-center">
        Check-in de Paciente
      </h2>
      <input
        className="input mb-2"
        placeholder="ID do paciente"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        required
      />
      <button type="submit" className="button button-primary">
        Fazer Check-in
      </button>
      {checkedIn && (
        <div className="mt-2 text-green-600">Check-in realizado!</div>
      )}
    </form>
  );
};

export default CheckIn;
