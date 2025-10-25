# Zustand Migration Plan - MVP Center

**Document Version:** 1.0  
**Created:** October 24, 2025  
**Status:** Planning Phase  
**Target Implementation:** Post current TODO completion

## 📋 Executive Summary

Migration from React Context to Zustand state management for the MVP Center healthcare attendance management system. This document outlines the complete strategy, timeline, and implementation approach for transitioning from 5 React contexts to Zustand stores.

### Key Metrics

- **Current Architecture:** 5 React Contexts (1,117 total lines)
- **Files Impacted:** ~152 TypeScript files
- **Test Files:** 40+ test files requiring updates
- **Estimated Effort:** 9-13 days focused development
- **Bundle Reduction:** ~10-15KB (net reduction)
- **Performance Gain:** 20-30% improvement from selective subscriptions

## 🎯 Strategic Rationale

### Why Zustand Over Redux

- **Perfect Scale Match:** Medium complexity, small team
- **TypeScript Native:** Excellent type inference and integration
- **Minimal Boilerplate:** 90% less code than Redux setup
- **Bundle Efficient:** 2.5KB vs Redux's 15KB+ ecosystem
- **Healthcare Optimized:** Simple, reliable, fast for medical systems
- **MVP Philosophy:** Rapid development with clean architecture

### Current Pain Points Addressed

- **Provider Hell:** 5-level nested providers eliminated
- **Re-render Cascades:** Selective subscriptions prevent unnecessary renders
- **Testing Complexity:** No more provider wrappers in tests
- **Bundle Bloat:** Contexts create overhead, Zustand reduces it
- **Developer Experience:** Simpler APIs, better debugging

## 📊 Current Architecture Analysis

### Context Inventory

| Context                   | Lines | Complexity  | Migration Priority     |
| ------------------------- | ----- | ----------- | ---------------------- |
| `PatientsContext`         | 54    | Low         | Phase 1 (Start here)   |
| `TreatmentRecordsContext` | 163   | Medium      | Phase 1                |
| `AgendaContext`           | 224   | Medium      | Phase 2                |
| `TimezoneContext`         | 240   | Medium-High | Phase 2                |
| `AttendancesContext`      | 436   | High        | Phase 3 (Most complex) |

### Provider Nesting Structure

```tsx
<TimezoneProvider>
  <PatientsProvider>
    <AttendancesProvider>
      <AgendaProvider>
        <TreatmentRecordsProvider>{children}</TreatmentRecordsProvider>
      </AgendaProvider>
    </AttendancesProvider>
  </PatientsProvider>
</TimezoneProvider>
```

**Target:** Complete elimination of provider nesting

## 🚀 Migration Strategy

### Phase 1: Foundation (2-3 days)

**Start with Simple Contexts**

#### 1.1 PatientsStore Migration

```typescript
// Target Implementation
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface PatientsState {
  patients: PatientBasic[];
  loading: boolean;
  error: string | null;
  refreshPatients: () => Promise<void>;
  setPatients: (patients: PatientBasic[]) => void;
}

const usePatientsStore = create<PatientsState>()(
  devtools(
    persist(
      (set, get) => ({
        patients: [],
        loading: false,
        error: null,

        refreshPatients: async () => {
          set({ loading: true, error: null });
          try {
            const result = await getPatients();
            if (result.success && result.value) {
              const transformedPatients = transformPatientsFromApi(
                result.value
              );
              set({ patients: transformedPatients, loading: false });
            } else {
              set({
                error: result.error || "Error loading patients",
                loading: false,
              });
            }
          } catch (error) {
            set({ error: "Error loading patients", loading: false });
          }
        },

        setPatients: (patients) => set({ patients }),
      }),
      {
        name: "patients-storage",
        partialize: (state) => ({ patients: state.patients }),
      }
    ),
    { name: "PatientsStore" }
  )
);
```

#### 1.2 TreatmentRecordsStore Migration

