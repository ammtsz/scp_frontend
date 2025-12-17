import {
  convertToPatient,
  generatePatientSummary,
  getPriorityLabel,
  getTreatmentStatusLabel,
  getAttendanceTypeLabel,
  getStatusLabel,
  validatePatientData,
  calculateAge,
  formatPatientForDisplay,
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

  describe("validatePatientData", () => {
    it("should validate correct patient data", () => {
      const result = validatePatientData({
        name: "João Silva",
        phone: "11999999999",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject empty name", () => {
      const result = validatePatientData({
        name: "",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });

    it("should reject name with only whitespace", () => {
      const result = validatePatientData({
        name: "   ",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Name is required");
    });

    it("should reject name too short", () => {
      const result = validatePatientData({
        name: "J",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Name must be at least 2 characters long");
    });

    it("should accept valid phone number", () => {
      const result = validatePatientData({
        name: "João Silva",
        phone: "11999999999",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid phone number", () => {
      const result = validatePatientData({
        name: "João Silva",
        phone: "123",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Phone number must be 10-15 digits");
    });

    it("should accept phone with formatting characters", () => {
      const result = validatePatientData({
        name: "João Silva",
        phone: "(11) 99999-9999",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(true);
    });

    it("should allow empty phone", () => {
      const result = validatePatientData({
        name: "João Silva",
        birthDate: new Date("1990-01-01"),
      });
      
      expect(result.isValid).toBe(true);
    });

    it("should reject future birth date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const result = validatePatientData({
        name: "João Silva",
        birthDate: futureDate,
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Birth date cannot be in the future");
    });

    it("should reject birth date too far in past", () => {
      const ancientDate = new Date();
      ancientDate.setFullYear(ancientDate.getFullYear() - 150);
      
      const result = validatePatientData({
        name: "João Silva",
        birthDate: ancientDate,
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Birth date is too far in the past");
    });

    it("should accumulate multiple errors", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const result = validatePatientData({
        name: "",
        phone: "123",
        birthDate: futureDate,
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain("Name is required");
      expect(result.errors).toContain("Phone number must be 10-15 digits");
      expect(result.errors).toContain("Birth date cannot be in the future");
    });
  });

  describe("calculateAge", () => {
    beforeEach(() => {
      // Mock current date to November 28, 2025 for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-28T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should calculate age correctly", () => {
      const birthDate = new Date("1990-01-01");
      const age = calculateAge(birthDate);
      expect(age).toBe(35);
    });

    it("should handle birthday not yet reached this year", () => {
      const birthDate = new Date("1990-12-01");
      const age = calculateAge(birthDate);
      expect(age).toBe(34); // Birthday hasn't occurred yet in 2025
    });

    it("should handle birthday already passed this year", () => {
      const birthDate = new Date("1990-06-15");
      const age = calculateAge(birthDate);
      expect(age).toBe(35); // Birthday already occurred in 2025
    });

    it("should handle same month, day not reached", () => {
      const birthDate = new Date("1990-11-30"); // Same month but day 30, current is 28
      const age = calculateAge(birthDate);
      expect(age).toBe(34); // Day hasn't been reached yet
    });

    it("should handle same month, day reached", () => {
      const birthDate = new Date("1990-11-15"); // Same month but day 15, current is 28  
      const age = calculateAge(birthDate);
      expect(age).toBe(35); // Day already passed
    });
  });

  describe("formatPatientForDisplay", () => {
    it("should format patient data for display", () => {
      const patient: Patient = {
        ...mockPatient,
        phone: "11999999999",
        birthDate: new Date("1990-01-01"),
      };

      const result = formatPatientForDisplay(patient);
      
      expect(result.formattedPhone).toBe("(11) 99999-9999");
      // Check that the date is formatted as Brazilian DD/MM/YYYY but allow for timezone differences
      expect(result.formattedBirthDate).toMatch(/^\d{2}\/\d{2}\/19\d{2}$/); // Format: DD/MM/19XX
      expect(result.age).toBe(35); // Based on mocked current date
      expect(result.name).toBe("João Silva");
      expect(result.id).toBe("1");
    });

    it("should handle missing phone number", () => {
      const patient: Patient = {
        ...mockPatient,
        phone: "",
        birthDate: new Date("1990-01-01"),
      };

      const result = formatPatientForDisplay(patient);
      
      expect(result.formattedPhone).toBe("N/A");
    });

    it("should handle undefined phone number", () => {
      const patient: Patient = {
        ...mockPatient,
        phone: null as unknown as string, // Simulate undefined/null phone
        birthDate: new Date("1990-01-01"),
      };

      const result = formatPatientForDisplay(patient);
      
      expect(result.formattedPhone).toBe("N/A");
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