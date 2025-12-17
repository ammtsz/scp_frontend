import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { TimezoneProvider, useTimezone } from "../TimezoneContext";
import { TimezoneService } from "../../api/timezone.service";
import { TimezoneAPIResponse, TimezoneInfo } from "../../types/timezone";

// Mock the TimezoneService
jest.mock("../../api/timezone.service", () => ({
  TimezoneService: {
    detectBrowserTimezone: jest.fn(),
    getTimezoneInfo: jest.fn(),
    getCurrentInTimezone: jest.fn(),
    validateTimezone: jest.fn(),
    formatDateTimeInTimezone: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Test component that uses the context
const TestComponent: React.FC = () => {
  const {
    userTimezone,
    serverTimezone,
    detectedTimezone,
    isValidBrowserTimezone,
    supportedTimezones,
    timezoneInfo,
    isLoading,
    error,
    setUserTimezone,
    refreshTimezoneInfo,
    getCurrentTimeInTimezone,
    validateTimezone,
    formatDateInTimezone,
    convertToUserTimezone,
  } = useTimezone();

  return (
    <div>
      <div data-testid="user-timezone">{userTimezone}</div>
      <div data-testid="server-timezone">{serverTimezone.timezone}</div>
      <div data-testid="detected-timezone">{detectedTimezone.timezone}</div>
      <div data-testid="is-valid-browser">
        {isValidBrowserTimezone.toString()}
      </div>
      <div data-testid="supported-timezones">
        {supportedTimezones.join(",")}
      </div>
      <div data-testid="timezone-info">
        {timezoneInfo ? timezoneInfo.timezone : "null"}
      </div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || "null"}</div>

      <button
        onClick={() => setUserTimezone("America/New_York")}
        data-testid="set-timezone-button"
      >
        Set Timezone
      </button>
      <button onClick={refreshTimezoneInfo} data-testid="refresh-button">
        Refresh
      </button>
      <button
        onClick={async () => {
          const info = await getCurrentTimeInTimezone("Europe/London");
          // Remove any existing result first
          const existing = document.querySelector(
            '[data-testid="current-time-result"]'
          );
          if (existing) existing.remove();

          const resultDiv = document.createElement("div");
          resultDiv.setAttribute("data-testid", "current-time-result");
          resultDiv.textContent = info ? info.timezone : "null";
          document.body.appendChild(resultDiv);
        }}
        data-testid="get-current-time-button"
      >
        Get Current Time
      </button>
      <button
        onClick={async () => {
          const isValid = await validateTimezone("Asia/Tokyo");
          // Remove any existing result first
          const existing = document.querySelector(
            '[data-testid="validate-result"]'
          );
          if (existing) existing.remove();

          const resultDiv = document.createElement("div");
          resultDiv.setAttribute("data-testid", "validate-result");
          resultDiv.textContent = isValid.toString();
          document.body.appendChild(resultDiv);
        }}
        data-testid="validate-timezone-button"
      >
        Validate Timezone
      </button>
      <button
        onClick={() => {
          const formatted = formatDateInTimezone("2023-12-20", "14:30", "UTC");
          // Remove any existing result first
          const existing = document.querySelector(
            '[data-testid="format-result"]'
          );
          if (existing) existing.remove();

          const resultDiv = document.createElement("div");
          resultDiv.setAttribute("data-testid", "format-result");
          resultDiv.textContent = formatted;
          document.body.appendChild(resultDiv);
        }}
        data-testid="format-date-button"
      >
        Format Date
      </button>
      <button
        onClick={() => {
          const converted = convertToUserTimezone("2023-12-20", "14:30", "UTC");
          // Remove any existing result first
          const existing = document.querySelector(
            '[data-testid="convert-result"]'
          );
          if (existing) existing.remove();

          const resultDiv = document.createElement("div");
          resultDiv.setAttribute("data-testid", "convert-result");
          resultDiv.textContent = `${converted.date} ${converted.time}`;
          document.body.appendChild(resultDiv);
        }}
        data-testid="convert-date-button"
      >
        Convert Date
      </button>
    </div>
  );
};

// Component to test context usage outside provider
const ComponentWithoutProvider: React.FC = () => {
  try {
    useTimezone();
    return <div data-testid="no-error">No Error</div>;
  } catch (error) {
    return <div data-testid="context-error">{(error as Error).message}</div>;
  }
};

describe("TimezoneContext", () => {
  const mockTimezoneService = TimezoneService as jest.Mocked<
    typeof TimezoneService
  >;

  const defaultServerTimezone: TimezoneInfo = {
    timezone: "America/Sao_Paulo",
    date: "2023-12-20",
    time: "14:30:00",
    offset: -3,
  };

  const defaultDetectedTimezone: TimezoneInfo = {
    timezone: "America/New_York",
    date: "2023-12-20",
    time: "17:30:00",
    offset: -5,
  };

  const mockApiResponse: TimezoneAPIResponse = {
    server: defaultServerTimezone,
    detected: {
      ...defaultDetectedTimezone,
      isValidBrowserTimezone: true,
    },
    supportedTimezones: [
      "America/Sao_Paulo",
      "America/New_York",
      "Europe/London",
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    // Clean up any previous test elements
    const existingResults = document.querySelectorAll(
      '[data-testid$="-result"]'
    );
    existingResults.forEach((el) => el.remove());

    // Setup default mock implementations
    mockTimezoneService.detectBrowserTimezone.mockReturnValue(
      "America/New_York"
    );
    mockTimezoneService.getTimezoneInfo.mockResolvedValue(mockApiResponse);
    mockTimezoneService.getCurrentInTimezone.mockResolvedValue(
      defaultServerTimezone
    );
    mockTimezoneService.validateTimezone.mockResolvedValue({
      timezone: "UTC",
      isValid: true,
      isSupported: true,
      currentDateTime: { date: "2023-12-20", time: "19:30:00" },
      offset: 0,
    });
    mockTimezoneService.formatDateTimeInTimezone.mockReturnValue(
      "2023-12-20 14:30 UTC"
    );

    // Suppress console.error for expected errors in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("Provider Initialization", () => {
    it("should initialize with default values", async () => {
      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      // Initially should show loading state
      expect(screen.getByTestId("is-loading")).toHaveTextContent("true");

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("server-timezone")).toHaveTextContent(
        "America/Sao_Paulo"
      );
      expect(screen.getByTestId("detected-timezone")).toHaveTextContent(
        "America/New_York"
      );
      expect(screen.getByTestId("is-valid-browser")).toHaveTextContent("true");
    });

    it("should detect browser timezone on initialization", async () => {
      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(mockTimezoneService.detectBrowserTimezone).toHaveBeenCalled();
      expect(mockTimezoneService.getTimezoneInfo).toHaveBeenCalledWith(
        "America/New_York"
      );
    });

    it("should use stored timezone from localStorage if available", async () => {
      mockLocalStorage.getItem.mockReturnValue("Europe/London");

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user-timezone")).toHaveTextContent(
        "Europe/London"
      );
      expect(mockTimezoneService.getCurrentInTimezone).toHaveBeenCalledWith(
        "Europe/London"
      );
    });

    it("should use detected timezone if no stored preference and browser timezone is valid", async () => {
      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user-timezone")).toHaveTextContent(
        "America/New_York"
      );
    });

    it("should fallback to server timezone if browser timezone is invalid", async () => {
      const invalidBrowserResponse: TimezoneAPIResponse = {
        ...mockApiResponse,
        detected: {
          ...mockApiResponse.detected,
          isValidBrowserTimezone: false,
        },
      };

      mockTimezoneService.getTimezoneInfo.mockResolvedValue(
        invalidBrowserResponse
      );

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user-timezone")).toHaveTextContent(
        "America/Sao_Paulo"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle initialization errors gracefully", async () => {
      const mockError = new Error("Failed to load timezone info");
      mockTimezoneService.getTimezoneInfo.mockRejectedValue(mockError);

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("error")).toHaveTextContent(
        "Falha ao carregar informações de fuso horário"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to refresh timezone info:",
        mockError
      );
    });

    it("should handle timezone info fetch errors gracefully", async () => {
      mockTimezoneService.getCurrentInTimezone.mockRejectedValue(
        new Error("API Error")
      );

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      // Should fallback to server timezone info
      expect(screen.getByTestId("timezone-info")).toHaveTextContent(
        "America/Sao_Paulo"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to get current timezone info:",
        expect.any(Error)
      );
    });

    it("should handle getCurrentTimeInTimezone errors", async () => {
      mockTimezoneService.getCurrentInTimezone.mockRejectedValue(
        new Error("Network error")
      );

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      const button = screen.getByTestId("get-current-time-button");
      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("current-time-result")).toHaveTextContent(
          "null"
        );
      });

      expect(console.error).toHaveBeenCalledWith(
        "Failed to get current time in timezone:",
        expect.any(Error)
      );
    });
  });

  describe("Context Functions", () => {
    beforeEach(async () => {
      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });
    });

    it("should set user timezone and update localStorage", async () => {
      const newTimezoneInfo: TimezoneInfo = {
        timezone: "America/New_York",
        date: "2023-12-20",
        time: "17:30:00",
        offset: -5,
      };

      mockTimezoneService.getCurrentInTimezone.mockResolvedValue(
        newTimezoneInfo
      );

      const button = screen.getByTestId("set-timezone-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user-timezone")).toHaveTextContent(
          "America/New_York"
        );
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "user-timezone",
        "America/New_York"
      );
      expect(mockTimezoneService.getCurrentInTimezone).toHaveBeenCalledWith(
        "America/New_York"
      );
    });

    it("should refresh timezone info", async () => {
      const button = screen.getByTestId("refresh-button");

      await act(async () => {
        fireEvent.click(button);
      });

      expect(mockTimezoneService.getTimezoneInfo).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it("should get current time in specific timezone", async () => {
      const londonTime: TimezoneInfo = {
        timezone: "Europe/London",
        date: "2023-12-20",
        time: "19:30:00",
        offset: 0,
      };

      mockTimezoneService.getCurrentInTimezone.mockResolvedValue(londonTime);

      const button = screen.getByTestId("get-current-time-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("current-time-result")).toHaveTextContent(
          "Europe/London"
        );
      });

      expect(mockTimezoneService.getCurrentInTimezone).toHaveBeenCalledWith(
        "Europe/London"
      );
    });

    it("should validate timezone", async () => {
      mockTimezoneService.validateTimezone.mockResolvedValue({
        timezone: "Asia/Tokyo",
        isValid: true,
        isSupported: true,
        currentDateTime: { date: "2023-12-21", time: "03:30:00" },
        offset: 9,
      });

      const button = screen.getByTestId("validate-timezone-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("validate-result")).toHaveTextContent("true");
      });

      expect(mockTimezoneService.validateTimezone).toHaveBeenCalledWith(
        "Asia/Tokyo"
      );
    });

    it("should handle validate timezone errors", async () => {
      mockTimezoneService.validateTimezone.mockRejectedValue(
        new Error("Validation failed")
      );

      const button = screen.getByTestId("validate-timezone-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("validate-result")).toHaveTextContent(
          "false"
        );
      });

      expect(console.error).toHaveBeenCalledWith(
        "Failed to validate timezone:",
        expect.any(Error)
      );
    });

    it("should format date in timezone", async () => {
      mockTimezoneService.formatDateTimeInTimezone.mockReturnValue(
        "December 20, 2023 2:30 PM UTC"
      );

      const button = screen.getByTestId("format-date-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("format-result")).toHaveTextContent(
          "December 20, 2023 2:30 PM UTC"
        );
      });

      expect(mockTimezoneService.formatDateTimeInTimezone).toHaveBeenCalledWith(
        "2023-12-20",
        "14:30",
        "UTC"
      );
    });

    it("should convert to user timezone (current implementation returns as-is)", async () => {
      const button = screen.getByTestId("convert-date-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("convert-result")).toHaveTextContent(
          "2023-12-20 14:30"
        );
      });
    });
  });

  describe("Context Hook Error Handling", () => {
    it("should throw error when useTimezone is used outside of provider", () => {
      render(<ComponentWithoutProvider />);

      expect(screen.getByTestId("context-error")).toHaveTextContent(
        "useTimezone must be used within a TimezoneProvider"
      );
    });
  });

  describe("Supported Timezones", () => {
    it("should display default supported timezones", async () => {
      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      const supportedTimezones = screen.getByTestId(
        "supported-timezones"
      ).textContent;
      expect(supportedTimezones).toContain("America/Sao_Paulo");
      expect(supportedTimezones).toContain("America/New_York");
      expect(supportedTimezones).toContain("Europe/London");
    });

    it("should update supported timezones from API response", async () => {
      const customResponse: TimezoneAPIResponse = {
        ...mockApiResponse,
        supportedTimezones: ["Asia/Tokyo", "Australia/Sydney"],
      };

      mockTimezoneService.getTimezoneInfo.mockResolvedValue(customResponse);

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      const supportedTimezones = screen.getByTestId(
        "supported-timezones"
      ).textContent;
      expect(supportedTimezones).toContain("Asia/Tokyo");
      expect(supportedTimezones).toContain("Australia/Sydney");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined browser timezone", async () => {
      mockTimezoneService.detectBrowserTimezone.mockReturnValue(null);

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      expect(mockTimezoneService.getTimezoneInfo).toHaveBeenCalledWith(
        undefined
      );
    });

    it("should handle setUserTimezone with getCurrentInTimezone failure", async () => {
      mockTimezoneService.getCurrentInTimezone.mockRejectedValue(
        new Error("Failed to get timezone")
      );

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      const button = screen.getByTestId("set-timezone-button");

      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByTestId("user-timezone")).toHaveTextContent(
          "America/New_York"
        );
      });

      expect(console.error).toHaveBeenCalledWith(
        "Failed to get current timezone info:",
        expect.any(Error)
      );
    });

    it("should handle missing supportedTimezones in API response", async () => {
      const responseWithoutSupported: TimezoneAPIResponse = {
        server: defaultServerTimezone,
        detected: {
          ...defaultDetectedTimezone,
          isValidBrowserTimezone: true,
        },
        supportedTimezones: [],
      };

      mockTimezoneService.getTimezoneInfo.mockResolvedValue(
        responseWithoutSupported
      );

      render(
        <TimezoneProvider>
          <TestComponent />
        </TimezoneProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
      });

      // Should update to the empty array from the API response
      const supportedTimezones = screen.getByTestId(
        "supported-timezones"
      ).textContent;
      expect(supportedTimezones).toBe("");
    });
  });
});
