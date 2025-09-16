import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TabbedModal, { TabDefinition, canSubmitForm } from "../TabbedModal";

// Mock BaseModal
jest.mock("../../BaseModal", () => {
  return function MockBaseModal({
    children,
    title,
    subtitle,
    isOpen,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    isOpen: boolean;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="base-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-subtitle">{subtitle}</div>
        {children}
      </div>
    );
  };
});

describe("TabbedModal", () => {
  const mockTabs: TabDefinition[] = [
    {
      id: "tab1",
      label: "Tab 1",
      icon: "📋",
      isValid: true,
    },
    {
      id: "tab2",
      label: "Tab 2",
      icon: "🍎",
      hasWarning: true,
    },
    {
      id: "tab3",
      label: "Tab 3",
      icon: "💡",
      // Neither isValid nor hasWarning - this will be invalid
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Modal",
    subtitle: "Test subtitle",
    tabs: mockTabs,
    activeTab: "tab1",
    onTabChange: jest.fn(),
    children: <div>Test content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal with tabs and content", () => {
    render(<TabbedModal {...defaultProps} />);

    expect(screen.getByTestId("modal-title")).toHaveTextContent("Test Modal");
    expect(screen.getByTestId("modal-subtitle")).toHaveTextContent(
      "Test subtitle"
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders all tabs with correct labels and icons", () => {
    render(<TabbedModal {...defaultProps} />);

    expect(screen.getByText("📋")).toBeInTheDocument();
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("🍎")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("shows validation status icons correctly", () => {
    render(<TabbedModal {...defaultProps} />);

    // Tab 1 should show valid checkmark
    const tab1Button = screen.getByRole("button", { name: /tab 1/i });
    expect(tab1Button).toHaveTextContent("✅");

    // Tab 2 should show warning
    const tab2Button = screen.getByRole("button", { name: /tab 2/i });
    expect(tab2Button).toHaveTextContent("⚠️");

    // Tab 3 should show invalid X
    const tab3Button = screen.getByRole("button", { name: /tab 3/i });
    expect(tab3Button).toHaveTextContent("❌");
  });

  it("applies correct styling to active and inactive tabs", () => {
    render(<TabbedModal {...defaultProps} />);

    const tab1Button = screen.getByRole("button", { name: /tab 1/i });
    const tab2Button = screen.getByRole("button", { name: /tab 2/i });

    // Active tab should have blue styling and underline
    expect(tab1Button).toHaveClass(
      "text-blue-600",
      "border-blue-600",
      "bg-blue-50/30"
    );

    // Inactive tab should have gray styling
    expect(tab2Button).toHaveClass("text-gray-500", "border-transparent");
  });

  it("calls onTabChange when clicking different tabs", () => {
    const mockOnTabChange = jest.fn();
    render(<TabbedModal {...defaultProps} onTabChange={mockOnTabChange} />);

    const tab2Button = screen.getByRole("button", { name: /tab 2/i });
    tab2Button.click();

    expect(mockOnTabChange).toHaveBeenCalledWith("tab2");
  });

  it("renders actions when provided", () => {
    const actions = <button data-testid="test-action">Test Action</button>;
    render(<TabbedModal {...defaultProps} actions={actions} />);

    expect(screen.getByTestId("test-action")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<TabbedModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument();
  });

  it("applies correct scroll behavior - tabs fixed, content scrollable", () => {
    render(<TabbedModal {...defaultProps} />);

    // Tab navigation should have flex-shrink-0 (stays fixed)
    const tabNavigation = document.querySelector(".flex-shrink-0.px-6.pt-6");
    expect(tabNavigation).toHaveClass("flex-shrink-0");

    // Tab content should have overflow-y-auto (scrollable)
    const tabContent = document.querySelector(
      ".flex-1.bg-white.px-6.py-6.overflow-y-auto"
    );
    expect(tabContent).toHaveClass("overflow-y-auto", "flex-1");

    // Actions (if present) should have flex-shrink-0 (stays fixed)
    const actions = <button data-testid="test-action">Test Action</button>;
    render(<TabbedModal {...defaultProps} actions={actions} />);

    const actionsContainer = document.querySelector(
      ".flex-shrink-0.bg-gray-50.px-6.py-4"
    );
    expect(actionsContainer).toHaveClass("flex-shrink-0");
  });
});

describe("canSubmitForm helper", () => {
  it("should return true when all tabs are valid", () => {
    const validTabs: TabDefinition[] = [
      { id: "tab1", label: "Tab 1", isValid: true },
      { id: "tab2", label: "Tab 2", isValid: true },
    ];
    expect(canSubmitForm(validTabs)).toBe(true);
  });

  it("should return true when tabs have warnings but no invalid ones", () => {
    const tabsWithWarnings: TabDefinition[] = [
      { id: "tab1", label: "Tab 1", isValid: true },
      { id: "tab2", label: "Tab 2", hasWarning: true },
    ];
    expect(canSubmitForm(tabsWithWarnings)).toBe(true);
  });

  it("should return false when there are invalid tabs", () => {
    const tabsWithInvalid: TabDefinition[] = [
      { id: "tab1", label: "Tab 1", isValid: true },
      { id: "tab2", label: "Tab 2" }, // Neither isValid nor hasWarning = invalid
    ];
    expect(canSubmitForm(tabsWithInvalid)).toBe(false);
  });

  it("should return false when mixed invalid and warning tabs exist", () => {
    const mixedTabs: TabDefinition[] = [
      { id: "tab1", label: "Tab 1", isValid: true },
      { id: "tab2", label: "Tab 2", hasWarning: true },
      { id: "tab3", label: "Tab 3" }, // Invalid
    ];
    expect(canSubmitForm(mixedTabs)).toBe(false);
  });
});
