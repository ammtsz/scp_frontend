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
- **Testing**: Jest, React Testing Library (280+ tests)
- **State Management**: React Context (considering Redux/Zustand for future)
- **API Integration**: Axios, automatic snake_case ↔ camelCase conversion

---

## ✨ Key Features

- **Rapid prototyping with AI agent**: 3 feature-rich pages in 3 days
- **Patient Management**: Create, search, and update patients with priority levels
- **Attendance Management**: End-of-day workflow, absence justification, drag-and-drop status updates
- **Unscheduled Patients**: Walk-in patient registration and attendance
- **Spiritual Consultation Workflow**: Treatment planning post-consultation
- **Modern UI Components**: Switches, forms, responsive design (in-progress)
- **Backend Integration**: Real-time status sync, error handling, strict type safety

---

## 🧪 Testing & Quality

- **Comprehensive test suite**: 280+ frontend tests, but coverage fluctuates due to rapid agent-driven changes
- **Unit & Integration Tests**: Focus on component, hook, and API behavior
- **Testing Lessons**: Automated tests are vital, but must be maintained alongside feature development

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
├── api/          # Backend integration layer
├── app/          # Next.js app directory (routing, pages)
├── components/   # Reusable UI components
├── contexts/     # React context providers
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
```

---

## 🏗 Architecture Highlights

- **Specialized Hooks**: Single-responsibility hooks for drag-and-drop, modals, workflows, and data management
- **Service Layer**: Business logic separated into service classes for maintainability
- **Modern UI**: Responsive design with ongoing improvements for mobile-friendliness using TailwindCSS

---

## 📈 Current Status & Next Steps

- **Mostly functional**: Core features work, but some designs and features need fixing
- **Ongoing development**: Refactoring, bug fixes, and new features in progress
- **Improved workflow**: Now balancing agent-driven coding with manual oversight for better code quality

```

```
