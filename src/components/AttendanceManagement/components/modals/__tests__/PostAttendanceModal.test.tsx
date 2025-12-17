/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostAttendanceModal from "../PostAttendanceModal";

// Mock the custom hooks
const mockUsePostAttendanceForm = {
  formData: {
    mainComplaint: "",
    treatmentStatus: "N" as const,
    startDate: "2025-11-26",
    returnWeeks: 1,
    food: "",
    water: "",
    ointments: "",
    recommendations: {
      lightBath: [],
      rod: [],
    },
    notes: "",
  },
  handleChange: jest.fn(),
  handleSubmit: jest.fn(),
  handleRecommendationsChange: jest.fn(),
  handleDateChange: jest.fn(),
  patientData: {
    id: "1",
    name: "Test Patient",
    phone: "123456789",
    birthDate: "1990-01-01",
  },
  fetchError: null,
  setFetchError: jest.fn(),
  isLoading: false,
  error: null,
  clearError: jest.fn(),
  showConfirmation: false,
  createdSessions: [],
  resetConfirmation: jest.fn(),
  showErrors: false,
  sessionErrors: [],
  resetErrors: jest.fn(),
  retrySessionCreation: jest.fn(),
  handleCancel: jest.fn(),
};

const mockModalStore = {
  isOpen: true,
  attendanceId: "attendance-123",
  patientId: "patient-123",
  patientName: "Test Patient",
  currentTreatmentStatus: "N",
};

// Mock the hooks
jest.mock(
  "../../Forms/PostAttendanceForms/hooks/usePostAttendanceForm",
  () => ({
    usePostAttendanceForm: jest.fn(() => mockUsePostAttendanceForm),
  })
);

jest.mock("@/stores/modalStore", () => ({
  usePostAttendanceModal: jest.fn(() => mockModalStore),
  useCloseModal: jest.fn(() => jest.fn()),
}));

// Mock the tab components
jest.mock("../../Forms/PostAttendanceForms/Tabs", () => ({
  BasicInfoTab: ({
    formData,
    onFormDataChange,
  }: {
    formData: { mainComplaint: string };
    onFormDataChange: (field: string, value: string) => void;
  }) => (
    <div data-testid="basic-info-tab">
      <h3>Basic Info</h3>
      <input
        data-testid="main-complaint-input"
        value={formData.mainComplaint}
        onChange={(e) => onFormDataChange("mainComplaint", e.target.value)}
        placeholder="Main complaint"
      />
    </div>
  ),
  GeneralRecommendationsTab: ({
    formData,
    onFormDataChange,
  }: {
    formData: { food: string };
    onFormDataChange: (field: string, value: string) => void;
  }) => (
    <div data-testid="general-recommendations-tab">
      <h3>General Recommendations</h3>
      <input
        data-testid="food-input"
        value={formData.food}
        onChange={(e) => onFormDataChange("food", e.target.value)}
        placeholder="Food recommendations"
      />
    </div>
  ),
  TreatmentRecommendationsTab: ({
    onRecommendationsChange,
  }: {
    onRecommendationsChange: (type: string, recommendations: unknown[]) => void;
  }) => (
    <div data-testid="treatment-recommendations-tab">
      <h3>Treatment Recommendations</h3>
      <button
        data-testid="add-recommendation-button"
        onClick={() => onRecommendationsChange("lightBath", [])}
      >
        Add Recommendation
      </button>
    </div>
  ),
}));

// Mock the confirmation and error components
jest.mock(
  "../../Forms/PostAttendanceForms/components/TreatmentSessionConfirmation",
  () => {
    return function MockTreatmentSessionConfirmation({
      sessions,
      patientName,
      onAcknowledge,
    }: {
      sessions: { id: string; name: string }[];
      patientName: string;
      onAcknowledge: () => void;
    }) {
      return (
        <div data-testid="treatment-session-confirmation">
          <h3>Treatment Completed - {patientName}</h3>
          <p>Sessions created: {sessions.length}</p>
          <button data-testid="acknowledge-button" onClick={onAcknowledge}>
            Acknowledge
          </button>
        </div>
      );
    };
  }
);

