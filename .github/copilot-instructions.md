<!-- Use this file to provide ### Testing Requirements
### Automated Development Process

- **AUTOMATICALLY create unit tests** for every new feature or change without being asked
- **AUTOMATICALLY update README.md** when adding new features, changing architecture, or updating dependencies
- **AUTOMATICALLY update this copilot-instructions.md** when establishing new patterns, conventions, or architectural decisions
- **AUTOMATICALLY document new patterns** in the appropriate sections below

### Code Quality Standards

- Maintain 100% test pass rate (currently 279/279 tests passing)
- Use TypeScript strictly - avoid `any` types
- Follow existing patterns for API transformations
- Keep console.log statements out of production code
- Remove unused imports and duplicate files

### Testing Requirements

- **AUTOMATICALLY create comprehensive unit tests for ALL new features/changes** without being asked
- **All test files must be placed in `__tests__` folders** for standardized organization
- Use factory functions for test data (`createMockAttendancesByDate`)
- Test edge cases, error states, and drag-drop functionality
- Maintain test coverage above 45%
- Follow naming convention: `ComponentName.test.tsx` or `functionName.test.ts`
- Create tests immediately after implementing any new component, function, or feature
- Update existing tests when modifying functionality

### Documentation Requirements

- **AUTOMATICALLY update README.md** when implementing new features or architectural changes
- **AUTOMATICALLY update copilot-instructions.md** when establishing new patterns or conventions
- Document API changes, new components, and architectural decisions
- Keep feature lists and tech stack information current
- Update installation and setup instructions when dependencies change
- Maintain accurate project status and roadmap information

### Pattern Documentation Requirements

- **AUTOMATICALLY document new coding patterns** in this file when they emerge
- **AUTOMATICALLY update existing patterns** when they evolve
- Document new file organization conventions
- Record new testing patterns and utilities
- Update backend integration patterns when API changes occur
- Maintain current examples of established patterns

### Backend Integration Patterns

- Use `attendanceSync.ts` for all status updates
- Follow snake_case → camelCase conversion via `apiTransformers.ts`
- Include `attendanceId` and `patientId` in types for backend tracking
- Handle API errors gracefully with user-friendly messages
- Use existing utility functions from `/src/utils/` to avoid code duplication
- **Status Transitions**: Backend now supports bidirectional status transitions:
  - `checked_in` ↔ `scheduled` (moving back/forward)
  - `checked_in` → `completed` (direct completion)
  - `completed` → `checked_in` (reopening)
  - `cancelled` → `scheduled` (rescheduling)

### File Organization

- API calls: `/src/api/`
- Components: `/src/components/` with co-located tests in `__tests__/` folders
- Contexts: `/src/contexts/`
- Types: `/src/types/globals.ts` (legacy) and `/src/api/types/frontend.ts` (new)
- Utils: `/src/utils/` for transformers and business rules
- **Tests**: All test files organized in `__tests__/` folders within their respective directories
- **Forms**: Two main attendance forms:
  - `NewAttendanceForm`: Core form component with all logic
  - `NewAttendanceFormModal`: Modal wrapper for the form with error handlingpace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MVP Center - Frontend Project Instructions

## Project Overview

This is a Next.js healthcare attendance management system with React, TypeScript, TailwindCSS, and comprehensive Jest testing. The system addresses automation in healthcare attendance processes with full integration to a Nest.js backend.

## Tech Stack & Architecture

- **Frontend**: Next.js 14+ with React 18+, TypeScript, TailwindCSS
- **Backend Integration**: Nest.js with PostgreSQL via TypeORM
- **State Management**: React Context (AttendancesContext, PatientsContext, AgendaContext)
- **Testing**: Jest with 279+ tests, 47%+ coverage, React Testing Library
- **API Layer**: Axios with automatic snake_case ↔ camelCase conversion

## Key Features Implemented

- **Drag & Drop Attendance Management**: Real-time status updates with backend sync
- **Priority Queue System**: Patient prioritization (Emergency=1, Intermediate=2, Normal=3)
- **Multi-Type Attendances**: Spiritual and Light Bath treatments
- **Status Progression**: Scheduled → Checked In → In Progress → Completed
- **Backend Synchronization**: Automatic API calls for status changes with proper timestamps
- **Day Finalization System**: Complete workflow control with undo functionality
  - "Finalizar Dia" button to disable editing and lock cards
  - "Desfinalizar" button to undo finalization and re-enable editing
  - Visual feedback with opacity changes and disabled state indicators
  - LocalStorage persistence for finalization state across page refreshes
  - Prop drilling architecture for consistent state propagation
