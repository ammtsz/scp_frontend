# SCP Implementation Strategy - Spiritual Center Automation

## Project Overview

Implementation strategy for extending MVP Center to support spiritual center automation requirements based on comprehensive analysis of SCP documents and `attendances-flow.md` requirements.

## 🔍 **Deep Analysis Summary**

### **Current Architecture Strengths:**

1. ✅ **Solid Foundation**: The project has excellent TypeScript coverage, comprehensive testing (279 tests), and clean separation of concerns
2. ✅ **Backend Integration**: Already supports all three treatment types (spiritual, lightBath, rod) with proper API endpoints
3. ✅ **Drag & Drop System**: Well-implemented attendance flow with backend synchronization
4. ✅ **Context Management**: Strong patterns for state management with AttendancesContext and PatientsContext
5. ✅ **Component Structure**: Good component separation but needs better responsibility boundaries

### **Current Architecture Issues:**

1. ❌ **Missing Treatment Status "N"**: Backend enum only has T, A, F - missing the "new patient" status
2. ❌ **No Missing Appointments Tracking**: Database lacks fields for tracking consecutive absences
3. ❌ **Form Responsibilities**: PatientForm handles both creation and editing without clear separation
4. ❌ **Mixed Treatment Logic**: Spiritual consultation isn't properly hierarchized over lightBath/rod
5. ❌ **No End-of-Day Workflow**: Missing attendance day finalization process

### 📋 SCP Requirements Analysis

**Treatment Types Required:**

- Spiritual Consultation (✅ implemented)
- Light Bath (`Banho de Luz`) (✅ implemented)
- Rod Treatment (`Bastão`) (✅ implemented)

**Patient Status Management:**

- New Patient Status "N" (❌ needs implementation)
- Missing appointments tracking (❌ needs database fields)
- Absence justification system (❌ needs workflow)

**Treatment Hierarchy:**

- Spiritual consultation as primary treatment (❌ needs restructuring)
- LightBath/Rod as recommendations from spiritual consultation (❌ needs implementation)
- Automatic scheduling based on return weeks (❌ needs logic)

**Form Workflows:**

- New patient check-in form (❌ needs specialized component)
- Treatment completion form (❌ needs post-consultation workflow)
- End-of-day absence management (❌ needs workflow)

## Implementation Strategy

### **Phase 1: Database & Backend Foundation (Priority: CRITICAL)**

**1.1 Backend Enum Updates**

```typescript
// Add to TreatmentStatus enum in backend
export enum TreatmentStatus {
  NEW_PATIENT = "N", // Novo paciente
  IN_TREATMENT = "T", // Em tratamento
  DISCHARGED = "A", // Alta médica espiritual
  ABSENT = "F", // Faltas consecutivas
}
```

**1.2 Database Schema Extensions**

```sql
-- Add missing appointments tracking to patient table
ALTER TABLE scp_patient ADD COLUMN missing_appointments_streak INTEGER DEFAULT 0;

-- Add absence tracking to attendance table
ALTER TABLE scp_attendance ADD COLUMN is_absence BOOLEAN DEFAULT FALSE;
ALTER TABLE scp_attendance ADD COLUMN absence_justified BOOLEAN DEFAULT NULL;
```

**1.3 Frontend Type Updates**

```typescript
// Update IStatus type in globals.ts
export type IStatus = "N" | "T" | "A" | "F";
```

**Auto-create tests**: Backend enum validation, database constraint tests, frontend type safety tests

### **Phase 2: Patient Form Separation (Priority: HIGH)**

**2.1 Create Specialized Patient Forms**

- **`NewPatientCheckInForm`**: Triggered when NEW patient (marked with treatment_status='N') is dragged to checked-in
- **`PatientEditForm`**: For updating existing patient data (available in patient pages)
- **`UnscheduledPatientForm`**: Enhanced version of current form for walk-ins

**2.2 Enhanced Form Logic**

```typescript
// Patient form should detect new patients and show appropriate fields
const isNewPatient = (patient: IPatient) => patient.status === "N";

// Integration with drag-and-drop system
const handleCheckInDrop = (patient: IAttendanceStatusDetail) => {
  const fullPatient = findPatient(patient.name);
  if (fullPatient?.status === "N") {
    // Open NewPatientCheckInForm modal
    setNewPatientModalOpen(true);
    setPatientToComplete(fullPatient);
  } else {
    // Proceed with normal check-in
    performMove(targetType, "checkedIn");
  }
};
```