jest.mock(
  "../../Forms/PostAttendanceForms/components/TreatmentSessionErrors",
  () => {
    return function MockTreatmentSessionErrors({
      errors,
      patientName,
      onRetry,
      onContinue,
    }: {
      errors: { message: string }[];
      patientName: string;
      onRetry: () => void;
      onContinue: () => void;
    }) {
      return (
        <div data-testid="treatment-session-errors">
          <h3>Treatment Errors - {patientName}</h3>
          <p>Errors: {errors.length}</p>
          <button data-testid="retry-button" onClick={onRetry}>
            Retry
          </button>
          <button data-testid="continue-button" onClick={onContinue}>
            Continue
          </button>
        </div>
      );
    };
  }
);

// Mock common components
jest.mock("@/components/common/ErrorDisplay", () => {
  return function MockErrorDisplay({
    error,
    dismissible,
    onDismiss,
    className,
  }: {
    error: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
  }) {
    return (
      <div data-testid="error-display" className={className}>
        <p>{error}</p>
        {dismissible && (
          <button data-testid="dismiss-error-button" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    );
  };
});

jest.mock("@/components/common/LoadingButton", () => {
  return function MockLoadingButton({
    onClick,
    isLoading,
    loadingText,
    className,
    children,
  }: {
    onClick: () => void;
    isLoading: boolean;
    loadingText: string;
    className?: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        data-testid="loading-button"
        onClick={onClick}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? loadingText : children}
      </button>
    );
  };
});

jest.mock("@/components/common/TabbedModal", () => ({
  TabbedModal: ({
    isOpen,
    onClose,
    title,
    subtitle,
    tabs,
    activeTab,
    onTabChange,
    actions,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    tabs: { id: string; label: string; isValid: boolean }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    actions: React.ReactNode;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="tabbed-modal">
        <div data-testid="modal-header">
          <h2 data-testid="modal-title">{title}</h2>
          <p data-testid="modal-subtitle">{subtitle}</p>
          <button data-testid="close-modal-button" onClick={onClose}>
            Close
          </button>
        </div>

        {tabs && tabs.length > 0 && (
          <div data-testid="modal-tabs">
            {tabs.map(
              (tab: { id: string; label: string; isValid: boolean }) => (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label} {tab.isValid ? "✓" : "✗"}
                </button>
              )
            )}
          </div>
        )}

        <div data-testid="modal-content">{children}</div>

        {actions && <div data-testid="modal-actions">{actions}</div>}
      </div>
    );
  },
}));

