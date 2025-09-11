"use client";

import React from "react";
import ConfirmModal from "@/components/ConfirmModal/index";
import NewAttendanceFormModal from "@/components/AttendanceManagement/components/NewAttendanceForm/NewAttendanceFormModal";
import Switch from "@/components/Switch";
import AgendaColumn from "./AgendaColumn";
import { useAgendaCalendar } from "./useAgendaCalendar";

const AgendaCalendar: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    showNext5Dates,
    setShowNext5Dates,
    filteredAgenda,
    openSpiritualIdx,
    setOpenSpiritualIdx,
    openLightBathIdx,
    setOpenLightBathIdx,
    confirmRemove,
    setConfirmRemove,
    showNewAttendance,
    setShowNewAttendance,
    handleRemovePatient,
    handleConfirmRemove,
    handleFormSuccess,
    loading,
  } = useAgendaCalendar();

  return (
    <div className="flex flex-col gap-8 my-16">
      {/* Agenda Calendar Management */}
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Agenda de Atendimentos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Visualize e gerencie os agendamentos por data e tipo de
                atendimento
              </p>
            </div>
            <button
              className="button button-primary"
              onClick={() => setShowNewAttendance(true)}
            >
              + Novo Agendamento
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Date input with label */}
          <div className="mb-6">
            <label
              htmlFor="agenda-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Selecione uma data para filtrar
            </label>
            <div className="flex gap-2">
              <input
                id="agenda-date"
                type="date"
                className="input h-11 flex-1"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                lang="pt-BR"
              />
              <button
                type="button"
                className="button button-outline card-shadow"
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setSelectedDate(today);
                }}
              >
                Hoje
              </button>
            </div>
          </div>

          {/* Date Range Filter Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs">
                  {selectedDate
                    ? !showNext5Dates
                      ? `Próximas 5 datas a partir de ${new Date(
                          selectedDate + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}`
                      : `Todos os atendimentos a partir de ${new Date(
                          selectedDate + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}`
                    : !showNext5Dates
                    ? "Mostrando próximas 5 datas"
                    : "Mostrando todos os atendimentos futuros"}
                  <Switch
                    checked={showNext5Dates}
                    onChange={(checked) => setShowNext5Dates(checked)}
                    label="Mostrar todos os atendimentos futuros"
                    size="sm"
                    id="date-range-filter"
                    className="text-gray-500 mt-2"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spiritual Attendances Column */}
            <AgendaColumn
              title="Consultas Espirituais"
              agendaItems={filteredAgenda.spiritual.map((item) => ({
                ...item,
                patients: item.patients.map((patient) => ({
                  ...patient,
                  attendanceType: patient.attendanceType ?? "spiritual",
                })),
              }))}
              openAgendaIdx={openSpiritualIdx}
              setOpenAgendaIdx={setOpenSpiritualIdx}
              onRemovePatient={handleRemovePatient}
              columnType="spiritual"
              isLoading={loading}
            />

            {/* Light Bath / Rod Attendances Column */}
            <AgendaColumn
              title="Banhos de Luz / Bastão"
              agendaItems={filteredAgenda.lightBath.map((item) => ({
                ...item,
                patients: item.patients.map((patient) => ({
                  ...patient,
                  attendanceType: patient.attendanceType ?? "lightBath",
                })),
              }))}
              openAgendaIdx={openLightBathIdx}
              setOpenAgendaIdx={setOpenLightBathIdx}
              onRemovePatient={handleRemovePatient}
              columnType="lightBath"
              isLoading={loading}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmRemove}
        title="Remover paciente"
        message={
          confirmRemove && (
            <span>
              Tem certeza que deseja remover{" "}
              <span className="text-red-600">{confirmRemove.name}</span> da
              lista?
            </span>
          )
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onCancel={() => setConfirmRemove(null)}
        onConfirm={handleConfirmRemove}
      />
      {showNewAttendance && (
        <NewAttendanceFormModal
          onClose={() => setShowNewAttendance(false)}
          onSuccess={handleFormSuccess}
          title="Novo Agendamento"
          subtitle="Agendar atendimento para paciente"
          showDateField={true}
          validationDate={
            selectedDate || new Date().toISOString().split("T")[0]
          }
        />
      )}
    </div>
  );
};

export default AgendaCalendar;