- **Unscheduled Patients**: Complete backend integration for walk-in patients
  - New patient creation with immediate check-in
  - Existing patient attendance scheduling
  - Multiple attendance type support
  - Error handling and validation
- **Spiritual Consultation Workflow**: Treatment planning and recommendations (spiritual consultation section) should only appear after consultation completion, not during initial walk-in registration
- **Switch Component**: Modern toggle interface replacing checkboxes
- **Form Management**: Comprehensive validation and error states

## Development Guidelines

### Automated Development Process

- **AUTOMATICALLY create unit tests** for every new feature or change without being asked
- **AUTOMATICALLY update README.md** when adding new features, changing architecture, or updating dependencies
- **AUTOMATICALLY update this copilot-instructions.md** when establishing new patterns, conventions, or architectural decisions
- **AUTOMATICALLY document new patterns** in the appropriate sections below

### Code Quality Standards

- Maintain 100% test pass rate (currently 279/279 tests passing)
- Use TypeScript strictly - avoid `any` types
- Follow existing patterns for API transformations
- Keep console.log statements out of production code
- Remove unused imports and duplicate files

### Testing Requirements

- Write comprehensive tests for all new features
- Use factory functions for test data (`createMockAttendancesByDate`)
- Test edge cases, error states, and drag-drop functionality
- Maintain test coverage above 80%

### Documentation Requirements

- **AUTOMATICALLY update README.md** when implementing new features or architectural changes
- **AUTOMATICALLY update copilot-instructions.md** when establishing new patterns or conventions
- Document API changes, new components, and architectural decisions
- Keep feature lists and tech stack information current
- Update installation and setup instructions when dependencies change
- Maintain accurate project status and roadmap information

### Pattern Documentation Requirements

- **AUTOMATICALLY document new coding patterns** in this file when they emerge
- **AUTOMATICALLY update existing patterns** when they evolve
- Document new file organization conventions
- Record new testing patterns and utilities
- Update backend integration patterns when API changes occur
- Maintain current examples of established patterns

### Backend Integration Patterns

- Use `attendanceSync.ts` for all status updates
- Follow snake_case → camelCase conversion via `apiTransformers.ts`
- Include `attendanceId` and `patientId` in types for backend tracking
- Handle API errors gracefully with user-friendly messages

### File Organization

- API calls: `/src/api/`
- Components: `/src/components/` with co-located tests in `__tests__/` folders
- Contexts: `/src/contexts/`
- Types: `/src/types/globals.ts` (legacy) and `/src/api/types/frontend.ts` (new)
- Utils: `/src/utils/` for transformers and business rules
- **Tests**: All test files organized in `__tests__/` folders within their respective directories

### Commit Standards

- Check diffs before committing: `git diff --cached`
- Write concise messages (1-4 lines max)
- Format: `feat/fix/refactor: brief description`
- Include main feature changes in commit message
- **ALWAYS check all changed files** to identify the primary feature/fix/change
- **Tests are secondary**: Only mention tests in commit messages if the commit exclusively contains test changes
- **Prioritize features over tests**: New features, fixes, and functional changes should be the focus of commit messages
- **Use bullet points only for major changes**: Otherwise write a simple paragraph with 1-2 lines maximum

## Current Status

- ✅ Full drag-and-drop system with backend sync
- ✅ Comprehensive test suite (18/18 suites passing, 280+ tests)
- ✅ Standardized test organization (all tests in `__tests__/` folders)
- ✅ Case conversion system for API integration
- ✅ Priority queue management
- ✅ Multi-section modal handling
- ✅ Dedicated walk-in patient form with enhanced UX
- ✅ Simplified modal-based forms using utility functions
- ✅ Code deduplication through centralized utilities
- ✅ **Bidirectional status transitions**: Backend and frontend support for flexible attendance workflow management
- ✅ **TreatmentWorkflowButtons**: Enhanced component with "Move to Scheduled" functionality
- 🔄 Ongoing: Migration from legacy types to new API types
