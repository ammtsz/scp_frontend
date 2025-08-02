# Snake Case / Camel Case Migration Strategy

## Overview

This document outlines the approach to systematically handle the naming convention differences between backend (snake_case) and frontend (camelCase).

## Current Architecture

### 📁 File Structure

```
src/
├── api/
│   └── types.ts              # Backend API types (snake_case)
├── types/
│   ├── frontend.ts           # Frontend types (camelCase) - NEW
│   └── globals.ts            # Legacy types (mixed) - TO BE DEPRECATED
├── utils/
│   ├── caseConverters.ts     # Conversion utilities - NEW
│   └── apiTransformers.ts    # Legacy transformers - TO BE REFACTORED
└── services/
    └── apiService.ts         # Enhanced API service - NEW
```

## Migration Phases

### Phase 1: Setup Infrastructure ✅

- [x] Create case conversion utilities
- [x] Create frontend types with camelCase naming
- [x] Create enhanced API service with automatic conversion
- [x] Add comprehensive tests

### Phase 2: Migrate API Calls (Current)

1. **Update Context Files**

   - Update `AttendancesContext.tsx` to use new API service
   - Update `PatientsContext.tsx` to use new API service
   - Update `AgendaContext.tsx` to use new API service

2. **Update Components**
   - Migrate components to use camelCase types from `frontend.ts`
   - Remove manual transformations in component code

### Phase 3: Clean Up

1. **Remove Legacy Code**

   - Remove `types/globals.ts` after migration complete
   - Remove `utils/apiTransformers.ts` after migration complete
   - Update all imports to use new types

2. **Update Tests**
   - Update test mocks to use new types
   - Ensure all tests pass with new type system

## Implementation Examples

### Before (Current)

```typescript
// In component or context
const result = await getAttendancesByDate(date);
if (result.success) {
  const transformed = transformAttendancesFromApi(result.value, patients);
  setAttendances(transformed);
}
```

### After (New Approach)

```typescript
// In component or context
const result = await attendancesApi.getByDate(date);
if (result.success) {
  // Data is already in camelCase format!
  setAttendances(result.value);
}
```

## Benefits

### 🎯 Type Safety

- Strong TypeScript types throughout the application
- Automatic conversion prevents manual errors
- IntelliSense support with camelCase naming

### 🔄 Consistency

- All frontend code uses camelCase consistently
- Backend integration is abstracted away
- Clear separation of concerns

### 🚀 Developer Experience

- No more manual field mapping
- Reduced boilerplate code
- Automatic conversion in API layer

### 🧪 Testability

- Comprehensive tests for conversion logic
- Easy to mock with consistent types
- Better error handling

## Implementation Checklist

### Immediate Actions

- [ ] Update `AttendancesContext.tsx` to use `attendancesApi`
- [ ] Update components to use types from `frontend.ts`
- [ ] Update test files to use new types
- [ ] Run all tests to ensure compatibility

### Next Steps

- [ ] Create migration script for bulk updates
- [ ] Update remaining contexts and services
- [ ] Add runtime validation for API responses
- [ ] Create documentation for new API patterns

## Code Examples

### API Service Usage

```typescript
// ✅ New way - automatic conversion
import { attendancesApi } from "@/services/apiService";
import { Attendance } from "@/types/frontend";

const fetchAttendances = async (): Promise<Attendance[]> => {
  const result = await attendancesApi.getAll();
  return result.success ? result.value : [];
};
```

### Component Type Usage

```typescript
// ✅ New way - camelCase types
import { Patient, AttendanceByDate } from "@/types/frontend";

interface Props {
  patient: Patient;
  attendanceData: AttendanceByDate;
}
```

### Request Handling

```typescript
// ✅ New way - automatic snake_case conversion for requests
import { CreatePatientRequest } from "@/types/frontend";

const createPatient = async (data: CreatePatientRequest) => {
  // API service automatically converts camelCase to snake_case
  const result = await patientsApi.create(data);
  return result;
};
```

## Best Practices

1. **Always use types from `frontend.ts`** in React components
2. **Use the enhanced API service** for all API calls
3. **Let the system handle conversions** - don't do manual mapping
4. **Write tests** for any custom transformations
5. **Keep API types separate** from frontend types

## Rollback Plan

If issues arise during migration:

1. Revert to using existing API functions
2. Keep legacy transformers until issues resolved
3. Gradual rollback component by component
4. Full rollback possible via Git

## Success Metrics

- ✅ All tests passing
- ✅ No manual case conversions in component code
- ✅ Consistent camelCase usage throughout frontend
- ✅ Type safety maintained
- ✅ Improved developer experience
