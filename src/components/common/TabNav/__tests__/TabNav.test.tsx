import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";
import TabNav from "../index";

// Mock Next.js usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    className,
    "aria-current": ariaCurrent,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    "aria-current"?:
      | "page"
      | "step"
      | "location"
      | "date"
      | "time"
      | "true"
      | "false";
  }) {
    return (
      <a href={href} className={className} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("TabNav Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all navigation tabs", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      expect(screen.getByText("Atendimentos")).toBeInTheDocument();
      expect(screen.getByText("Agenda")).toBeInTheDocument();
      expect(screen.getByText("Pacientes")).toBeInTheDocument();
    });

    it("should render tabs as links with correct hrefs", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      expect(screen.getByText("Atendimentos").closest("a")).toHaveAttribute(
        "href",
        "/attendance"
      );
      expect(screen.getByText("Agenda").closest("a")).toHaveAttribute(
        "href",
        "/agenda"
      );
      expect(screen.getByText("Pacientes").closest("a")).toHaveAttribute(
        "href",
        "/patients"
      );
    });

    it("should have proper navigation structure", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass("w-full", "flex", "flex-row", "sticky", "top-0");
    });
  });

  describe("Active State", () => {
    it("should mark attendance tab as active when on attendance page", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const attendanceTab = screen.getByText("Atendimentos").closest("a");
      expect(attendanceTab).toHaveClass("active");
      expect(attendanceTab).toHaveAttribute("aria-current", "page");
    });

    it("should mark agenda tab as active when on agenda page", () => {
      mockUsePathname.mockReturnValue("/agenda");

      render(<TabNav />);

      const agendaTab = screen.getByText("Agenda").closest("a");
      expect(agendaTab).toHaveClass("active");
      expect(agendaTab).toHaveAttribute("aria-current", "page");
    });

    it("should mark patients tab as active when on patients page", () => {
      mockUsePathname.mockReturnValue("/patients");

      render(<TabNav />);

      const patientsTab = screen.getByText("Pacientes").closest("a");
      expect(patientsTab).toHaveClass("active");
      expect(patientsTab).toHaveAttribute("aria-current", "page");
    });

    it("should mark patients tab as active when on nested patients routes", () => {
      mockUsePathname.mockReturnValue("/patients/123");

      render(<TabNav />);

      const patientsTab = screen.getByText("Pacientes").closest("a");
      expect(patientsTab).toHaveClass("active");
      expect(patientsTab).toHaveAttribute("aria-current", "page");
    });

    it("should only have one active tab at a time", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const activeTabs = screen
        .getAllByRole("link")
        .filter((link) => link.classList.contains("active"));
      expect(activeTabs).toHaveLength(1);
      expect(activeTabs[0]).toHaveTextContent("Atendimentos");
    });
  });

  describe("Inactive State", () => {
    it("should not mark inactive tabs with active class", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const agendaTab = screen.getByText("Agenda").closest("a");
      const patientsTab = screen.getByText("Pacientes").closest("a");

      expect(agendaTab).not.toHaveClass("active");
      expect(patientsTab).not.toHaveClass("active");

      expect(agendaTab).not.toHaveAttribute("aria-current");
      expect(patientsTab).not.toHaveAttribute("aria-current");
    });
  });

  describe("Styling", () => {
    it("should apply base styling classes to all tabs", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const tabs = screen.getAllByRole("link");
      tabs.forEach((tab) => {
        expect(tab).toHaveClass("tab-button", "flex-1", "text-center");
      });
    });

    it("should apply shadow-based container styling", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const container = screen.getByRole("navigation").querySelector("div");
      expect(container).toHaveClass("flex", "w-full", "bg-gray-50", "relative");
    });

    it("should have sticky navigation positioning", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("sticky", "top-0", "z-20");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for active tab", () => {
      mockUsePathname.mockReturnValue("/patients");

      render(<TabNav />);

      const activeTab = screen.getByText("Pacientes").closest("a");
      expect(activeTab).toHaveAttribute("aria-current", "page");
    });

    it("should not have aria-current for inactive tabs", () => {
      mockUsePathname.mockReturnValue("/patients");

      render(<TabNav />);

      const attendanceTab = screen.getByText("Atendimentos").closest("a");
      const agendaTab = screen.getByText("Agenda").closest("a");

      expect(attendanceTab).not.toHaveAttribute("aria-current");
      expect(agendaTab).not.toHaveAttribute("aria-current");
    });

    it("should have navigation landmark", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have keyboard accessible links", () => {
      mockUsePathname.mockReturnValue("/attendance");

      render(<TabNav />);

      const tabs = screen.getAllByRole("link");
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute("href");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle unknown routes gracefully", () => {
      mockUsePathname.mockReturnValue("/unknown-route");

      render(<TabNav />);

      const tabs = screen.getAllByRole("link");
      const activeTabs = tabs.filter((tab) => tab.classList.contains("active"));

      expect(activeTabs).toHaveLength(0);
    });

    it("should handle empty pathname", () => {
      mockUsePathname.mockReturnValue("");

      render(<TabNav />);

      const tabs = screen.getAllByRole("link");
      const activeTabs = tabs.filter((tab) => tab.classList.contains("active"));

      expect(activeTabs).toHaveLength(0);
    });

    it("should handle root pathname", () => {
      mockUsePathname.mockReturnValue("/");

      render(<TabNav />);

      const tabs = screen.getAllByRole("link");
      const activeTabs = tabs.filter((tab) => tab.classList.contains("active"));

      expect(activeTabs).toHaveLength(0);
    });
  });

  describe("URL Matching", () => {
    it("should match exact routes", () => {
      mockUsePathname.mockReturnValue("/agenda");

      render(<TabNav />);

      expect(screen.getByText("Agenda").closest("a")).toHaveClass("active");
    });

    it("should match nested routes with startsWith logic", () => {
      mockUsePathname.mockReturnValue("/patients/new");

      render(<TabNav />);

      expect(screen.getByText("Pacientes").closest("a")).toHaveClass("active");
    });

    it("should not match partial route names", () => {
      mockUsePathname.mockReturnValue("/attend"); // partial of /attendance

      render(<TabNav />);

      expect(screen.getByText("Atendimentos").closest("a")).not.toHaveClass(
        "active"
      );
    });

    it("should handle route parameters correctly", () => {
      mockUsePathname.mockReturnValue("/patients/123/edit");

      render(<TabNav />);

      expect(screen.getByText("Pacientes").closest("a")).toHaveClass("active");
      expect(screen.getByText("Atendimentos").closest("a")).not.toHaveClass(
        "active"
      );
      expect(screen.getByText("Agenda").closest("a")).not.toHaveClass("active");
    });
  });
});
