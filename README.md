# MVP Center

This project is a Next.js front-end using React, TypeScript, TailwindCSS, and unit testing (Jest + Testing Library). It integrates with a NestJS backend API to manage patient attendance workflows.

## Getting Started

1. **Start the backend server** (port 3002):

   ```bash
   cd ../mvp-center-backend
   npm run start:dev
   ```

2. **Start the frontend server** (port 3000):
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Features

### Patient Management

- Create new patients with priority levels
- Search existing patients by name
- Update patient information

### Attendance Management

- **End of Day Workflow**: Complete day finalization with accurate attendance counting
  - Handles incomplete attendances with user choice (complete/reschedule)
  - One-by-one absence justification for scheduled patients
  - **Day Finalization Controls**:
    - "Finalizar Dia" button to complete and disable card editing
    - "Desfinalizar" button to undo finalization and re-enable editing
    - Visual indicators for finalized days with disabled drag functionality
    - LocalStorage persistence for finalization state across sessions
  - **Fixed**: Correctly displays total completed attendances in summary
- **Unscheduled Patients Integration**: Complete backend integration for walk-in patients
  - Create new patients with check-in
  - Schedule existing patients for multiple attendance types
  - Real-time attendance tracking with status updates
- **Spiritual Consultation Workflow**: Treatment planning and recommendations appear only after consultation completion (when dragged to completed column)
- Drag-and-drop workflow management
- Multiple attendance types: Spiritual consultations and Light Bath/Rod treatments
- Status progression: Scheduled → Checked In → In Progress → Completed

### UI Components

- **Switch Component**: Modern toggle switches for better UX
- **Form Controls**: Comprehensive form validation and error handling
- **Responsive Design**: Mobile-friendly interface with TailwindCSS

## Backend Integration

### API Integration

- **Patient API**: Full CRUD operations with validation
- **Attendance API**: Complete lifecycle management
- **Type Safety**: Strict TypeScript integration with backend DTOs
- **Error Handling**: Comprehensive error states and user feedback

### Data Flow

- Frontend types automatically sync with backend enums
- Priority mapping: Frontend ('1', '2', '3') ↔ Backend (EMERGENCY, INTERMEDIATE, NORMAL)
- Attendance types: Frontend ('spiritual', 'lightBath') ↔ Backend (SPIRITUAL, LIGHT_BATH)

## Testing

Run comprehensive test suite:

```bash
npm test
```

### Test Coverage

- **Unit Tests**: Component functionality and hook behavior
- **Integration Tests**: Complete backend API integration
- **Error Handling**: Network failures and validation errors
- **User Interactions**: Form submissions and state management

Current: **560+ tests passing** with comprehensive coverage

## Project Structure

```
src/
├── api/              # Backend integration layer
├── components/       # Reusable UI components
│   └── AttendanceManagement/
│       ├── hooks/    # Specialized React hooks for attendance features
│       ├── services/ # Business logic services (AttendanceService, PatientService)
│       └── components/ # UI components
├── contexts/         # React context providers
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Architecture

### Hooks Architecture

The project uses a **specialized hooks pattern** for clean separation of concerns:

- **useDragAndDrop**: Handles drag & drop operations, confirmations, multi-section logic
- **useModalManagement**: Manages patient edit modals, treatment form modals
- **useAttendanceWorkflow**: Day finalization, UI state, completion/rescheduling workflows
- **useExternalCheckIn**: Processes external check-in functionality from props
- **useAttendanceData**: Centralized data fetching and state management
- **useAttendanceForm**: Form state and validation logic
- **useTreatmentWorkflow**: Treatment-specific workflows and actions
- **useNewPatientCheckIn**: New patient registration and check-in flows

### Service Layer

Business logic is separated into service classes:

- **AttendanceService**: Centralized attendance operations (create, update, delete, check-in)
- **PatientService**: Patient management operations
- **TreatmentService**: Treatment-related business logic

This architecture replaces the previous monolithic hook approach with focused, testable, and maintainable components.

## Development Guidelines

- Follow established patterns in `copilot-instructions.md`
- Maintain 100% test pass rate
- Use TypeScript strictly (no `any` types)
- All new features require unit tests
- Keep commit messages concise (1-4 lines max)

---

For more details, see the PDF 'Automatização no processo de atendimento'.
