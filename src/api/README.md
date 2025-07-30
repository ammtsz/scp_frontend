# Frontend API Layer

This folder contains all the API endpoints and utilities for communicating with the NestJS backend.

## Structure

```
api/
├── index.ts                 # Central exports
├── types.ts                 # TypeScript type definitions
├── lib/
│   └── axios.ts            # Axios configuration
├── patients/
│   └── index.ts            # Patient CRUD operations
├── attendances/
│   └── index.ts            # Attendance management
├── treatment-records/
│   └── index.ts            # Treatment record operations
├── schedule-settings/
│   └── index.ts            # Schedule configuration
└── utils/
    ├── functions.ts        # Utility functions
    └── messages.ts         # Error messages
```

## Usage

### Import from the main API module:

```typescript
import {
  // Patients
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,

  // Attendances
  getAttendances,
  createAttendance,
  checkInAttendance,
  startAttendance,
  completeAttendance,

  // Treatment Records
  getTreatmentRecords,
  createTreatmentRecord,
  updateTreatmentRecord,

  // Schedule Settings
  getScheduleSettings,
  createScheduleSetting,
  getActiveScheduleSettings,

  // Types
  type PatientResponseDto,
  type AttendanceResponseDto,
  type ApiResponse,
  PatientPriority,
  AttendanceStatus,
  AttendanceType,
} from "@/api";
```

### Example Usage:

#### Patient Operations

```typescript
// Get all patients
const { success, value, error } = await getPatients();
if (success && value) {
  console.log("Patients:", value);
}

// Create a new patient
const newPatient = await createPatient({
  name: "John Doe",
  phone: "(11) 99999-9999",
  priority: PatientPriority.NORMAL,
  main_complaint: "Headaches",
});
```

#### Attendance Operations

```typescript
// Create an attendance
const attendance = await createAttendance({
  patient_id: 1,
  type: AttendanceType.SPIRITUAL,
  scheduled_date: "2025-08-01",
  scheduled_time: "14:00",
  notes: "First consultation",
});

// Check in a patient
const checkedIn = await checkInAttendance("1");

// Complete an attendance
const completed = await completeAttendance("1");
```

#### Treatment Records

```typescript
// Create treatment record
const treatment = await createTreatmentRecord({
  attendance_id: 1,
  food: "Avoid dairy products",
  water: "Drink 2L fluidized water daily",
  light_bath: true,
  spiritual_treatment: true,
  return_in_weeks: 2,
});
```

#### Schedule Settings

```typescript
// Get active schedule settings
const { success, value } = await getActiveScheduleSettings();

// Create new schedule
const schedule = await createScheduleSetting({
  day_of_week: 1, // Monday
  start_time: "09:00",
  end_time: "17:00",
  max_concurrent_spiritual: 2,
  max_concurrent_light_bath: 2,
});
```

## Types

### Enums

- `PatientPriority`: NORMAL, IMPORTANT, EMERGENCY
- `TreatmentStatus`: IN_TREATMENT, DISCHARGED, ABANDONED
- `AttendanceType`: SPIRITUAL, LIGHT_BATH
- `AttendanceStatus`: SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED

### Response Types

All API functions return an `ApiResponse<T>` with:

```typescript
interface ApiResponse<T> {
  success: boolean;
  value?: T; // Data when success is true
  error?: string; // Error message when success is false
}
```

### Main DTOs

- `PatientResponseDto` - Patient data from backend
- `AttendanceResponseDto` - Attendance data from backend
- `TreatmentRecordResponseDto` - Treatment record data from backend
- `ScheduleSettingResponseDto` - Schedule setting data from backend

## Configuration

The API is configured to connect to the backend at `http://localhost:3002`. To change this, modify `src/api/lib/axios.ts`.

## Error Handling

All API functions include automatic error handling:

- Network errors are caught and returned as `{ success: false, error: message }`
- HTTP error status codes are mapped to user-friendly messages
- TypeScript ensures type safety across all operations

## Best Practices

1. Always check the `success` property before accessing `value`
2. Handle errors gracefully by displaying the `error` message to users
3. Use TypeScript types for better development experience
4. Import only what you need to keep bundle size small
