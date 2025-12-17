# Healthcare Management System – Frontend

**Healthcare Management System** is a volunteer project supporting a local community in Brazil to manage attendances and treatments in a spiritual center. The goal is to improve organization and care for all participants.

The project began with a comprehensive requirements document, written from a project manager’s perspective, detailing business rules, page responsibilities, and data needs. This document was provided to GitHub Copilot, which analyzed the requirements and generated an initial implementation plan using React, TypeScript, and Next.js, including unit tests. This ensured the architecture and features were closely aligned with real-world needs and professional standards.

The [backend project](https://github.com/ammtsz/scp_backend) is developed in parallel, providing the server-side foundation and API for this system.

This project is also a real-world experiment in leveraging AI coding agents (GitHub Copilot) to accelerate development and test the boundaries of prompt-driven engineering.

---

## 🚀 Project Story & AI Agent Experience

The initial goal was to see how far an AI agent could take a complex frontend project using only prompts. In just three days, I created three functional pages packed with features and modern UI, but all without backend integration. Adding new features and beautiful designs was incredibly fast and easy—just prompt and go.

As backend integration started, the project entered a new phase of complexity. Refactoring became essential: components needed cleaning, responsibilities became unclear, code duplication and dead code appeared, and broken features multiplied. Whenever a prompt requested a bigger feature, the agent implemented a lot of new code, sometimes breaking tests and only fixing a few of them.

I learned that while AI agents supercharge productivity, they don’t replace the clarity and simplicity of well-structured, human-written code. The agent never proactively suggested architectural improvements, so I sometimes forgot to implement tools I was used to (e.g., Redux or Zustand instead of React Context). I now ask the agent to analyze code and suggest pros/cons before implementing, which has made development more efficient and balanced.

Currently, I am coding more myself, regaining control over component responsibilities and project structure. The project is mostly functional, but some features and designs need fixing, and there’s still much to implement, code to clean, and complexities to be removed. Copilot agents remain a powerful tool—especially for rapid prototyping and productivity—but human oversight is essential for maintainability and code quality.

---

## 🛠 Technologies Used

- **Frontend**: Next.js 14+, React 18+, TypeScript (strict), TailwindCSS
- **Backend**: NestJS (TypeScript), PostgreSQL, TypeORM
- **Testing**: Jest, React Testing Library (592+ tests, 52 test suites)
- **State Management**: React Context (considering Redux/Zustand for future)
- **API Integration**: Axios, automatic snake_case ↔ camelCase conversion

---

## ✨ Key Features

- **Drag & Drop Attendance Management**: Real-time status updates with backend sync
- **Priority Queue System**: Patient prioritization (Emergency=1, Intermediate=2, Normal=3)
- **Multi-Type Attendances**: Spiritual and Light Bath treatments with tabbed forms
- **Treatment Session Management**: Complete treatment session recording and progress tracking
- **Day Finalization System**: Complete workflow control with undo functionality
- **Unscheduled Patients**: Walk-in patient registration and attendance with full backend integration
- **Spiritual Consultation Workflow**: Treatment planning and recommendations
- **Modern UI Components**: Switches, multiselect components, tabbed modals, loading fallbacks
- **Performance Optimization**: Route-level code splitting with 24% bundle size reduction
- **Timezone Support**: Full timezone integration with intelligent browser detection
- **Form Validation & UX**: Comprehensive validation with real-time feedback, Enter key prevention, and intelligent form controls
- **Backend Synchronization**: Automatic API calls for status changes with proper timestamps

---

## 🧪 Testing & Quality

- **Comprehensive test suite**: 3151+ tests across 165 test suites with 99.9% pass rate
- **Enhanced coverage**: 90.96% statements, 78.08% branches, 88.51% functions, 91.26% lines
- **Unit & Integration Tests**: Focus on component, hook, and API behavior
- **Standardized test organization**: All tests in `__tests__` folders for consistency
- **Recent enhancements**:
  - **AttendanceSections.tsx**: Comprehensive unit tests with 38 test cases covering all functionality
  - Component rendering, section management, drag-and-drop, accessibility, and error handling
  - Mock implementations following project patterns with proper TypeScript typing
  - 100% statement/function coverage, 90.9% branch coverage for AttendanceSections component
- **Testing tools**: Jest with React Testing Library, factory functions for test data
- **Advanced patterns**: Mocked dependencies, edge case testing, accessibility verification

Run all tests:

```bash
npm test
```

## 🚦 How to Run the Project

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Open your browser** and go to [http://localhost:3000](http://localhost:3000)

> **Note:** The project requires the backend API to be running. See [scp_backend](https://github.com/ammtsz/scp_backend) for backend setup instructions.

---

## 📁 Project Structure

```bash
src/
├── api/          # Backend integration layer with type transformers
├── app/          # Next.js app directory (routing, pages)
├── components/   # Reusable UI components with co-located tests
│   └── __tests__ # Standardized test organization
├── contexts/     # React context providers (Attendances, Patients, Agenda, Timezone)
├── hooks/        # Custom React hooks (specialized, single-responsibility)
├── types/        # TypeScript type definitions (unified modern types)
├── utils/        # Utility functions and transformers
└── docs/         # Project documentation and implementation guides
```

---

## 🏗 Architecture Highlights

- **Specialized Hooks Architecture**: Single-responsibility hooks replacing monolithic patterns
  - `useDragAndDrop`: Drag & drop operations with backend sync
  - `useModalManagement`: Patient and treatment modal workflows
  - `useAttendanceWorkflow`: Day finalization and UI state management
  - `useExternalCheckIn`: External check-in processing
- **Service Layer Pattern**: Business logic separated into service classes (AttendanceService, PatientService)
- **Modern Type System**: Unified TypeScript types with both legacy I-prefix and modern type support
- **Performance Optimized**: Route-level lazy loading with LoadingFallback component
- **Multiselect Components**: Advanced body location selector with search functionality
- **Tabbed Modal System**: Reusable tabbed interface for complex forms with validation
- **Timezone Integration**: Global timezone support with intelligent browser detection

---

## 📈 Current Status & Next Steps

- **Stable codebase**: 3151+ tests passing across 165 test suites with enhanced component coverage
- **Type system modernization**: Successfully completed migration to unified modern TypeScript types
- **Enhanced testing suite**: Recent addition of comprehensive AttendanceSections tests with 38 test cases
- **Performance optimized**: 24% bundle size reduction through route-level code splitting
- **Core features complete**: Drag-and-drop, day finalization, timezone support, multiselect components
- **Recent achievements**:
  - Fixed all compilation errors and test failures
  - Implemented specialized hooks architecture
  - Added comprehensive timezone integration
  - Created reusable tabbed modal system
- **Ongoing development**: UI/UX improvements, additional features, and mobile responsiveness
- **Architecture evolution**: Balanced AI agent assistance with manual code quality oversight

```

```