```typescript
interface TreatmentRecordsState {
  treatmentRecords: TreatmentRecordResponseDto[];
  loading: boolean;
  error: string | null;

  // Actions
  refreshTreatmentRecords: () => Promise<void>;
  getTreatmentRecordForAttendance: (
    attendanceId: number
  ) => Promise<TreatmentRecordResponseDto | null>;
  createRecord: (
    data: CreateTreatmentRecordRequest
  ) => Promise<TreatmentRecordResponseDto | null>;
  updateRecord: (
    id: number,
    data: UpdateTreatmentRecordRequest
  ) => Promise<TreatmentRecordResponseDto | null>;
  deleteRecord: (id: number) => Promise<boolean>;
}

const useTreatmentRecordsStore = create<TreatmentRecordsState>()(
  devtools(
    (set, get) => ({
      // Implementation details...
    }),
    { name: "TreatmentRecordsStore" }
  )
);
```

### Phase 2: Business Logic (4-5 days)

**Complex State Management**

#### 2.1 AgendaStore Migration

```typescript
interface AgendaState {
  agenda: CalendarAgenda;
  loading: boolean;
  error: string | null;

  loadAgendaAttendances: (
    filters?: FilterOptions
  ) => Promise<AttendanceAgendaDto[]>;
  refreshAgenda: () => Promise<void>;
  removePatientFromAgenda: (attendanceId: number) => Promise<boolean>;
  addPatientToAgenda: (
    attendanceData: CreateAttendanceRequest
  ) => Promise<boolean>;
}
```

#### 2.2 TimezoneStore Migration

```typescript
interface TimezoneState {
  userTimezone: string;
  serverTimezone: TimezoneInfo;
  detectedTimezone: TimezoneInfo;
  isValidBrowserTimezone: boolean;
  supportedTimezones: readonly string[];
  timezoneInfo: TimezoneInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserTimezone: (timezone: string) => Promise<void>;
  refreshTimezoneInfo: () => Promise<void>;
  getCurrentTimeInTimezone: (timezone: string) => Promise<TimezoneInfo | null>;
  validateTimezone: (timezone: string) => Promise<boolean>;
  formatDateInTimezone: (
    dateString: string,
    timeString: string,
    timezone: string
  ) => string;
  convertToUserTimezone: (
    dateString: string,
    timeString: string,
    fromTimezone: string
  ) => { date: string; time: string };
}
```

### Phase 3: Critical Path (3-4 days)

**Most Complex Context Migration**

#### 3.1 AttendancesStore Migration

```typescript
interface AttendancesState {
  attendancesByDate: AttendanceByDate | null;
  selectedDate: string;
  loading: boolean;
  dataLoading: boolean;
  error: string | null;

  // Core Actions
  loadAttendancesByDate: (date: string) => Promise<AttendanceByDate | null>;
  bulkUpdateStatus: (ids: number[], status: string) => Promise<boolean>;
  initializeSelectedDate: () => Promise<void>;
  refreshCurrentDate: () => Promise<void>;
  setSelectedDate: (date: string) => void;

  // End-of-Day Workflow
  checkEndOfDayStatus: () => EndOfDayResult;
  finalizeEndOfDay: (data?: EndOfDayData) => Promise<EndOfDayResult>;
  handleIncompleteAttendances: (
    attendances: AttendanceStatusDetail[],
    action: "complete" | "reschedule"
  ) => Promise<boolean>;
  handleAbsenceJustifications: (
    justifications: AbsenceJustification[]
  ) => Promise<boolean>;
}

const useAttendancesStore = create<AttendancesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Complex business logic implementation
        // End-of-day workflows
        // Status management
        // Date handling
      }),
      {
        name: "attendances-storage",
        partialize: (state) => ({
          selectedDate: state.selectedDate,
          // Persist only necessary state
        }),
      }
    ),
    { name: "AttendancesStore" }
  )
);
```

### Phase 4: Optimization & Validation (1-2 days)

**Performance Testing and Documentation**

## 🔧 Implementation Details

### Package Installation

