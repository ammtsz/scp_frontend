# SCP Implementation Strategy - Spiritual Center Automation

## Project Overview

Implementation strategy for extending MVP Center to support spiritual center automation requirements based on SCP documents analysis.

## Final Deep Analysis Results

### 🎯 Alignment Assessment

**Excellent Foundation Match (90%+)**

- ✅ **Patient Management**: Current CRUD operations perfectly align with SCP patient requirements
- ✅ **Attendance System**: Drag-and-drop workflow matches the consultation → treatment flow
- ✅ **Priority System**: Emergency/Intermediate/Normal priorities work for SCP urgency levels
- ✅ **Status Progression**: Current flow (Scheduled → Checked In → In Progress → Completed) is ideal
- ✅ **Backend Architecture**: NestJS + PostgreSQL + TypeORM provides robust foundation for SCP requirements

### 📋 SCP Requirements Analysis

**Treatment Types Required:**

- Spiritual Consultation (✅ implemented)
- Light Bath (`Banho de Luz`) (✅ implemented)
- Rod Treatment (`Bastão`) (❌ needs implementation)

**Scheduling Rules:**

- Tuesday-only sessions (❌ needs calendar logic)
- Holidays blocked (❌ needs calendar blocking)
- Last 2 weeks of December blocked (❌ needs default blocking)

**Treatment Specifications:**

- Body locations (coronary, lumbar, foot, etc.) (❌ needs location system)
- Quantity tracking (✅ partially implemented)
- Duration tracking (✅ basic implementation exists)

**Medical Recommendations:**

- Food recommendations (✅ text field exists)
- Water recommendations (✅ text field exists)
- Ointment recommendations (✅ text field exists)
- Treatment type toggles (❌ needs boolean fields)
- Return scheduling (weeks) (❌ needs return logic)

## Implementation Strategy

### Phase 1: Core Extensions (Week 1)

**Priority: HIGH**

#### Rod Treatment Integration

- Add `'rod'` to AttendanceType enum (backend + frontend)
- Update AttendanceCard styling for rod treatments
- Extend existing drag-and-drop to handle rod type
- **Auto-create tests**: Rod treatment display and status updates

#### Enhanced Treatment Records

```typescript
interface TreatmentRecord {
  id?: number;
  attendanceId: number;
  treatmentType: "spiritual" | "lightBath" | "rod";
  location: string[]; // Predefined locations
  customLocation?: string; // Custom location input
  quantity: number;
  startDate: string;
  endDate?: string;
}
```

**Files to Modify:**

- Backend: `attendance-type.enum.ts`, `treatment-record.entity.ts`
- Frontend: `frontend.ts` (types), `AttendanceCard.tsx`

### Phase 2: Location Management (Week 1-2)

**Priority: HIGH**

#### Location Selection System

- Predefined body locations (coronary, lumbar, foot, etc.)
- Custom location input capability
- Integration with existing treatment forms
- **Auto-create tests**: Location selection and validation

**Predefined Locations:**

- Coronário, Lombar, Pé, Cabeça, Coração, Estômago
- Braço Direito/Esquerdo, Perna Direita/Esquerda
- Pescoço, Ombro Direito/Esquerdo

**Files to Create:**

- `src/utils/treatmentLocations.ts`
- `src/components/TreatmentForm/LocationSelector.tsx`
- `src/components/TreatmentForm/__tests__/LocationSelector.test.tsx`

### Phase 3: Treatment Recommendations Enhancement (Week 2)

**Priority: MEDIUM**

#### Structured Recommendations

- Enhance existing food/water/ointment text fields
- Add treatment type toggles (lightBath, rod, spiritualConsultation)
- Add return weeks number input
- Last recommendation memory system
- **Auto-create tests**: Recommendation form validation and persistence

**Files to Create:**

- `src/components/PatientModal/TreatmentRecommendationsForm.tsx`
- `src/components/common/Switch.tsx` (if not exists)
- `src/components/PatientModal/__tests__/TreatmentRecommendationsForm.test.tsx`

### Phase 4: Calendar Intelligence (Week 2-3)

**Priority: MEDIUM**

#### Tuesday-Only Scheduling

- Calendar blocking interface
- Default December blocks
- Holiday management
- Exception handling (unblock capability)
- **Auto-create tests**: Calendar blocking logic and date validation

**Files to Create:**

- `src/components/Calendar/CalendarBlockingInterface.tsx`
- `src/components/Calendar/__tests__/CalendarBlockingInterface.test.tsx`
- Backend: Calendar blocking endpoints

### Phase 5: Automatic Scheduling (Week 3-4)

**Priority: LOW**

#### Smart Scheduling Engine

- Return week calculation based on recommendations
- Tuesday-only enforcement
- Blocked date avoidance
- Patient history consideration
- **Auto-create tests**: Scheduling algorithm and edge cases

## Technical Requirements

### Database Schema Updates

```sql
-- Add rod treatment type
ALTER TYPE attendance_type ADD VALUE 'rod';

-- Extend treatment records table
ALTER TABLE scp_treatment_record ADD COLUMN location TEXT[];
ALTER TABLE scp_treatment_record ADD COLUMN custom_location VARCHAR(255);
```

### API Endpoints to Add

- `/schedule-settings` - For calendar blocking
- `/treatment-recommendations` - For medical recommendations
- `/automatic-scheduling` - For scheduling logic
- `/patients/:id/last-recommendations` - For recommendation history

### Frontend Components to Create

1. `LocationSelector` - Body location selection with predefined + custom
2. `TreatmentRecommendationsForm` - Enhanced recommendations with toggles
3. `CalendarBlockingInterface` - Calendar management with blocking rules
4. `Switch` - Modern toggle component (if not exists)

## Success Metrics

- **Code Coverage**: Maintain >45% (currently 47%+)
- **Test Success**: Maintain 100% pass rate (currently 279/279)
- **Type Safety**: Zero `any` types in new implementations
- **Performance**: No regression in drag-and-drop responsiveness
- **User Experience**: Seamless integration with existing workflows

## Architecture Compatibility

- ✅ **Context System**: Easily accommodates new treatment types
- ✅ **API Layer**: Snake/camel case conversion supports new fields
- ✅ **Testing Framework**: 279 tests provide solid foundation for extensions
- ✅ **Type System**: Frontend/backend type alignment ready for extensions

## Implementation Order

1. **Start with Phase 1 (Rod Treatment)** - Lowest risk, highest immediate value
2. **Progress to Phase 2 (Location Management)** - Core functionality needed
3. **Implement Phase 3 (Enhanced Recommendations)** - User experience improvement
4. **Deploy Phase 4 (Calendar)** - Business rules implementation
5. **Complete Phase 5 (Auto-scheduling)** - Advanced automation features

## Notes

- Each phase is designed to be independent while building upon existing architecture
- All new components must include comprehensive unit tests
- Follow existing patterns for API integration and context management
- Maintain backward compatibility with existing attendance workflows
- Document all new patterns in copilot-instructions.md

---

**Created**: August 21, 2025
**Status**: Ready for implementation
**Next Action**: Begin Phase 1 - Rod Treatment Integration
