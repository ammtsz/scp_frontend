"use client";

import React, { lazy, Suspense } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import Switch from "@/components/common/Switch";
import AgendaColumn from "./AgendaColumn";
import { useAgendaCalendar } from "./useAgendaCalendar";
import LoadingFallback from "@/components/common/LoadingFallback";
import { RefreshCw } from "react-feather";

// Lazy load heavy modal component for better bundle optimization
const NewAttendanceFormModal = lazy(
  () => import("@/components/AgendaCalendar/NewAttendanceFormModal")
);

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
    refreshAgenda,
    isRefreshing,
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
                  const today = new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0];
                  setSelectedDate(today);
                }}
              >
                Hoje
              </button>
            </div>
          </div>

          {/* Date Range Filter Toggle and Refresh Button */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col w-full">
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
                  <div className="flex justify-between items-center gap-4 mt-2 w-full">
                    <Switch
                      checked={showNext5Dates}
                      onChange={(checked) => setShowNext5Dates(checked)}
                      label="Mostrar todos os atendimentos futuros"
                      size="sm"
                      id="date-range-filter"
                      className="text-gray-500"
                    />
                    <button
                      onClick={refreshAgenda}
                      disabled={isRefreshing}
                      className={`button button-outline text-sm px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                        isRefreshing
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
                      type="button"
                      title={
                        isRefreshing
                          ? "Atualizando..."
                          : "Atualizar dados dos agendamentos"
                      }
                    >
                      <RefreshCw
                        size={16}
                        className={`${isRefreshing ? "animate-spin" : ""}`}
                      />
                      {isRefreshing ? "Atualizando..." : "Atualizar"}
                    </button>
                  </div>
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
              isRefreshing={isRefreshing}
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
              isRefreshing={isRefreshing}
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
        <Suspense
          fallback={
            <LoadingFallback
              message="Carregando formulário de agendamento..."
              size="small"
            />
          }
        >
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
        </Suspense>
      )}
    </div>
  );
};

export default AgendaCalendar;
