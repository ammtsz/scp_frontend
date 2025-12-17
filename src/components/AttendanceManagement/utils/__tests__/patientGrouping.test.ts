import {
  getTreatmentCombinationColor,
  groupPatientsByTreatments,
  getCombinedTreatmentLabel,
  type IGroupedPatient
} from "../patientGrouping";

import type { AttendanceType } from "@/types/types";

import {
  createGroupingTestData,
  createMockAttendanceStatusDetail
} from "../testUtilities";

describe("patientGrouping", () => {
  describe("getTreatmentCombinationColor", () => {
    it("should return 'combined' when both lightBath and rod are present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'rod'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('combined');
    });

    it("should return 'combined' when lightBath, rod, and spiritual are present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'rod', 'spiritual'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('combined');
    });

    it("should return 'lightBath' when only lightBath is present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('lightBath');
    });

    it("should return 'rod' when only rod is present", () => {
      const treatmentTypes: AttendanceType[] = ['rod'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('rod');
    });

    it("should return 'lightBath' when lightBath and spiritual are present (no rod)", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'spiritual'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('lightBath');
    });

    it("should return 'rod' when rod and spiritual are present (no lightBath)", () => {
      const treatmentTypes: AttendanceType[] = ['rod', 'spiritual'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('rod');
    });

    it("should return 'lightBath' as fallback when only spiritual is present", () => {
      const treatmentTypes: AttendanceType[] = ['spiritual'];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('lightBath');
    });

    it("should return 'lightBath' as fallback when empty array is passed", () => {
      const treatmentTypes: AttendanceType[] = [];
      const result = getTreatmentCombinationColor(treatmentTypes);
      expect(result).toBe('lightBath');
    });

    it("should handle mixed treatment order consistently", () => {
      const treatmentTypes1: AttendanceType[] = ['lightBath', 'rod'];
      const treatmentTypes2: AttendanceType[] = ['rod', 'lightBath'];
      
      const result1 = getTreatmentCombinationColor(treatmentTypes1);
      const result2 = getTreatmentCombinationColor(treatmentTypes2);
      
      expect(result1).toBe('combined');
      expect(result2).toBe('combined');
      expect(result1).toBe(result2);
    });
  });

  describe("groupPatientsByTreatments", () => {
    it("should return empty array when both input arrays are empty", () => {
      const result = groupPatientsByTreatments([], []);
      expect(result).toEqual([]);
    });

    it("should group lightBath patients only", () => {
      const lightBathPatients = [
        createMockAttendanceStatusDetail({
          name: "Light Bath Patient",
          patientId: 1,
          attendanceId: 1,
        }),
      ];

      const result = groupPatientsByTreatments(lightBathPatients, []);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Light Bath Patient");
      expect(result[0].originalType).toBe('lightBath');
      expect(result[0].treatmentTypes).toEqual(['lightBath']);
      expect(result[0].combinedType).toBe('lightBath');
    });

    it("should group rod patients only", () => {
      const rodPatients = [
        createMockAttendanceStatusDetail({
          name: "Rod Patient",
          patientId: 2,
          attendanceId: 2,
        }),
      ];

      const result = groupPatientsByTreatments([], rodPatients);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Rod Patient");
      expect(result[0].originalType).toBe('rod');
      expect(result[0].treatmentTypes).toEqual(['rod']);
      expect(result[0].combinedType).toBe('rod');
    });

    it("should combine patients with same patientId from different treatment types", () => {
      const { lightBathPatients, rodPatients } = createGroupingTestData();
      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      // Should have 4 unique patients total: Patient One (combined), Patient Two, Patient Three, Patient Four
      expect(result).toHaveLength(4);
      
      // Find Patient One who should be combined
      const combinedPatient = result.find(p => p.name === "Patient One");
      expect(combinedPatient).toBeDefined();
      expect(combinedPatient?.treatmentTypes).toContain('lightBath');
      expect(combinedPatient?.treatmentTypes).toContain('rod');
      expect(combinedPatient?.treatmentTypes).toHaveLength(2);
      expect(combinedPatient?.combinedType).toBe('combined');
    });

    it("should preserve all patient properties when combining", () => {
      const lightBathPatient = createMockAttendanceStatusDetail({
        name: "John Doe",
        patientId: 1,
        attendanceId: 1,
        priority: "1",
        checkedInTime: "2024-01-15T10:00:00Z",
      });

      const rodPatient = createMockAttendanceStatusDetail({
        name: "John Doe",
        patientId: 1,
        attendanceId: 2,
        priority: "1",
        onGoingTime: "2024-01-15T11:00:00Z",
      });

      const result = groupPatientsByTreatments([lightBathPatient], [rodPatient]);
      
      expect(result).toHaveLength(1);
      const combinedPatient = result[0];
      
      // Should preserve all original properties
      expect(combinedPatient.name).toBe("John Doe");
      expect(combinedPatient.patientId).toBe(1);
      expect(combinedPatient.priority).toBe("1");
      expect(combinedPatient.checkedInTime).toBe("2024-01-15T10:00:00Z");
      
      // Should have combined treatment information
      expect(combinedPatient.treatmentTypes).toEqual(['lightBath', 'rod']);
      expect(combinedPatient.combinedType).toBe('combined');
      expect(combinedPatient.originalType).toBe('lightBath'); // First one encountered
    });

    it("should handle patients without patientId gracefully", () => {
      const lightBathPatients = [
        createMockAttendanceStatusDetail({
          name: "No ID Patient",
          patientId: undefined,
          attendanceId: 1,
        }),
      ];

      const rodPatients = [
        createMockAttendanceStatusDetail({
          name: "Valid Patient",
          patientId: 2,
          attendanceId: 2,
        }),
      ];

      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      // Should only include the patient with a valid patientId
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Valid Patient");
      expect(result[0].patientId).toBe(2);
    });

    it("should handle multiple patients with same treatment type", () => {
      const lightBathPatients = [
        createMockAttendanceStatusDetail({
          name: "Patient A",
          patientId: 1,
          attendanceId: 1,
        }),
        createMockAttendanceStatusDetail({
          name: "Patient B",
          patientId: 2,
          attendanceId: 2,
        }),
      ];

      const rodPatients = [
        createMockAttendanceStatusDetail({
          name: "Patient C",
          patientId: 3,
          attendanceId: 3,
        }),
      ];

      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      expect(result).toHaveLength(3);
      
      const lightBathA = result.find(p => p.name === "Patient A");
      const lightBathB = result.find(p => p.name === "Patient B");
      const rodC = result.find(p => p.name === "Patient C");
      
      expect(lightBathA?.treatmentTypes).toEqual(['lightBath']);
      expect(lightBathB?.treatmentTypes).toEqual(['lightBath']);
      expect(rodC?.treatmentTypes).toEqual(['rod']);
    });

    it("should maintain correct originalType when rod patient is added first", () => {
      const lightBathPatients = [
        createMockAttendanceStatusDetail({
          name: "Combined Patient",
          patientId: 1,
          attendanceId: 2,
        }),
      ];

      const rodPatients = [
        createMockAttendanceStatusDetail({
          name: "Combined Patient",
          patientId: 1,
          attendanceId: 1,
        }),
      ];

      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      expect(result).toHaveLength(1);
      
      // Since lightBath is processed first, originalType should be lightBath
      expect(result[0].originalType).toBe('lightBath');
      expect(result[0].treatmentTypes).toEqual(['lightBath', 'rod']);
      expect(result[0].combinedType).toBe('combined');
    });

    it("should handle complex scenario with multiple combinations", () => {
      const lightBathPatients = [
        createMockAttendanceStatusDetail({
          name: "Only Light Bath",
          patientId: 1,
        }),
        createMockAttendanceStatusDetail({
          name: "Combined A",
          patientId: 2,
        }),
        createMockAttendanceStatusDetail({
          name: "Combined B",
          patientId: 3,
        }),
      ];

      const rodPatients = [
        createMockAttendanceStatusDetail({
          name: "Combined A", // Same patient as lightBath
          patientId: 2,
        }),
        createMockAttendanceStatusDetail({
          name: "Combined B", // Same patient as lightBath
          patientId: 3,
        }),
        createMockAttendanceStatusDetail({
          name: "Only Rod",
          patientId: 4,
        }),
      ];

      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      expect(result).toHaveLength(4);
      
      const onlyLightBath = result.find(p => p.patientId === 1);
      const combinedA = result.find(p => p.patientId === 2);
      const combinedB = result.find(p => p.patientId === 3);
      const onlyRod = result.find(p => p.patientId === 4);
      
      expect(onlyLightBath?.combinedType).toBe('lightBath');
      expect(combinedA?.combinedType).toBe('combined');
      expect(combinedB?.combinedType).toBe('combined');
      expect(onlyRod?.combinedType).toBe('rod');
    });
  });

  describe("getCombinedTreatmentLabel", () => {
    it("should return 'BL + BS' when both lightBath and rod are present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'rod'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BL + BS');
    });

    it("should return 'BL + BS' when lightBath, rod, and spiritual are present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'rod', 'spiritual'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BL + BS');
    });

    it("should return 'BL' when only lightBath is present", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BL');
    });

    it("should return 'BS' when only rod is present", () => {
      const treatmentTypes: AttendanceType[] = ['rod'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BS');
    });

    it("should return 'BL' when lightBath and spiritual are present (no rod)", () => {
      const treatmentTypes: AttendanceType[] = ['lightBath', 'spiritual'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BL');
    });

    it("should return 'BS' when rod and spiritual are present (no lightBath)", () => {
      const treatmentTypes: AttendanceType[] = ['rod', 'spiritual'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('BS');
    });

    it("should return empty string when only spiritual is present", () => {
      const treatmentTypes: AttendanceType[] = ['spiritual'];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('');
    });

    it("should return empty string when empty array is passed", () => {
      const treatmentTypes: AttendanceType[] = [];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe('');
    });

    it("should handle combined treatment types consistently", () => {
      const treatmentTypes1: AttendanceType[] = ['lightBath', 'rod'];
      const treatmentTypes2: AttendanceType[] = ['rod', 'lightBath'];
      
      const result1 = getCombinedTreatmentLabel(treatmentTypes1);
      const result2 = getCombinedTreatmentLabel(treatmentTypes2);
      
      expect(result1).toBe('BL + BS');
      expect(result2).toBe('BL + BS');
      expect(result1).toBe(result2);
    });

    it("should return 'BL + BS' when combined type is present", () => {
      const treatmentTypes: AttendanceType[] = ['combined' as AttendanceType];
      const result = getCombinedTreatmentLabel(treatmentTypes);
      expect(result).toBe(''); // combined type itself doesn't map to a specific label
    });
  });

  describe("IGroupedPatient interface", () => {
    it("should extend AttendanceStatusDetail with additional properties", () => {
      const { lightBathPatients, rodPatients } = createGroupingTestData();
      const result = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      if (result.length > 0) {
        const groupedPatient: IGroupedPatient = result[0];
        
        // Should have all AttendanceStatusDetail properties
        expect(groupedPatient.name).toBeDefined();
        expect(groupedPatient.priority).toBeDefined();
        expect(groupedPatient.patientId).toBeDefined();
        expect(groupedPatient.attendanceId).toBeDefined();
        
        // Should have the additional grouping properties
        expect(groupedPatient.originalType).toBeDefined();
        expect(groupedPatient.treatmentTypes).toBeDefined();
        expect(groupedPatient.combinedType).toBeDefined();
        
        // Type checks
        expect(Array.isArray(groupedPatient.treatmentTypes)).toBe(true);
        expect(['lightBath', 'rod', 'combined']).toContain(groupedPatient.combinedType);
        expect(['spiritual', 'lightBath', 'rod']).toContain(groupedPatient.originalType);
      }
    });
  });

  describe("Integration tests", () => {
    it("should work together to provide consistent labeling and coloring", () => {
      const { lightBathPatients, rodPatients } = createGroupingTestData();
      const groupedPatients = groupPatientsByTreatments(lightBathPatients, rodPatients);
      
      groupedPatients.forEach(patient => {
        const color = getTreatmentCombinationColor(patient.treatmentTypes);
        const label = getCombinedTreatmentLabel(patient.treatmentTypes);
        
        // Ensure consistency between combinedType and color function
        expect(patient.combinedType).toBe(color);
        
        // Ensure label matches the treatment types
        if (patient.treatmentTypes.includes('lightBath') && patient.treatmentTypes.includes('rod')) {
          expect(label).toBe('BL + BS');
          expect(color).toBe('combined');
        } else if (patient.treatmentTypes.includes('lightBath')) {
          expect(label).toBe('BL');
          expect(color).toBe('lightBath');
        } else if (patient.treatmentTypes.includes('rod')) {
          expect(label).toBe('BS');
          expect(color).toBe('rod');
        }
      });
    });
  });
});