**Files to Create:**

- `src/components/PatientForms/NewPatientCheckInForm.tsx`
- `src/components/PatientForms/PatientEditForm.tsx`
- `src/components/PatientForms/UnscheduledPatientForm.tsx`
- `src/components/PatientForms/__tests__/` - Complete test suite

**Auto-create tests**: Form validation, new patient detection, drag-and-drop integration

### **Phase 3: Treatment Form Hierarchy (Priority: HIGH)**

**3.1 Create Treatment Form System**

- **`SpiritualConsultationForm`**: Primary treatment form (after spiritual consultation completion)
- **`TreatmentRecommendationsSection`**: For lightBath/rod scheduling
- **`EndOfDayModal`**: For handling absences and attendance finalization

**3.2 Treatment Hierarchy Logic**

```typescript
// Spiritual consultation drives other treatments
interface TreatmentRecommendation {
  lightBath?: {
    startDate: Date;
    bodyLocation: string[];
    color?: string;
    duration: number;
    quantity: number;
  };
  rod?: {
    startDate: Date;
    bodyLocation: string[];
    quantity: number;
  };
  returnWeeks: number;
  spiritualMedicalDischarge: boolean;
}
```

**Files to Create:**

- `src/components/TreatmentForms/SpiritualConsultationForm.tsx`
- `src/components/TreatmentForms/TreatmentRecommendations.tsx`
- `src/components/TreatmentForms/BodyLocationSelector.tsx`
- `src/components/AttendanceManagement/EndOfDayModal.tsx`
- `src/components/AttendanceManagement/AbsenceJustificationForm.tsx`

**Auto-create tests**: Treatment hierarchy logic, scheduling automation, form validation

### **Phase 4: Enhanced Components Architecture (Priority: MEDIUM)**

**4.1 Component Responsibility Separation**

```
src/components/
├── PatientForms/
│   ├── NewPatientCheckInForm.tsx    // NEW: For first-time check-ins
│   ├── PatientEditForm.tsx          // Enhanced: General patient editing
│   └── UnscheduledPatientForm.tsx   // Enhanced: Walk-in patients
├── TreatmentForms/
│   ├── SpiritualConsultationForm.tsx  // NEW: Post-consultation form
│   ├── TreatmentRecommendations.tsx   // NEW: LightBath/Rod scheduling
│   └── BodyLocationSelector.tsx      // NEW: Location selection component
├── AttendanceManagement/
│   ├── EndOfDayModal.tsx             // NEW: Day finalization
│   └── AbsenceJustificationForm.tsx  // NEW: Handle patient absences
```

**4.2 Context Enhancements**

```typescript
// Add to AttendancesContext
interface AttendancesContextType {
  // ... existing properties
  endDayMode: boolean;
  setEndDayMode: (mode: boolean) => void;
  handleEndOfDay: () => Promise<void>;
  justifyAbsence: (
    patientId: number,
    justified: boolean,
    notes?: string
  ) => Promise<void>;
}
```

**Auto-create tests**: Component isolation tests, context integration tests

### **Phase 5: End-of-Day Workflow (Priority: MEDIUM)**

**5.1 End-of-Day Button Logic**

```typescript
const handleEndOfDay = () => {
  const activePatients = getActivePatients(); // checkedIn + onGoing
  const scheduledPatients = getScheduledPatients();

  if (activePatients.length > 0) {
    // Show warning modal to complete or reschedule
    setIncompleteAttendancesModal(true);
  } else if (scheduledPatients.length > 0) {
    // Show absence justification modal
    setAbsenceJustificationModal(true);
  } else {
    // Finalize day
    finalizeAttendanceDay();
  }
};
```

**5.2 Absence Management**

- Track consecutive absences
- Update patient status to 'F' after 2 unjustified absences
- Delete future attendances when status changes to 'F'

**Auto-create tests**: End-of-day workflow, absence tracking logic, status change automation

## Technical Requirements

### Database Schema Updates

```sql
-- Add new patient status to treatment_status enum
ALTER TYPE treatment_status ADD VALUE 'N';

-- Add missing appointments tracking to patient table
ALTER TABLE scp_patient ADD COLUMN missing_appointments_streak INTEGER DEFAULT 0;

-- Add absence tracking to attendance table
ALTER TABLE scp_attendance ADD COLUMN is_absence BOOLEAN DEFAULT FALSE;
ALTER TABLE scp_attendance ADD COLUMN absence_justified BOOLEAN DEFAULT NULL;

-- Extend treatment records table for enhanced functionality
ALTER TABLE scp_treatment_record ADD COLUMN location TEXT[] DEFAULT '{}';
ALTER TABLE scp_treatment_record ADD COLUMN custom_location VARCHAR(255);
```

