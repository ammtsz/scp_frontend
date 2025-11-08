import {
  convertToPatient,
  generatePatientSummary,
  getPriorityLabel,
  getTreatmentStatusLabel,
  getAttendanceTypeLabel,
  getStatusLabel,
} from "@/utils/patientUtils";
import { PatientResponseDto, AttendanceResponseDto, PatientPriority, TreatmentStatus, AttendanceType, AttendanceStatus } from "@/api/types";
import { Patient } from "@/types/types";

describe("patientUtils", () => {
  const mockPatientDto: PatientResponseDto = {
    id: 1,
    name: "João Silva",
    phone: "11999999999",
    priority: PatientPriority.NORMAL,
    treatment_status: TreatmentStatus.IN_TREATMENT,
    birth_date: "1990-01-01",
    main_complaint: "Dor de cabeça",
    start_date: "2024-01-01",
    discharge_date: undefined,
    missing_appointments_streak: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockPatient: Patient = {
    id: "1",
    name: "João Silva",
    phone: "11999999999",
    priority: PatientPriority.NORMAL,
    status: TreatmentStatus.IN_TREATMENT,
    birthDate: new Date("1990-01-01"),
    mainComplaint: "Dor de cabeça",
    startDate: new Date("2024-01-01"),
    dischargeDate: null,
    timezone: "America/Sao_Paulo",
    nextAttendanceDates: [],
    currentRecommendations: {
      date: new Date(),
      food: "Dieta leve",
      water: "2L/dia",
      ointment: "Pomada test",
      lightBath: true,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 2,
    },
    previousAttendances: [],
  };

  const mockAttendance: AttendanceResponseDto = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: "2024-01-01",
    scheduled_time: "10:00",
    notes: "Primeira consulta",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  describe("convertToPatient", () => {
    it("should return Patient as is if already Patient type", () => {
      const result = convertToPatient(mockPatient);
      expect(result).toBe(mockPatient);
    });

    it("should convert PatientResponseDto to Patient type", () => {
      const result = convertToPatient(mockPatientDto);
      
      expect(result.id).toBe("1");
      expect(result.name).toBe("João Silva");
      expect(result.phone).toBe("11999999999");
      expect(result.priority).toBe(PatientPriority.NORMAL);
      expect(result.status).toBe(TreatmentStatus.IN_TREATMENT);
      expect(result.mainComplaint).toBe("Dor de cabeça");
      expect(result.currentRecommendations).toBeDefined();
      expect(result.previousAttendances).toEqual([]);
    });

    it("should handle missing optional fields in DTO", () => {
      const dtoWithoutOptionals: PatientResponseDto = {
        ...mockPatientDto,
        phone: undefined,
        birth_date: undefined,
        main_complaint: undefined,
        discharge_date: undefined,
      };

      const result = convertToPatient(dtoWithoutOptionals);
      
      expect(result.phone).toBe("");
      expect(result.mainComplaint).toBe("");
      expect(result.dischargeDate).toBeNull();
    });
  });

  describe("generatePatientSummary", () => {
    it("should generate summary for PatientResponseDto", () => {
      const summary = generatePatientSummary(mockPatientDto, mockAttendance);
      
      expect(summary).toContain("RESUMO DO PACIENTE");
      expect(summary).toContain("João Silva");
      expect(summary).toContain("Padrão (3)");
      expect(summary).toContain("Em Tratamento");
      expect(summary).toContain("Consulta Espiritual");
      expect(summary).toContain("Agendado");
    });

    it("should generate summary for Patient type", () => {
      const summary = generatePatientSummary(mockPatient);
      
      expect(summary).toContain("RESUMO DO PACIENTE");
      expect(summary).toContain("João Silva");
      expect(summary).toContain("Padrão (3)");
      expect(summary).toContain("Nenhum atendimento registrado");
    });

    it("should handle patient without attendance", () => {
      const summary = generatePatientSummary(mockPatientDto);
      
      expect(summary).toContain("Nenhum atendimento registrado");
    });
  });

  describe("label functions", () => {
    describe("getPriorityLabel", () => {
      it("should return correct priority labels", () => {
        expect(getPriorityLabel("1")).toBe("Exceção (1)");
        expect(getPriorityLabel("2")).toBe("Idoso/crianças (2)");
        expect(getPriorityLabel("3")).toBe("Padrão (3)");
        expect(getPriorityLabel("unknown")).toBe("unknown");
      });
    });

    describe("getTreatmentStatusLabel", () => {
      it("should return correct treatment status labels", () => {
        expect(getTreatmentStatusLabel("N")).toBe("Novo Paciente");
        expect(getTreatmentStatusLabel("T")).toBe("Em Tratamento");
        expect(getTreatmentStatusLabel("A")).toBe("Alta");
        expect(getTreatmentStatusLabel("F")).toBe("Ausente");
        expect(getTreatmentStatusLabel("unknown")).toBe("unknown");
      });
    });

    describe("getAttendanceTypeLabel", () => {
      it("should return correct attendance type labels", () => {
        expect(getAttendanceTypeLabel("spiritual")).toBe("Consulta Espiritual");
        expect(getAttendanceTypeLabel("light_bath")).toBe("Banho de Luz");
        expect(getAttendanceTypeLabel("rod")).toBe("Bastão");
        expect(getAttendanceTypeLabel("unknown")).toBe("unknown");
      });
    });

    describe("getStatusLabel", () => {
      it("should return correct status labels", () => {
        expect(getStatusLabel("scheduled")).toBe("Agendado");
        expect(getStatusLabel("checked_in")).toBe("Check-in Realizado");
        expect(getStatusLabel("in_progress")).toBe("Em Atendimento");
        expect(getStatusLabel("completed")).toBe("Concluído");
        expect(getStatusLabel("cancelled")).toBe("Cancelado");
        expect(getStatusLabel("missed")).toBe("Perdido");
        expect(getStatusLabel("unknown")).toBe("unknown");
      });
    });
  });
});