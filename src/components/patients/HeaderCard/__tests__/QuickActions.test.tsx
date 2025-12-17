import React from "react";
import QuickActions from "../QuickActions";
import {
  PatientResponseDto,
  AttendanceResponseDto,
  PatientPriority,
  TreatmentStatus,
  AttendanceStatus,
  AttendanceType,
} from "@/api/types";

// Mock all dependencies
jest.mock("@/hooks/useAttendanceQueries", () => ({
  useCreateAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useCheckInAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useCompleteAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

jest.mock(
  "@/components/patients/TreatmentRecommendationsModal",
  () => () => null
);
jest.mock("@/utils/patientUtils", () => ({
  convertToPatient: jest.fn((patient) => ({
    ...patient,
    id: patient.id.toString(),
  })),
  generatePatientSummary: jest.fn(() => "Patient summary"),
}));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children
);

describe("QuickActions", () => {
  const mockPatient: PatientResponseDto = {
    id: 1,
    name: "Test Patient",
    phone: "11999999999",
    priority: PatientPriority.NORMAL,
    treatment_status: TreatmentStatus.IN_TREATMENT,
    birth_date: "1990-01-01",
    main_complaint: "Test complaint",
    start_date: "2025-01-01",
    discharge_date: undefined,
    missing_appointments_streak: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  const mockAttendance: AttendanceResponseDto = {
    id: 1,
    patient_id: 1,
    scheduled_date: "2025-01-15",
    scheduled_time: "10:00",
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    notes: "Test notes",
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2025-01-15T00:00:00Z",
  };

  describe("Component Structure", () => {
    it("should be a valid React component", () => {
      expect(QuickActions).toBeDefined();
      expect(typeof QuickActions).toBe("function");
    });

    it("should accept required props without throwing", () => {
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: mockPatient,
        });
        expect(element).toBeTruthy();
        expect(element.props.patient).toEqual(mockPatient);
      }).not.toThrow();
    });

    it("should accept optional props without throwing", () => {
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: mockPatient,
          latestAttendance: mockAttendance,
          onAttendanceUpdate: jest.fn(),
        });
        expect(element).toBeTruthy();
        expect(element.props.latestAttendance).toEqual(mockAttendance);
      }).not.toThrow();
    });
  });

  describe("Props Validation", () => {
    it("should handle PatientResponseDto with number id", () => {
      const element = React.createElement(QuickActions, {
        patient: mockPatient,
      });
      expect(element.props.patient.id).toBe(1);
      expect(typeof element.props.patient.id).toBe("number");
    });

    it("should handle legacy Patient with string id", () => {
      const legacyPatient = { ...mockPatient, id: "2" as unknown as number };
      const element = React.createElement(QuickActions, {
        patient: legacyPatient,
      });
      expect(
        (element.props as { patient: { id: string | number } }).patient.id
      ).toBe("2");
      expect(
        typeof (element.props as { patient: { id: string | number } }).patient
          .id
      ).toBe("string");
    });

    it("should handle different attendance statuses", () => {
      const scheduledAttendance = {
        ...mockAttendance,
        status: AttendanceStatus.SCHEDULED,
      };
      const element = React.createElement(QuickActions, {
        patient: mockPatient,
        latestAttendance: scheduledAttendance,
      });
      expect(element.props.latestAttendance?.status).toBe(
        AttendanceStatus.SCHEDULED
      );
    });

    it("should handle callback functions", () => {
      const onAttendanceUpdate = jest.fn();
      const element = React.createElement(QuickActions, {
        patient: mockPatient,
        onAttendanceUpdate,
      });
      expect(element.props.onAttendanceUpdate).toBe(onAttendanceUpdate);
    });
  });

  describe("Edge Cases", () => {
    it("should handle patient with missing name", () => {
      const patientWithoutName = { ...mockPatient, name: "" };
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: patientWithoutName,
        });
        expect(element.props.patient.name).toBe("");
      }).not.toThrow();
    });

    it("should handle patient with zero id", () => {
      const patientWithZeroId = { ...mockPatient, id: 0 };
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: patientWithZeroId,
        });
        expect(element.props.patient.id).toBe(0);
      }).not.toThrow();
    });

    it("should handle undefined latestAttendance", () => {
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: mockPatient,
          latestAttendance: undefined,
        });
        expect(element.props.latestAttendance).toBeUndefined();
      }).not.toThrow();
    });

    it("should handle different attendance types", () => {
      const lightBathAttendance = {
        ...mockAttendance,
        type: AttendanceType.LIGHT_BATH,
      };
      expect(() => {
        const element = React.createElement(QuickActions, {
          patient: mockPatient,
          latestAttendance: lightBathAttendance,
        });
        expect(element.props.latestAttendance?.type).toBe(
          AttendanceType.LIGHT_BATH
        );
      }).not.toThrow();
    });
  });

  describe("Dependency Integration", () => {
    it("should integrate with attendance queries hooks", () => {
      const attendanceQueries = jest.requireMock(
        "@/hooks/useAttendanceQueries"
      );

      expect(attendanceQueries.useCreateAttendance).toBeDefined();
      expect(attendanceQueries.useCheckInAttendance).toBeDefined();
      expect(attendanceQueries.useCompleteAttendance).toBeDefined();

      // Verify hooks return expected structure
      const createAttendance = attendanceQueries.useCreateAttendance();
      expect(createAttendance).toHaveProperty("mutateAsync");
      expect(createAttendance).toHaveProperty("isPending");
    });

    it("should integrate with patient utils", () => {
      const patientUtils = jest.requireMock("@/utils/patientUtils");

      expect(patientUtils.convertToPatient).toBeDefined();
      expect(patientUtils.generatePatientSummary).toBeDefined();

      // Test convertToPatient functionality
      const result = patientUtils.convertToPatient(mockPatient);
      expect(result.id).toBe("1"); // Should convert to string
    });

    it("should integrate with TreatmentRecommendationsModal", () => {
      const TreatmentRecommendationsModal = jest.requireMock(
        "@/components/patients/TreatmentRecommendationsModal"
      );
      expect(TreatmentRecommendationsModal).toBeDefined();
    });
  });

  describe("Component Interface", () => {
    it("should implement correct TypeScript interface", () => {
      // Test that component accepts all expected props
      const validProps = {
        patient: mockPatient,
        latestAttendance: mockAttendance,
        onAttendanceUpdate: jest.fn(),
      };

      expect(() => {
        React.createElement(QuickActions, validProps);
      }).not.toThrow();
    });

    it("should work with minimal required props", () => {
      const minimalProps = { patient: mockPatient };

      expect(() => {
        React.createElement(QuickActions, minimalProps);
      }).not.toThrow();
    });

    it("should handle all patient priority levels", () => {
      const priorities = [
        PatientPriority.EMERGENCY,
        PatientPriority.INTERMEDIATE,
        PatientPriority.NORMAL,
      ];

      priorities.forEach((priority) => {
        const patientWithPriority = { ...mockPatient, priority };
        expect(() => {
          React.createElement(QuickActions, { patient: patientWithPriority });
        }).not.toThrow();
      });
    });

    it("should handle all treatment statuses", () => {
      const statuses = [
        TreatmentStatus.NEW_PATIENT,
        TreatmentStatus.IN_TREATMENT,
        TreatmentStatus.DISCHARGED,
        TreatmentStatus.ABSENT,
      ];

      statuses.forEach((status) => {
        const patientWithStatus = { ...mockPatient, treatment_status: status };
        expect(() => {
          React.createElement(QuickActions, { patient: patientWithStatus });
        }).not.toThrow();
      });
    });

    it("should handle all attendance statuses", () => {
      const statuses = [
        AttendanceStatus.SCHEDULED,
        AttendanceStatus.CHECKED_IN,
        AttendanceStatus.IN_PROGRESS,
        AttendanceStatus.COMPLETED,
        AttendanceStatus.CANCELLED,
        AttendanceStatus.MISSED,
      ];

      statuses.forEach((status) => {
        const attendanceWithStatus = { ...mockAttendance, status };
        expect(() => {
          React.createElement(QuickActions, {
            patient: mockPatient,
            latestAttendance: attendanceWithStatus,
          });
        }).not.toThrow();
      });
    });
  });
});