### API Endpoints to Add

- `/patients/:id/missing-appointments` - Track and update missing appointments streak
- `/attendances/:id/mark-absence` - Mark attendance as absence with justification
- `/patients/:id/status-history` - Get patient status change history
- `/attendances/end-of-day` - Finalize attendance day and process absences
- `/treatment-recommendations` - Enhanced medical recommendations with scheduling

### Frontend Components to Create

1. **Patient Forms**:

   - `NewPatientCheckInForm` - First-time patient check-in
   - `PatientEditForm` - General patient data editing
   - `UnscheduledPatientForm` - Walk-in patient registration

2. **Treatment Forms**:

   - `SpiritualConsultationForm` - Post-consultation treatment form
   - `TreatmentRecommendations` - LightBath/Rod recommendation and scheduling
   - `BodyLocationSelector` - Body location selection with predefined options

3. **Attendance Management**:

   - `EndOfDayModal` - Day finalization workflow
   - `AbsenceJustificationForm` - Handle patient absences

4. **Enhanced Components**:
   - `Switch` - Modern toggle component (if not exists)
   - Enhanced location management system

## 🎯 **Immediate Next Steps (Week 1)**

1. **Start with Backend Foundation**:

   - Add 'N' to TreatmentStatus enum
   - Add missing_appointments_streak column to patient table
   - Add absence tracking columns to attendance table
   - Update all related DTOs and API responses

2. **Create New Patient Check-In Flow**:

   - Enhance drag-and-drop logic to detect new patients (status = 'N')
   - Create NewPatientCheckInForm component
   - Integrate with existing PatientEditModal pattern

3. **Update NewAttendanceForm**:

   - Ensure new scheduled patients default to status = 'N'
   - Update patient creation to include missing_appointments_streak = 0

4. **Create Comprehensive Tests**:
   - Test new patient detection logic
   - Test form validation for new status
   - Test drag-and-drop with new patient status

## Success Metrics

- **Code Coverage**: Maintain >45% (currently 47%+)
- **Test Success**: Maintain 100% pass rate (currently 279/279)
- **Type Safety**: Zero `any` types in new implementations
- **Performance**: No regression in drag-and-drop responsiveness
- **User Experience**: Seamless integration with existing workflows
- **Component Responsibility**: Clear separation of concerns between forms and components

## Architecture Compatibility

- ✅ **Context System**: Easily accommodates new treatment types and patient statuses
- ✅ **API Layer**: Snake/camel case conversion supports new fields
- ✅ **Testing Framework**: 279 tests provide solid foundation for extensions
- ✅ **Type System**: Frontend/backend type alignment ready for extensions
- ✅ **Component Architecture**: Existing patterns support specialized form creation

## Implementation Order

1. **Start with Phase 1 (Backend Foundation)** - Critical infrastructure for all other phases
2. **Progress to Phase 2 (Patient Forms)** - Core user workflow improvements
3. **Implement Phase 3 (Treatment Hierarchy)** - Business logic implementation
4. **Deploy Phase 4 (Enhanced Architecture)** - Component responsibility separation
5. **Complete Phase 5 (End-of-Day Workflow)** - Complete business process automation

## 🚀 **Architectural Benefits**

1. **Clear Separation of Concerns**: Each form has a specific purpose and responsibility
2. **Maintainable Code**: Easy to add new features without breaking existing functionality
3. **Scalable Pattern**: Component structure supports future business rule additions
4. **Type Safety**: Full TypeScript coverage for all new features
5. **Test Coverage**: Automated tests ensure reliability during development

## Notes

- Each phase is designed to be independent while building upon existing architecture
- All new components must include comprehensive unit tests
- Follow existing patterns for API integration and context management
- Maintain backward compatibility with existing attendance workflows
- Document all new patterns in copilot-instructions.md
- **Addresses main concern**: Component responsibility confusion resolved through specialized components

---

**Created**: August 21, 2025
**Updated**: August 27, 2025
**Status**: Ready for implementation - Phase 1 (Backend Foundation)
**Next Action**: Implement Backend Foundation (TreatmentStatus enum + database schema updates)
