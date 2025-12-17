import {
  getIncompleteAttendances,
  getCompletedAttendances,
  getScheduledAbsences,
  type IAttendanceStatusDetailWithType
} from "../attendanceDataUtils";

import {
  createSampleAttendanceData,
  createEmptyAttendanceData,
  createMockAttendancesByDate,
  createMockAttendanceStatusDetail
} from "../testUtilities";

describe("attendanceDataUtils", () => {
  describe("getIncompleteAttendances", () => {
    it("should return empty array when attendancesByDate is null", () => {
      const result = getIncompleteAttendances(null);
      expect(result).toEqual([]);
    });

    it("should return empty array when attendancesByDate is undefined", () => {
      const result = getIncompleteAttendances(undefined!);
      expect(result).toEqual([]);
    });

    it("should return empty array when no incomplete attendances exist", () => {
      const emptyData = createEmptyAttendanceData();
      const result = getIncompleteAttendances(emptyData);
      expect(result).toEqual([]);
    });

    it("should collect all checkedIn and onGoing attendances from all attendance types", () => {
      const sampleData = createSampleAttendanceData();
      const result = getIncompleteAttendances(sampleData);

      expect(result).toHaveLength(6); // 2 checkedIn + 1 onGoing from each type (spiritual, lightBath, rod)
      
      // Check that all returned items have attendanceType
      result.forEach(attendance => {
        expect(attendance.attendanceType).toBeDefined();
        expect(['spiritual', 'lightBath', 'rod']).toContain(attendance.attendanceType);
      });
    });

    it("should include attendances from spiritual type", () => {
      const sampleData = createSampleAttendanceData();
      const result = getIncompleteAttendances(sampleData);

      const spiritualAttendances = result.filter(a => a.attendanceType === 'spiritual');
      expect(spiritualAttendances).toHaveLength(2); // 1 checkedIn + 1 onGoing
      
      const checkedInSpiritual = spiritualAttendances.find(a => a.checkedInTime);
      const onGoingSpiritual = spiritualAttendances.find(a => a.onGoingTime);
      
      expect(checkedInSpiritual).toBeDefined();
      expect(onGoingSpiritual).toBeDefined();
      expect(checkedInSpiritual?.name).toBe("Jane Smith");
      expect(onGoingSpiritual?.name).toBe("Bob Johnson");
    });

    it("should include attendances from lightBath type", () => {
      const sampleData = createSampleAttendanceData();
      const result = getIncompleteAttendances(sampleData);

      const lightBathAttendances = result.filter(a => a.attendanceType === 'lightBath');
      expect(lightBathAttendances).toHaveLength(2); // 1 checkedIn + 1 onGoing
      
      const checkedInLightBath = lightBathAttendances.find(a => a.checkedInTime);
      const onGoingLightBath = lightBathAttendances.find(a => a.onGoingTime);
      
      expect(checkedInLightBath).toBeDefined();
      expect(onGoingLightBath).toBeDefined();
      expect(checkedInLightBath?.name).toBe("Light Bath Checked In");
      expect(onGoingLightBath?.name).toBe("Light Bath Ongoing");
    });

    it("should include attendances from rod type", () => {
      const sampleData = createSampleAttendanceData();
      const result = getIncompleteAttendances(sampleData);

      const rodAttendances = result.filter(a => a.attendanceType === 'rod');
      expect(rodAttendances).toHaveLength(2); // 1 checkedIn + 1 onGoing
      
      const checkedInRod = rodAttendances.find(a => a.checkedInTime);
      const onGoingRod = rodAttendances.find(a => a.onGoingTime);
      
      expect(checkedInRod).toBeDefined();
      expect(onGoingRod).toBeDefined();
      expect(checkedInRod?.name).toBe("Rod Checked In");
      expect(onGoingRod?.name).toBe("Rod Ongoing");
    });

    it("should not include scheduled or completed attendances", () => {
      const sampleData = createSampleAttendanceData();
      const result = getIncompleteAttendances(sampleData);

      // Should not include any scheduled or completed attendances
      const scheduledAttendances = result.filter(a => !a.checkedInTime && !a.onGoingTime);
      const completedAttendances = result.filter(a => a.completedTime);
      
      expect(scheduledAttendances).toHaveLength(0);
      expect(completedAttendances).toHaveLength(0);
    });

    it("should handle mixed data with some empty attendance types", () => {
      const mixedData = createMockAttendancesByDate({
        spiritual: {
          scheduled: [],
          checkedIn: [createMockAttendanceStatusDetail({ name: "Spiritual Checked In" })],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [createMockAttendanceStatusDetail({ name: "Rod Ongoing" })],
          completed: [],
        },
      });

      const result = getIncompleteAttendances(mixedData);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Spiritual Checked In");
      expect(result[0].attendanceType).toBe("spiritual");
      expect(result[1].name).toBe("Rod Ongoing");
      expect(result[1].attendanceType).toBe("rod");
    });

    it("should handle attendance types with non-array status data gracefully", () => {
      // Type assertion is needed here to test malformed data handling
      const malformedData = {
        date: new Date(),
        spiritual: {
          scheduled: [],
          checkedIn: "not-an-array" as unknown,
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        combined: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      } as Parameters<typeof getIncompleteAttendances>[0];

      const result = getIncompleteAttendances(malformedData);
      expect(result).toEqual([]);
    });
  });

  describe("getCompletedAttendances", () => {
    it("should return empty array when attendancesByDate is null", () => {
      const result = getCompletedAttendances(null);
      expect(result).toEqual([]);
    });

    it("should return empty array when attendancesByDate is undefined", () => {
      const result = getCompletedAttendances(undefined!);
      expect(result).toEqual([]);
    });

    it("should return empty array when no completed attendances exist", () => {
      const emptyData = createEmptyAttendanceData();
      const result = getCompletedAttendances(emptyData);
      expect(result).toEqual([]);
    });

    it("should collect all completed attendances from all attendance types", () => {
      const sampleData = createSampleAttendanceData();
      const result = getCompletedAttendances(sampleData);

      expect(result).toHaveLength(3); // 1 completed from each type (spiritual, lightBath, rod)
      
      // Check that all returned items have attendanceType
      result.forEach(attendance => {
        expect(attendance.attendanceType).toBeDefined();
        expect(['spiritual', 'lightBath', 'rod']).toContain(attendance.attendanceType);
        expect(attendance.completedTime).toBeDefined();
      });
    });

    it("should include completed attendances from all types", () => {
      const sampleData = createSampleAttendanceData();
      const result = getCompletedAttendances(sampleData);

      const spiritualCompleted = result.find(a => a.attendanceType === 'spiritual');
      const lightBathCompleted = result.find(a => a.attendanceType === 'lightBath');
      const rodCompleted = result.find(a => a.attendanceType === 'rod');
      
      expect(spiritualCompleted?.name).toBe("Alice Wilson");
      expect(lightBathCompleted?.name).toBe("Light Bath Completed");
      expect(rodCompleted?.name).toBe("Rod Completed");
    });

    it("should not include scheduled, checkedIn, or onGoing attendances", () => {
      const sampleData = createSampleAttendanceData();
      const result = getCompletedAttendances(sampleData);

      // All results should have completedTime
      result.forEach(attendance => {
        expect(attendance.completedTime).toBeDefined();
      });
    });

    it("should handle mixed data with some empty attendance types", () => {
      const mixedData = createMockAttendancesByDate({
        spiritual: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [createMockAttendanceStatusDetail({ 
            name: "Spiritual Completed", 
            completedTime: "2024-01-15T12:00:00Z" 
          })],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      });

      const result = getCompletedAttendances(mixedData);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Spiritual Completed");
      expect(result[0].attendanceType).toBe("spiritual");
    });
  });

  describe("getScheduledAbsences", () => {
    it("should return empty array when attendancesByDate is null", () => {
      const result = getScheduledAbsences(null);
      expect(result).toEqual([]);
    });

    it("should return empty array when attendancesByDate is undefined", () => {
      const result = getScheduledAbsences(undefined!);
      expect(result).toEqual([]);
    });

    it("should return empty array when no scheduled attendances exist", () => {
      const emptyData = createEmptyAttendanceData();
      const result = getScheduledAbsences(emptyData);
      expect(result).toEqual([]);
    });

    it("should collect all scheduled attendances from all attendance types", () => {
      const sampleData = createSampleAttendanceData();
      const result = getScheduledAbsences(sampleData);

      expect(result).toHaveLength(3); // 1 scheduled from each type (spiritual, lightBath, rod)
      
      // Check that all returned items have attendanceType
      result.forEach(attendance => {
        expect(attendance.attendanceType).toBeDefined();
        expect(['spiritual', 'lightBath', 'rod']).toContain(attendance.attendanceType);
      });
    });

    it("should include scheduled attendances from all types", () => {
      const sampleData = createSampleAttendanceData();
      const result = getScheduledAbsences(sampleData);

      const spiritualScheduled = result.find(a => a.attendanceType === 'spiritual');
      const lightBathScheduled = result.find(a => a.attendanceType === 'lightBath');
      const rodScheduled = result.find(a => a.attendanceType === 'rod');
      
      expect(spiritualScheduled?.name).toBe("John Doe");
      expect(lightBathScheduled?.name).toBe("Light Bath Scheduled");
      expect(rodScheduled?.name).toBe("Rod Scheduled");
    });

    it("should not include checkedIn, onGoing, or completed attendances", () => {
      const sampleData = createSampleAttendanceData();
      const result = getScheduledAbsences(sampleData);

      // All results should not have timestamps (except maybe scheduled time if it exists)
      result.forEach(attendance => {
        expect(attendance.checkedInTime).toBeFalsy();
        expect(attendance.onGoingTime).toBeFalsy();
        expect(attendance.completedTime).toBeFalsy();
      });
    });

    it("should handle mixed data with some empty attendance types", () => {
      const mixedData = createMockAttendancesByDate({
        spiritual: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [createMockAttendanceStatusDetail({ name: "Light Bath Scheduled" })],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        rod: {
          scheduled: [createMockAttendanceStatusDetail({ name: "Rod Scheduled" })],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      });

      const result = getScheduledAbsences(mixedData);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Light Bath Scheduled");
      expect(result[0].attendanceType).toBe("lightBath");
      expect(result[1].name).toBe("Rod Scheduled");
      expect(result[1].attendanceType).toBe("rod");
    });
  });

  describe("IAttendanceStatusDetailWithType interface", () => {
    it("should extend AttendanceStatusDetail with attendanceType", () => {
      const sampleData = createSampleAttendanceData();
      const incomplete = getIncompleteAttendances(sampleData);
      
      if (incomplete.length > 0) {
        const firstAttendance: IAttendanceStatusDetailWithType = incomplete[0];
        
        // Should have all AttendanceStatusDetail properties
        expect(firstAttendance.name).toBeDefined();
        expect(firstAttendance.priority).toBeDefined();
        expect(firstAttendance.patientId).toBeDefined();
        expect(firstAttendance.attendanceId).toBeDefined();
        
        // Should have the additional attendanceType property
        expect(firstAttendance.attendanceType).toBeDefined();
        expect(['spiritual', 'lightBath', 'rod']).toContain(firstAttendance.attendanceType);
      }
    });
  });
});