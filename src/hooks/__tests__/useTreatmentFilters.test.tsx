import { renderHook, act, waitFor } from "@testing-library/react";
import { useTreatmentFilters } from "../useTreatmentFilters";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultFilters } from "@/types/filters";
import { TreatmentSessionResponseDto } from "@/api/types";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = new URLSearchParams();

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, "error").mockImplementation(),
};

// Sample data for testing
const mockSessions: TreatmentSessionResponseDto[] = [
  {
    id: 1,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 101,
    body_location: "Head",
    treatment_type: "light_bath" as const,
    status: "scheduled",
    start_date: "2023-01-01",
    planned_sessions: 5,
    completed_sessions: 1,
    notes: "Test session",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
  },
  {
    id: 2,
    treatment_record_id: 2,
    attendance_id: 2,
    patient_id: 102,
    body_location: "Chest",
    treatment_type: "rod" as const,
    status: "completed",
    start_date: "2023-01-02",
    planned_sessions: 3,
    completed_sessions: 3,
    notes: "Another test session",
    created_at: "2023-01-02T10:00:00Z",
    updated_at: "2023-01-02T10:00:00Z",
  },
  {
    id: 3,
    treatment_record_id: 3,
    attendance_id: 3,
    patient_id: 103,
    body_location: "Back",
    treatment_type: "light_bath" as const,
    status: "cancelled",
    start_date: "2023-01-03",
    planned_sessions: 2,
    completed_sessions: 0,
    notes: undefined,
    created_at: "2023-01-03T10:00:00Z",
    updated_at: "2023-01-03T10:00:00Z",
  },
];

const mockPatients = [
  { id: 101, name: "John Doe" },
  { id: 102, name: "Jane Smith" },
  { id: 103, name: "Bob Johnson" },
];

