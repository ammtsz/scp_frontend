import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeaderCard } from "../HeaderCard";
import { Patient, Priority } from "@/types/types";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1980-05-15"),
  mainComplaint: "Dores de cabeça frequentes",
  status: "A", // Active status
  priority: "2",
  startDate: new Date("2024-01-15"),
  dischargeDate: null,
  timezone: "America/Sao_Paulo",
  nextAttendanceDates: [
    {
      date: new Date("2024-12-28"),
      type: "spiritual",
    },
  ],
  currentRecommendations: {
    date: new Date("2024-12-20"),
    food: "Leve",
    water: "2L/dia",
    ointment: "Aplicar 2x/dia",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [],
};

// Helper function to render with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe("HeaderCard", () => {
  it("renders patient basic information correctly", () => {
    renderWithQueryClient(<HeaderCard patient={mockPatient} />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Dores de cabeça frequentes")).toBeInTheDocument();
  });

  it("displays priority badge with correct text and styling", () => {
    renderWithQueryClient(<HeaderCard patient={mockPatient} />);

    const priorityBadge = screen.getByText("Intermediário");
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveClass(
      "bg-yellow-50",
      "text-yellow-800",
      "border-yellow-200"
    );
  });

  it("calculates and displays age correctly", () => {
    renderWithQueryClient(<HeaderCard patient={mockPatient} />);

    // Calculate expected age (should be 44 as of 2024)
    const expectedAge = new Date().getFullYear() - 1980;
    expect(screen.getByText(`${expectedAge} anos`)).toBeInTheDocument();
  });

  it("renders quick action buttons with correct links", () => {
    renderWithQueryClient(<HeaderCard patient={mockPatient} />);

    const editLink = screen.getByRole("link", { name: /editar/i });
    expect(editLink).toHaveAttribute("href", "/patients/1/edit");

    expect(screen.getByText("📅 Novo Agendamento")).toBeInTheDocument();
    expect(screen.getByText("📄 Exportar")).toBeInTheDocument();
  });

  it("displays priority colors correctly for different priority levels", () => {
    // Test Emergency priority
    const emergencyPatient: Patient = { ...mockPatient, priority: "1" };
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <HeaderCard patient={emergencyPatient} />
      </QueryClientProvider>
    );
    expect(screen.getByText("Emergência")).toHaveClass(
      "bg-red-50",
      "text-red-800",
      "border-red-200"
    );

    // Test Normal priority
    const normalPatient: Patient = { ...mockPatient, priority: "3" };
    rerender(
      <QueryClientProvider client={queryClient}>
        <HeaderCard patient={normalPatient} />
      </QueryClientProvider>
    );
    expect(screen.getByText("Normal")).toHaveClass(
      "bg-green-50",
      "text-green-800",
      "border-green-200"
    );
  });

  it("handles unknown priority gracefully", () => {
    // Since Priority is a union type, we need to cast for testing edge cases
    const unknownPriorityPatient = {
      ...mockPatient,
      priority: "4" as unknown as Priority,
    };
    renderWithQueryClient(<HeaderCard patient={unknownPriorityPatient} />);

    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
