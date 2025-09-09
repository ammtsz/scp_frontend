/\*\*

- AttendanceManagement Module - Updated Organization Summary
-
- The module has been reorganized with a service layer architecture to improve
- maintainability and reduce code duplication.
-
- NEW STRUCTURE SUMMARY:
- ======================
-
- SERVICES LAYER (✅ COMPLETED):
- - attendanceService.ts - Attendance CRUD operations
- - patientService.ts - Patient operations and validation
- - treatmentService.ts - Treatment workflows
-
- HOOKS LAYER (🔄 IN PROGRESS):
- - useAttendanceData.ts - ✅ Consolidated data management
- - useAttendanceForm.ts - ✅ Form management for attendance creation
- - useAttendanceDragDrop.ts - 🔄 Drag & drop operations (in progress)
- - useTreatmentWorkflow.ts - Existing treatment workflows
- - useAttendanceManagement.ts - Legacy hook (to be refactored)
-
- BENEFITS:
- =========
- ✅ Separation of concerns (business logic vs React state)
- ✅ Reduced code duplication
- ✅ Improved testability
- ✅ Better developer experience with barrel exports
- ✅ Easier maintenance and refactoring
-
- IMPORT EXAMPLES:
- ================
- // Services (business logic)
- import { AttendanceService, PatientService } from '@/components/AttendanceManagement/services';
-
- // Hooks (React state management)
- import { useAttendanceData, useAttendanceForm } from '@/components/AttendanceManagement/hooks';
  \*/

// For now, export existing structure plus new additions
export _ from './hooks';
export _ from './services';
export _ from './components/AttendanceColumn';
export _ from './components/AttendanceCard';
export \* from './types';