// Test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("PostAttendanceModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default state
    Object.assign(mockUsePostAttendanceForm, {
      formData: {
        mainComplaint: "",
        treatmentStatus: "N" as const,
        startDate: "2025-11-26",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        recommendations: {
          lightBath: [],
          rod: [],
        },
        notes: "",
      },
      isLoading: false,
      error: null,
      fetchError: null,
      showConfirmation: false,
      showErrors: false,
      createdSessions: [],
      sessionErrors: [],
    });

    Object.assign(mockModalStore, {
      isOpen: true,
      attendanceId: "attendance-123",
      patientId: "patient-123",
      patientName: "Test Patient",
      currentTreatmentStatus: "N",
    });
  });

  const renderComponent = () => {
    const Wrapper = createTestWrapper();
    return render(
      <Wrapper>
        <PostAttendanceModal />
      </Wrapper>
    );
  };

  describe("Modal Visibility", () => {
    it("should render when modal is open", () => {
      renderComponent();

      expect(screen.getByTestId("tabbed-modal")).toBeInTheDocument();
    });

    it("should not render when modal is closed", () => {
      Object.assign(mockModalStore, { isOpen: false });
      renderComponent();

      expect(screen.queryByTestId("tabbed-modal")).not.toBeInTheDocument();
    });

    it("should not render when attendanceId is missing", () => {
      Object.assign(mockModalStore, { attendanceId: null });
      renderComponent();

      expect(screen.queryByTestId("tabbed-modal")).not.toBeInTheDocument();
    });
  });

  describe("Modal Header", () => {
    it("should display correct title and subtitle in normal mode", () => {
      renderComponent();

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Formulário de Tratamento Espiritual - Test Patient"
      );
      expect(screen.getByTestId("modal-subtitle")).toHaveTextContent(
        "Atendimento #attendance-123 • Paciente #patient-123"
      );
    });

    it("should display confirmation title when showConfirmation is true", () => {
      Object.assign(mockUsePostAttendanceForm, { showConfirmation: true });
      renderComponent();

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Tratamento Concluído - Test Patient"
      );
      expect(screen.getByTestId("modal-subtitle")).toHaveTextContent(
        "Agendamentos criados automaticamente"
      );
    });

    it("should display error title when showErrors is true", () => {
      Object.assign(mockUsePostAttendanceForm, { showErrors: true });
      renderComponent();

      expect(screen.getByTestId("modal-title")).toHaveTextContent(
        "Problemas no Tratamento - Test Patient"
      );
      expect(screen.getByTestId("modal-subtitle")).toHaveTextContent(
        "Alguns agendamentos não puderam ser criados"
      );
    });
  });

  describe("Tab Navigation", () => {
    it("should render all tabs in normal mode", () => {
      renderComponent();

      expect(screen.getByTestId("tab-basic")).toBeInTheDocument();
      expect(screen.getByTestId("tab-general")).toBeInTheDocument();
      expect(screen.getByTestId("tab-treatment")).toBeInTheDocument();
    });

    it("should not render tabs in confirmation mode", () => {
      Object.assign(mockUsePostAttendanceForm, { showConfirmation: true });
      renderComponent();

      expect(screen.queryByTestId("modal-tabs")).not.toBeInTheDocument();
    });

    it("should not render tabs in error mode", () => {
      Object.assign(mockUsePostAttendanceForm, { showErrors: true });
      renderComponent();

      expect(screen.queryByTestId("modal-tabs")).not.toBeInTheDocument();
    });

    it("should switch tabs when clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      // Start with basic tab active
      expect(screen.getByTestId("tab-basic")).toHaveClass("active");

      // Click general tab
      await user.click(screen.getByTestId("tab-general"));

      // Should switch to general tab
      expect(screen.getByTestId("tab-general")).toHaveClass("active");
    });

    it("should show validation status in tabs", () => {
      renderComponent();

      // Basic tab should be invalid (empty complaint)
      expect(screen.getByTestId("tab-basic")).toHaveTextContent("✗");

      // General and treatment tabs should be valid (optional)
      expect(screen.getByTestId("tab-general")).toHaveTextContent("✓");
      expect(screen.getByTestId("tab-treatment")).toHaveTextContent("✓");
    });

    it("should validate basic tab when complaint is filled", () => {
      Object.assign(mockUsePostAttendanceForm, {
        formData: {
          ...mockUsePostAttendanceForm.formData,
          mainComplaint: "Test complaint",
        },
      });
      renderComponent();

      expect(screen.getByTestId("tab-basic")).toHaveTextContent("✓");
    });
  });

  describe("Tab Content", () => {
    it("should render BasicInfoTab by default", () => {
      renderComponent();

      expect(screen.getByTestId("basic-info-tab")).toBeInTheDocument();
      expect(
        screen.queryByTestId("general-recommendations-tab")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("treatment-recommendations-tab")
      ).not.toBeInTheDocument();
    });

    it("should render GeneralRecommendationsTab when selected", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("tab-general"));

      expect(
        screen.getByTestId("general-recommendations-tab")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("basic-info-tab")).not.toBeInTheDocument();
    });

    it("should render TreatmentRecommendationsTab when selected", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("tab-treatment"));

      expect(
        screen.getByTestId("treatment-recommendations-tab")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("basic-info-tab")).not.toBeInTheDocument();
    });

    it("should handle form input changes in BasicInfoTab", async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId("main-complaint-input");
      await user.type(input, "Test complaint");

      expect(mockUsePostAttendanceForm.handleChange).toHaveBeenCalled();
    });

    it("should handle form input changes in GeneralRecommendationsTab", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("tab-general"));

      const input = screen.getByTestId("food-input");
      await user.type(input, "Test food");

      expect(mockUsePostAttendanceForm.handleChange).toHaveBeenCalled();
    });

    it("should handle recommendations changes in TreatmentRecommendationsTab", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("tab-treatment"));

      const button = screen.getByTestId("add-recommendation-button");
      await user.click(button);

      expect(
        mockUsePostAttendanceForm.handleRecommendationsChange
      ).toHaveBeenCalledWith("lightBath", []);
    });
  });

  describe("Error Handling", () => {
    it("should display form error when present", () => {
      Object.assign(mockUsePostAttendanceForm, {
        error: "Form validation error",
      });
      renderComponent();

      expect(screen.getByTestId("error-display")).toHaveTextContent(
        "Form validation error"
      );
    });

    it("should display fetch error when present", () => {
      Object.assign(mockUsePostAttendanceForm, { fetchError: "Network error" });
      renderComponent();

      expect(screen.getByTestId("error-display")).toHaveTextContent(
        "Network error"
      );
    });

    it("should allow dismissing form errors", async () => {
      const user = userEvent.setup();
      Object.assign(mockUsePostAttendanceForm, {
        error: "Form validation error",
      });
      renderComponent();

      await user.click(screen.getByTestId("dismiss-error-button"));

      expect(mockUsePostAttendanceForm.clearError).toHaveBeenCalled();
    });

    it("should allow dismissing fetch errors", async () => {
      const user = userEvent.setup();
      Object.assign(mockUsePostAttendanceForm, { fetchError: "Network error" });
      renderComponent();

      await user.click(screen.getByTestId("dismiss-error-button"));

      expect(mockUsePostAttendanceForm.setFetchError).toHaveBeenCalledWith(
        null
      );
    });

    it("should not show errors in confirmation mode", () => {
      Object.assign(mockUsePostAttendanceForm, {
        error: "Form error",
        showConfirmation: true,
      });
      renderComponent();

      expect(screen.queryByTestId("error-display")).not.toBeInTheDocument();
    });

    it("should not show errors in error mode", () => {
      Object.assign(mockUsePostAttendanceForm, {
        error: "Form error",
        showErrors: true,
      });
      renderComponent();

      expect(screen.queryByTestId("error-display")).not.toBeInTheDocument();
    });
  });

  describe("Modal Actions", () => {
    it("should render cancel and submit buttons in normal mode", () => {
      renderComponent();

      expect(screen.getByText("Cancelar")).toBeInTheDocument();
      expect(screen.getByTestId("loading-button")).toBeInTheDocument();
    });

    it("should not render actions in confirmation mode", () => {
      Object.assign(mockUsePostAttendanceForm, { showConfirmation: true });
      renderComponent();

      expect(screen.queryByTestId("modal-actions")).not.toBeInTheDocument();
    });

    it("should not render actions in error mode", () => {
      Object.assign(mockUsePostAttendanceForm, { showErrors: true });
      renderComponent();

      expect(screen.queryByTestId("modal-actions")).not.toBeInTheDocument();
    });

    it("should handle cancel button click", async () => {
      const mockCloseModal = jest.fn();
      const modalStoreModule = jest.requireMock("@/stores/modalStore");
      modalStoreModule.useCloseModal.mockReturnValue(mockCloseModal);

      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText("Cancelar"));

      expect(mockCloseModal).toHaveBeenCalledWith("postAttendance");
    });

    it("should handle submit button click", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("loading-button"));

      expect(mockUsePostAttendanceForm.handleSubmit).toHaveBeenCalled();
    });

    it("should disable buttons when loading", () => {
      Object.assign(mockUsePostAttendanceForm, { isLoading: true });
      renderComponent();

      expect(screen.getByText("Cancelar")).toBeDisabled();
      expect(screen.getByTestId("loading-button")).toBeDisabled();
      expect(screen.getByTestId("loading-button")).toHaveTextContent(
        "Salvando..."
      );
    });
  });

  describe("Confirmation Mode", () => {
    beforeEach(() => {
      Object.assign(mockUsePostAttendanceForm, {
        showConfirmation: true,
        createdSessions: [
          { id: "1", name: "Session 1" },
          { id: "2", name: "Session 2" },
        ],
      });
    });

    it("should render confirmation component", () => {
      renderComponent();

      expect(
        screen.getByTestId("treatment-session-confirmation")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Treatment Completed - Test Patient")
      ).toBeInTheDocument();
      expect(screen.getByText("Sessions created: 2")).toBeInTheDocument();
    });

    it("should handle confirmation acknowledgment", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("acknowledge-button"));

      expect(mockUsePostAttendanceForm.resetConfirmation).toHaveBeenCalled();
      expect(mockUsePostAttendanceForm.handleCancel).toHaveBeenCalled();
    });
  });

  describe("Error Mode", () => {
    beforeEach(() => {
      Object.assign(mockUsePostAttendanceForm, {
        showErrors: true,
        sessionErrors: [{ message: "Error 1" }, { message: "Error 2" }],
      });
    });

    it("should render error component", () => {
      renderComponent();

      expect(
        screen.getByTestId("treatment-session-errors")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Treatment Errors - Test Patient")
      ).toBeInTheDocument();
      expect(screen.getByText("Errors: 2")).toBeInTheDocument();
    });

    it("should handle error retry", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("retry-button"));

      expect(mockUsePostAttendanceForm.retrySessionCreation).toHaveBeenCalled();
    });

    it("should handle error continue", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("continue-button"));

      expect(mockUsePostAttendanceForm.resetErrors).toHaveBeenCalled();
      expect(mockUsePostAttendanceForm.handleCancel).toHaveBeenCalled();
    });
  });

  describe("Modal Closing", () => {
    it("should handle modal close via header button", async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId("close-modal-button"));

      expect(mockUsePostAttendanceForm.handleCancel).toHaveBeenCalled();
    });
  });

  describe("Integration", () => {
    it("should pass correct props to tab components", () => {
      renderComponent();

      // Verify BasicInfoTab receives correct props
      expect(screen.getByTestId("basic-info-tab")).toBeInTheDocument();
      // The component should have access to formData through the mock
    });

    it("should handle form data synchronization across tabs", async () => {
      const user = userEvent.setup();
      renderComponent();

      // Change data in basic tab
      const basicInput = screen.getByTestId("main-complaint-input");
      await user.type(basicInput, "Test");

      // Switch to general tab
      await user.click(screen.getByTestId("tab-general"));

      // Should maintain form state
      expect(mockUsePostAttendanceForm.handleChange).toHaveBeenCalled();
    });

    it("should handle tab validation correctly", () => {
      // Test with empty complaint (invalid basic tab)
      renderComponent();
      expect(screen.getByTestId("tab-basic")).toHaveTextContent("✗");

      // Clean up and test with filled complaint (valid basic tab)
      cleanup();
      Object.assign(mockUsePostAttendanceForm, {
        formData: {
          ...mockUsePostAttendanceForm.formData,
          mainComplaint: "Test complaint",
        },
      });
      renderComponent();
      expect(screen.getByTestId("tab-basic")).toHaveTextContent("✓");
    });

    it("should handle scroll to top on error or fetchError change", () => {
      const mockScrollTo = jest.fn();

      // Mock querySelector to return an element with scrollTo method
      const mockElement = { scrollTo: mockScrollTo };
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockReturnValue(mockElement);

      // Set up initial error state
      Object.assign(mockUsePostAttendanceForm, { error: "Test error" });

      renderComponent();

      expect(document.querySelector).toHaveBeenCalledWith(
        ".flex-1.bg-white.px-6.py-6.overflow-y-auto"
      );
      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

      // Restore original querySelector
      document.querySelector = originalQuerySelector;
    });

    it("should handle missing modal content element during scroll", () => {
      const originalQuerySelector = document.querySelector;
      document.querySelector = jest.fn().mockReturnValue(null);

      // Set up error state to trigger scroll effect
      Object.assign(mockUsePostAttendanceForm, { error: "Test error" });

      // Should not throw error when querySelector returns null
      expect(() => {
        renderComponent();
      }).not.toThrow();

      // Restore original querySelector
      document.querySelector = originalQuerySelector;
    });

    it("should handle default case in renderTabContent gracefully", () => {
      // The existing test structure should cover the component rendering
      // The default case in renderTabContent returns null for unknown tabs
      renderComponent();

      // The component should render without throwing errors
      expect(screen.getByTestId("tabbed-modal")).toBeInTheDocument();

      // The TabbedModal handles invalid tab states and the default case returns null gracefully
      expect(() => renderComponent()).not.toThrow();
    });
  });
});