```bash
npm install zustand
# Optional middleware
npm install @types/lodash # for utilities if needed
```

### Store Structure Pattern

```typescript
// Standard store pattern for the project
interface StoreState {
  // Data
  data: DataType[];
  loading: boolean;
  error: string | null;

  // Actions (always async for API calls)
  fetchData: () => Promise<void>;
  createItem: (item: CreateType) => Promise<ItemType | null>;
  updateItem: (id: string, updates: UpdateType) => Promise<ItemType | null>;
  deleteItem: (id: string) => Promise<boolean>;

  // Utility actions
  resetError: () => void;
  clearData: () => void;
}
```

### Selector Patterns

```typescript
// Selective subscriptions for performance
const patients = usePatientsStore((state) => state.patients);
const loading = usePatientsStore((state) => state.loading);

// Or use the store's selector utility
const { patients, loading } = usePatientsStore(
  useShallow((state) => ({ patients: state.patients, loading: state.loading }))
);
```

## 🧪 Testing Strategy

### Store Testing Pattern

```typescript
// Clean store testing without providers
import { usePatientsStore } from "@/stores/patientsStore";

describe("PatientsStore", () => {
  beforeEach(() => {
    // Reset store state
    usePatientsStore.setState({
      patients: [],
      loading: false,
      error: null,
    });
  });

  it("should load patients successfully", async () => {
    const store = usePatientsStore.getState();
    await store.refreshPatients();

    expect(usePatientsStore.getState().patients).toHaveLength(2);
    expect(usePatientsStore.getState().loading).toBe(false);
  });
});
```

### Component Testing Updates

```typescript
// Before (with providers)
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <PatientsProvider>
      <AttendancesProvider>{ui}</AttendancesProvider>
    </PatientsProvider>
  );
};

// After (clean)
const { render } = testUtils;
render(<ComponentUnderTest />);
```

## 📁 File Structure Changes

### New Store Directory

```
src/
  stores/
    patientsStore.ts
    attendancesStore.ts
    agendaStore.ts
    timezoneStore.ts
    treatmentRecordsStore.ts
    __tests__/
      patientsStore.test.ts
      attendancesStore.test.ts
      # ... other store tests
```

### Removed Files

```
src/contexts/
  PatientsContext.tsx          -> DELETE
  AttendancesContext.tsx       -> DELETE
  AgendaContext.tsx           -> DELETE
  TimezoneContext.tsx         -> DELETE
  TreatmentRecordsContext.tsx -> DELETE
  __tests__/                  -> DELETE (move tests to stores/__tests__)
```

### Updated Files

```
src/app/layout.tsx             -> Remove all providers
src/components/**/             -> Update all useContext calls
src/hooks/**/                  -> Update context dependencies
```

## ⚡ Performance Optimizations

### Selective Subscriptions

```typescript
// Instead of entire context
const { patients, loading, error } = usePatients(); // Re-renders on any change

// Use selective subscriptions
const patients = usePatientsStore((state) => state.patients); // Only re-renders when patients change
const loading = usePatientsStore((state) => state.loading); // Only re-renders when loading changes
```

### Computed Values

```typescript
// Add computed selectors to stores
const useAttendancesStore = create<AttendancesState>((set, get) => ({
  // ... state and actions

  // Computed values as getters
  get totalScheduled() {
    const state = get();
    return state.attendancesByDate
      ? Object.values(state.attendancesByDate).reduce(/* calculation */, 0)
      : 0;
  },
}));
```

### Middleware Configuration

```typescript
// Development vs Production middleware
const storeMiddleware =
  process.env.NODE_ENV === "development" ? [devtools, persist] : [persist];
```

## 🛡️ Risk Mitigation

### Rollback Strategy

1. **Feature Branches:** Each phase in separate branch
2. **Backup Contexts:** Keep original context files until full validation
3. **Incremental Testing:** Test each store individually before integration
4. **Performance Benchmarks:** Measure before/after performance

### Validation Checklist