describe("useTreatmentFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    consoleSpy.error.mockClear();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.delete("search");
    mockSearchParams.delete("types");
    mockSearchParams.delete("statuses");
    mockSearchParams.delete("startDate");
    mockSearchParams.delete("endDate");
  });

  afterAll(() => {
    consoleSpy.error.mockRestore();
  });

  describe("initialization", () => {
    it("should initialize with default filters when no URL params or stored filters", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.filters).toEqual(defaultFilters);
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.savedPresets).toEqual([]);
    });

    it("should load filters from URL parameters", () => {
      mockSearchParams.set("search", "test");
      mockSearchParams.set("types", "light_bath,rod");
      mockSearchParams.set("statuses", "completed,cancelled");
      mockSearchParams.set("startDate", "2023-01-01");
      mockSearchParams.set("endDate", "2023-01-31");

      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.filters.searchTerm).toBe("test");
      expect(result.current.filters.treatmentTypes).toEqual([
        "light_bath",
        "rod",
      ]);
      expect(result.current.filters.statuses).toEqual([
        "completed",
        "cancelled",
      ]);
      expect(result.current.filters.dateRange.start).toEqual(
        new Date("2023-01-01")
      );
      expect(result.current.filters.dateRange.end).toEqual(
        new Date("2023-01-31")
      );
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should load last filters from localStorage when no URL params", () => {
      const lastFilters = {
        searchTerm: "stored search",
        treatmentTypes: ["light_bath"],
        statuses: ["scheduled"],
        dateRange: { start: "2023-01-01", end: "2023-01-15" },
      };
      localStorageMock.setItem(
        "treatment-last-filters",
        JSON.stringify(lastFilters)
      );

      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.filters.searchTerm).toBe("stored search");
      expect(result.current.filters.treatmentTypes).toEqual(["light_bath"]);
      expect(result.current.filters.statuses).toEqual(["scheduled"]);
    });

    it("should load saved presets from localStorage", () => {
      const presets = [
        {
          id: "preset-1",
          name: "My Preset",
          filters: { ...defaultFilters, searchTerm: "preset search" },
          createdAt: "2023-01-01T10:00:00Z",
        },
      ];
      localStorageMock.setItem(
        "treatment-filter-presets",
        JSON.stringify(presets)
      );

      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.savedPresets).toHaveLength(1);
      expect(result.current.savedPresets[0].name).toBe("My Preset");
      expect(result.current.savedPresets[0].filters.searchTerm).toBe(
        "preset search"
      );
    });

    it("should handle error when parsing URL filters", () => {
      // Mock the parseFiltersFromURL function to throw an error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Create a mock that simulates parsing error by providing malformed JSON-like structure
      mockSearchParams.set("search", ""); // Valid search
      mockSearchParams.set("startDate", "not-a-date"); // This will cause new Date('not-a-date') to create invalid Date

      // However, the parseFiltersFromURL handles this and returns null,
      // so let's just test what actually happens - it should return default filters
      const { result } = renderHook(() => useTreatmentFilters());

      // Should fall back to default filters when URL parsing fails
      expect(result.current.filters.searchTerm).toBe("");
      expect(result.current.filters.treatmentTypes).toEqual([]);
      expect(result.current.filters.statuses).toEqual([]);

      console.error = originalConsoleError;
    });

    it("should handle error when loading saved presets", () => {
      localStorageMock.setItem("treatment-filter-presets", "invalid-json");

      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.savedPresets).toEqual([]);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error loading saved presets:",
        expect.any(SyntaxError)
      );
    });

    it("should handle error when loading last filters", () => {
      localStorageMock.setItem("treatment-last-filters", "invalid-json");

      const { result } = renderHook(() => useTreatmentFilters());

      expect(result.current.filters).toEqual(defaultFilters);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Error loading last filters:",
        expect.any(SyntaxError)
      );
    });
  });

  describe("filter updates", () => {
    it("should update search term", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("new search");
      });

      expect(result.current.filters.searchTerm).toBe("new search");
      expect(result.current.hasActiveFilters).toBe(true);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/treatment-tracking?search=new+search",
          { scroll: false }
        );
      });
    });

    it("should update treatment types", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateTreatmentTypes(["light_bath", "rod"]);
      });

      expect(result.current.filters.treatmentTypes).toEqual([
        "light_bath",
        "rod",
      ]);
      expect(result.current.hasActiveFilters).toBe(true);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/treatment-tracking?types=light_bath%2Crod",
          { scroll: false }
        );
      });
    });

    it("should update statuses", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateStatuses(["completed", "cancelled"]);
      });

      expect(result.current.filters.statuses).toEqual([
        "completed",
        "cancelled",
      ]);
      expect(result.current.hasActiveFilters).toBe(true);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/treatment-tracking?statuses=completed%2Ccancelled",
          { scroll: false }
        );
      });
    });

    it("should update date range", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-01-31");

      act(() => {
        result.current.updateDateRange({ start: startDate, end: endDate });
      });

      expect(result.current.filters.dateRange.start).toEqual(startDate);
      expect(result.current.filters.dateRange.end).toEqual(endDate);
      expect(result.current.hasActiveFilters).toBe(true);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/treatment-tracking?startDate=2023-01-01&endDate=2023-01-31",
          { scroll: false }
        );
      });
    });

    it("should clear all filters", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      // First set some filters
      act(() => {
        result.current.updateSearchTerm("test");
        result.current.updateTreatmentTypes(["light_bath"]);
      });

      expect(result.current.hasActiveFilters).toBe(true);

      // Then clear them
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual(defaultFilters);
      expect(result.current.hasActiveFilters).toBe(false);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/treatment-tracking", {
          scroll: false,
        });
      });
    });

    it("should save last filters to localStorage", async () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("test search");
      });

      await waitFor(() => {
        const saved = localStorageMock.getItem("treatment-last-filters");
        expect(saved).toContain("test search");
      });
    });

    it("should handle error when saving last filters", async () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("test");
      });

      await waitFor(() => {
        expect(consoleSpy.error).toHaveBeenCalledWith(
          "Error saving last filters:",
          expect.any(Error)
        );
      });

      // Restore original function
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("date presets", () => {
    beforeEach(() => {
      // Mock current date
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2023-06-15T12:00:00Z")); // Thursday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should set today preset", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset("today");
      });

      const filters = result.current.filters;
      const today = new Date("2023-06-15T12:00:00Z");
      expect(filters.dateRange.start?.toDateString()).toBe(
        today.toDateString()
      );
      expect(filters.dateRange.end?.toDateString()).toBe(today.toDateString());
    });

    it("should set week preset", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset("week");
      });

      const filters = result.current.filters;
      // Week should start on Sunday (June 11) and end on Saturday (June 17)
      const weekStart = new Date("2023-06-11T12:00:00Z");
      const weekEnd = new Date("2023-06-17T12:00:00Z");
      expect(filters.dateRange.start?.toDateString()).toBe(
        weekStart.toDateString()
      );
      expect(filters.dateRange.end?.toDateString()).toBe(
        weekEnd.toDateString()
      );
    });

    it("should set month preset", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset("month");
      });

      const filters = result.current.filters;
      const monthStart = new Date("2023-06-01T12:00:00Z");
      const monthEnd = new Date("2023-06-30T12:00:00Z");
      expect(filters.dateRange.start?.toDateString()).toBe(
        monthStart.toDateString()
      );
      expect(filters.dateRange.end?.toDateString()).toBe(
        monthEnd.toDateString()
      );
    });

    it("should set quarter preset", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.setDatePreset("quarter");
      });

      const filters = result.current.filters;
      // Q2: April-June
      const quarterStart = new Date("2023-04-01T12:00:00Z");
      const quarterEnd = new Date("2023-06-30T12:00:00Z");
      expect(filters.dateRange.start?.toDateString()).toBe(
        quarterStart.toDateString()
      );
      expect(filters.dateRange.end?.toDateString()).toBe(
        quarterEnd.toDateString()
      );
    });

    it("should clear date range for unknown preset", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      // First set a date range
      act(() => {
        result.current.setDatePreset("today");
      });

      expect(result.current.filters.dateRange.start).not.toBeNull();

      // Then use unknown preset
      act(() => {
        result.current.setDatePreset("unknown");
      });

      expect(result.current.filters.dateRange.start).toBeNull();
      expect(result.current.filters.dateRange.end).toBeNull();
    });
  });

  describe("preset management", () => {
    beforeEach(() => {
      // Ensure real timers are used for this section
      jest.useRealTimers();
      // Extra cleanup to ensure localStorage is completely clear
      localStorageMock.clear();
    });

    afterEach(() => {
      // Clean up after each test in this block
      localStorageMock.clear();
    });

    it("should save a new preset", () => {
      // Ensure completely clean state before this test
      localStorageMock.clear();

      const { result } = renderHook(() => useTreatmentFilters());

      // Set some filters first
      act(() => {
        result.current.updateSearchTerm("preset test");
        result.current.updateTreatmentTypes(["light_bath"]);
      });

      // Save the preset
      act(() => {
        result.current.savePreset("My Test Preset");
      });

      expect(result.current.savedPresets).toHaveLength(1);
      expect(result.current.savedPresets[0].name).toBe("My Test Preset");
      expect(result.current.savedPresets[0].filters.searchTerm).toBe(
        "preset test"
      );
      expect(result.current.savedPresets[0].filters.treatmentTypes).toEqual([
        "light_bath",
      ]);

      // Check localStorage
      const stored = localStorageMock.getItem("treatment-filter-presets");
      expect(stored).toContain("My Test Preset");
    });

    it("should load a preset", async () => {
      // Ensure completely clean state before this test
      localStorageMock.clear();

      const { result } = renderHook(() => useTreatmentFilters());

      // Create a preset first
      act(() => {
        result.current.updateSearchTerm("original search");
      });

      act(() => {
        result.current.savePreset("Test Preset");
      });

      // Change filters
      act(() => {
        result.current.updateSearchTerm("different search");
      });

      expect(result.current.filters.searchTerm).toBe("different search");

      // Load the preset
      act(() => {
        result.current.loadPreset(result.current.savedPresets[0]);
      });

      expect(result.current.filters.searchTerm).toBe("original search");
    });

    it("should delete a preset", async () => {
      // Completely isolated test - clear everything and use a fresh hook instance
      localStorageMock.clear();
      jest.clearAllMocks();

      // Create a new hook instance in complete isolation
      const { result } = renderHook(() => useTreatmentFilters());

      // Wait for hook to initialize completely
      expect(result.current.savedPresets).toHaveLength(0);

      // Create and verify first preset
      act(() => {
        result.current.updateSearchTerm("preset 1");
        result.current.savePreset("Preset 1");
      });

      // Verify first preset was created
      expect(result.current.savedPresets).toHaveLength(1);
      const preset1 = result.current.savedPresets.find(
        (p) => p.name === "Preset 1"
      );
      expect(preset1).toBeDefined();
      expect(preset1?.id).toBeDefined();

      // Wait 1ms to ensure different timestamp for ID generation
      await new Promise((resolve) => setTimeout(resolve, 1));

      // Create and verify second preset
      act(() => {
        result.current.updateSearchTerm("preset 2");
        result.current.savePreset("Preset 2");
      });

      // Verify both presets exist
      expect(result.current.savedPresets).toHaveLength(2);
      const preset2 = result.current.savedPresets.find(
        (p) => p.name === "Preset 2"
      );
      expect(preset2).toBeDefined();
      expect(preset2?.id).toBeDefined();

      // Delete the first preset
      act(() => {
        result.current.deletePreset(preset1!.id);
      });

      // Verify deletion worked - should have exactly 1 preset left
      expect(result.current.savedPresets).toHaveLength(1);
      expect(result.current.savedPresets[0].name).toBe("Preset 2");
      expect(
        result.current.savedPresets.some((p) => p.name === "Preset 1")
      ).toBe(false);

      // Check localStorage consistency
      const stored = JSON.parse(
        localStorageMock.getItem("treatment-filter-presets") || "[]"
      ) as Array<{ name: string; id: string }>;
      expect(stored).toHaveLength(1);
      expect(stored.some((p) => p.name === "Preset 1")).toBe(false);
      expect(stored.some((p) => p.name === "Preset 2")).toBe(true);
    });
  });

  describe("filterSessions", () => {
    it("should filter by search term - body location", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("head");
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].body_location).toBe("Head");
    });

    it("should filter by search term - treatment type", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("light_bath");
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(2);
      expect(filtered.every((s) => s.treatment_type === "light_bath")).toBe(
        true
      );
    });

    it("should filter by search term - notes", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("test session");
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(2);
    });

    it("should filter by search term - patient name", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("john doe");
      });

      const filtered = result.current.filterSessions(
        mockSessions,
        mockPatients
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].patient_id).toBe(101);
    });

    it("should not match patient name when patients data is not provided", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("john");
      });

      const filtered = result.current.filterSessions(mockSessions); // No patients parameter
      expect(filtered).toHaveLength(0);
    });

    it("should filter by treatment types", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateTreatmentTypes(["rod"]);
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].treatment_type).toBe("rod");
    });

    it("should filter by multiple treatment types", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateTreatmentTypes(["rod", "light_bath"]);
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(3);
    });

    it("should filter by statuses", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateStatuses(["completed"]);
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe("completed");
    });

    it("should filter by date range - start date only", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateDateRange({
          start: new Date("2023-01-02"),
          end: null,
        });
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(2); // Sessions from 2023-01-02 and 2023-01-03
    });

    it("should filter by date range - end date only", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateDateRange({
          start: null,
          end: new Date("2023-01-02"),
        });
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(2); // Sessions from 2023-01-01 and 2023-01-02
    });

    it("should filter by date range - both start and end", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateDateRange({
          start: new Date("2023-01-02"),
          end: new Date("2023-01-02"),
        });
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1); // Only session from 2023-01-02
    });

    it("should apply multiple filters simultaneously", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateTreatmentTypes(["light_bath"]);
        result.current.updateStatuses(["scheduled"]);
        result.current.updateDateRange({
          start: new Date("2023-01-01"),
          end: new Date("2023-01-01"),
        });
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });

    it("should return empty array when no sessions match", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("nonexistent");
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(0);
    });

    it("should handle sessions with null notes", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("back");
      });

      const filtered = result.current.filterSessions(mockSessions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].body_location).toBe("Back");
    });
  });

  describe("hasActiveFilters", () => {
    it("should return false for default filters", () => {
      const { result } = renderHook(() => useTreatmentFilters());
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should return true when search term is set", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateSearchTerm("test");
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should return true when treatment types are set", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateTreatmentTypes(["light_bath"]);
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should return true when statuses are set", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateStatuses(["completed"]);
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should return true when date range start is set", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateDateRange({ start: new Date(), end: null });
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("should return true when date range end is set", () => {
      const { result } = renderHook(() => useTreatmentFilters());

      act(() => {
        result.current.updateDateRange({ start: null, end: new Date() });
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
