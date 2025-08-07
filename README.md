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

- **Unscheduled Patients Integration**: Complete backend integration for walk-in patients
  - Create new patients with check-in
  - Schedule existing patients for multiple attendance types
  - Real-time attendance tracking with status updates
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

Current: **279/279 tests passing** (100% pass rate)

## Project Structure

```
src/
├── api/              # Backend integration layer
├── components/       # Reusable UI components
├── contexts/         # React context providers
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Development Guidelines

- Follow established patterns in `copilot-instructions.md`
- Maintain 100% test pass rate
- Use TypeScript strictly (no `any` types)
- All new features require unit tests
- Keep commit messages concise (1-4 lines max)

---

For more details, see the PDF 'Automatização no processo de atendimento'.