- [ ] All existing functionality preserved
- [ ] Performance improvements validated
- [ ] Bundle size reduction confirmed
- [ ] Test coverage maintained (592/592 tests passing)
- [ ] No breaking changes to component APIs
- [ ] DevTools integration working
- [ ] Error handling equivalent or improved

## 📅 Timeline & Milestones

### Pre-Migration (1 day)

- [ ] Complete current TODO items
- [ ] Create feature branch: `feature/zustand-migration`
- [ ] Install Zustand and setup tooling
- [ ] Create initial store structure

### Phase 1: Foundation (2-3 days)

- [ ] Day 1: PatientsStore implementation and testing
- [ ] Day 2: TreatmentRecordsStore implementation and testing
- [ ] Day 3: Integration testing and component updates

### Phase 2: Business Logic (4-5 days)

- [ ] Day 4-5: AgendaStore implementation
- [ ] Day 6-7: TimezoneStore implementation
- [ ] Day 8: Integration testing and validation

### Phase 3: Critical Path (3-4 days)

- [ ] Day 9-10: AttendancesStore implementation (most complex)
- [ ] Day 11: End-to-end testing
- [ ] Day 12: Bug fixes and edge cases

### Phase 4: Optimization (1-2 days)

- [ ] Day 13: Performance optimization and bundle analysis
- [ ] Day 14: Documentation updates and team review

### Post-Migration (1 day)

- [ ] Performance benchmarking
- [ ] Documentation updates
- [ ] Team training on new patterns
- [ ] Production deployment

## 🔍 Success Metrics

### Performance Targets

- **Bundle Size:** Reduce by 10-15KB
- **Re-renders:** 20-30% reduction
- **Memory Usage:** 15-20% improvement
- **Load Time:** 5-10% faster initial load

### Developer Experience Goals

- **Test Setup:** Eliminate provider wrappers
- **API Simplicity:** Reduce context boilerplate by 90%
- **Type Safety:** Maintain or improve TypeScript inference
- **Debugging:** Better DevTools integration

### Quality Assurance

- **Test Coverage:** Maintain 592/592 passing tests
- **No Regressions:** All existing functionality preserved
- **Error Handling:** Equivalent or improved error states
- **Accessibility:** No impact on accessibility features

## 📚 Resources & References

### Zustand Documentation

- [Official Zustand Docs](https://github.com/pmndrs/zustand)
- [TypeScript Guide](https://github.com/pmndrs/zustand#typescript)
- [Middleware Documentation](https://github.com/pmndrs/zustand#middleware)

### Best Practices

- [Zustand Patterns](https://github.com/pmndrs/zustand/wiki/Recipes)
- [Performance Optimization](https://github.com/pmndrs/zustand#performance)
- [Testing Strategies](https://github.com/pmndrs/zustand#testing)

### Migration Examples

- Similar healthcare app migrations
- TypeScript conversion patterns
- Context-to-Zustand migration guides

## 📝 Notes & Considerations

### Healthcare Domain Specific

- **Data Sensitivity:** Patient data handling remains secure
- **Audit Trail:** State changes maintain audit capability
- **Reliability:** Medical systems require 99.9% uptime
- **Compliance:** HIPAA considerations for state persistence

### Team Considerations

- **Learning Curve:** Minimal for team familiar with React hooks
- **Code Review:** Focus on store patterns and selector usage
- **Documentation:** Update internal wiki and onboarding docs
- **Training:** Brief team session on Zustand patterns

### Future Considerations

- **Scalability:** Easy to add new stores as features grow
- **Maintenance:** Simpler architecture reduces maintenance burden
- **Testing:** Cleaner test patterns improve long-term test health
- **Performance:** Foundation for future performance optimizations

---

**Document Maintained By:** Development Team  
**Next Review Date:** Post-migration completion  
**Status:** Ready for implementation after current TODO completion

This plan serves as the complete guide for migrating from React Context to Zustand state management. Refer to this document when ready to begin the migration phase.
