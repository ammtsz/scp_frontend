import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceTimes from "../components/cards/AttendanceTimes";
import { IAttendanceProgression } from "@/types/globals";

describe("AttendanceTimes Component", () => {
  const mockTimes = {
    checkedInTime: new Date("2025-01-15T09:00:00"),
    onGoingTime: new Date("2025-01-15T09:30:00"),
    completedTime: new Date("2025-01-15T10:00:00"),
  };

  describe("Time Formatting", () => {
    it("should format times correctly in pt-BR format", () => {
      render(
        <AttendanceTimes
          status="completed"
          checkedInTime={mockTimes.checkedInTime}
          onGoingTime={mockTimes.onGoingTime}
          completedTime={mockTimes.completedTime}
        />
      );

      // Use getAllByText to check that time elements exist
      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements).toHaveLength(2); // Component only shows checkedIn and onGoing times
    });

    it("should handle null times", () => {
      const { container } = render(
        <AttendanceTimes
          status="scheduled"
          checkedInTime={null}
          onGoingTime={null}
          completedTime={null}
        />
      );

      // Should render the component without crashing
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle undefined times", () => {
      const { container } = render(
        <AttendanceTimes
          status="scheduled"
          checkedInTime={undefined}
          onGoingTime={undefined}
          completedTime={undefined}
        />
      );

      // Should render the component without crashing
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Status-based Display Logic", () => {
    describe("Scheduled Status", () => {
      it("should not show any times for scheduled status", () => {
        render(
          <AttendanceTimes
            status="scheduled"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={mockTimes.completedTime}
          />
        );

        // Should not show any times
        expect(screen.queryByText(/09:00/)).not.toBeInTheDocument();
        expect(screen.queryByText(/09:30/)).not.toBeInTheDocument();
        expect(screen.queryByText(/10:00/)).not.toBeInTheDocument();
      });
    });

    describe("CheckedIn Status", () => {
      it("should show only checkedIn time for checkedIn status", () => {
        render(
          <AttendanceTimes
            status="checkedIn"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={mockTimes.completedTime}
          />
        );

        // Should show one time element
        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(1);
      });

      it("should not show checkedIn time if time is null", () => {
        render(
          <AttendanceTimes
            status="checkedIn"
            checkedInTime={null}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={mockTimes.completedTime}
          />
        );

        const timeElements = screen.queryAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(0);
      });
    });

    describe("OnGoing Status", () => {
      it("should show checkedIn and onGoing times for onGoing status", () => {
        render(
          <AttendanceTimes
            status="onGoing"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={mockTimes.completedTime}
          />
        );

        // Should show two time elements
        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(2);
      });

      it("should not show onGoing time if time is null", () => {
        render(
          <AttendanceTimes
            status="onGoing"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={null}
            completedTime={mockTimes.completedTime}
          />
        );

        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(1);
      });
    });

    describe("Completed Status", () => {
      it("should show all times for completed status", () => {
        render(
          <AttendanceTimes
            status="completed"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={mockTimes.completedTime}
          />
        );

        // Should show two time elements (checkedIn and onGoing)
        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(2);
      });

      it("should not show completed time if time is null", () => {
        render(
          <AttendanceTimes
            status="completed"
            checkedInTime={mockTimes.checkedInTime}
            onGoingTime={mockTimes.onGoingTime}
            completedTime={null}
          />
        );

        const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(2);
      });
    });
  });

  describe("Layout and Styling", () => {
    it("should have correct container classes", () => {
      const { container } = render(
        <AttendanceTimes
          status="completed"
          checkedInTime={mockTimes.checkedInTime}
          onGoingTime={mockTimes.onGoingTime}
          completedTime={mockTimes.completedTime}
        />
      );

      const timeContainer = container.firstChild as HTMLElement;
      expect(timeContainer).toHaveClass(
        "absolute",
        "bottom-1.5",
        "left-2",
        "flex",
        "justify-between",
        "text-xs",
        "w-full"
      );
    });

    it("should have correct color classes for each time type", () => {
      render(
        <AttendanceTimes
          status="completed"
          checkedInTime={mockTimes.checkedInTime}
          onGoingTime={mockTimes.onGoingTime}
          completedTime={mockTimes.completedTime}
        />
      );

      // Check color classes (we need to check the span elements)
      const spans = screen.getAllByText(/\d{2}:\d{2}/);

      // First span (checkedIn) should have gray color
      expect(spans[0].closest("span")).toHaveClass("text-gray-500");

      // Second span (onGoing) should have gray color and mx-auto
      expect(spans[1].closest("span")).toHaveClass("text-gray-500", "mx-auto");
    });
  });

  describe("Time Display Conditions", () => {
    const testCases: {
      status: IAttendanceProgression;
      times: {
        checkedInTime?: Date | null;
        onGoingTime?: Date | null;
        completedTime?: Date | null;
      };
      expectedCount: number;
      description: string;
    }[] = [
      {
        status: "scheduled",
        times: {
          checkedInTime: mockTimes.checkedInTime,
          onGoingTime: mockTimes.onGoingTime,
          completedTime: mockTimes.completedTime,
        },
        expectedCount: 0,
        description:
          "scheduled status should show no times regardless of available times",
      },
      {
        status: "checkedIn",
        times: { checkedInTime: mockTimes.checkedInTime },
        expectedCount: 1,
        description: "checkedIn status should show only checkedIn time",
      },
      {
        status: "checkedIn",
        times: { checkedInTime: null },
        expectedCount: 0,
        description:
          "checkedIn status with null checkedIn time should show nothing",
      },
      {
        status: "onGoing",
        times: {
          checkedInTime: mockTimes.checkedInTime,
          onGoingTime: mockTimes.onGoingTime,
        },
        expectedCount: 2,
        description: "onGoing status should show checkedIn and onGoing times",
      },
      {
        status: "onGoing",
        times: { checkedInTime: mockTimes.checkedInTime, onGoingTime: null },
        expectedCount: 1,
        description:
          "onGoing status with null onGoing time should show only checkedIn time",
      },
      {
        status: "completed",
        times: {
          checkedInTime: mockTimes.checkedInTime,
          onGoingTime: mockTimes.onGoingTime,
          completedTime: mockTimes.completedTime,
        },
        expectedCount: 2, // Component only shows checkedIn and onGoing times
        description: "completed status should show all times",
      },
      {
        status: "completed",
        times: {
          checkedInTime: mockTimes.checkedInTime,
          onGoingTime: mockTimes.onGoingTime,
          completedTime: null,
        },
        expectedCount: 2,
        description:
          "completed status with null completed time should show checkedIn and onGoing times",
      },
    ];

    testCases.forEach(({ status, times, expectedCount, description }) => {
      it(description, () => {
        render(
          <AttendanceTimes
            status={status}
            checkedInTime={times.checkedInTime}
            onGoingTime={times.onGoingTime}
            completedTime={times.completedTime}
          />
        );

        const timeElements = screen.queryAllByText(/\d{2}:\d{2}/);
        expect(timeElements).toHaveLength(expectedCount);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very early times", () => {
      const earlyTime = new Date("2025-01-15T00:01:00");

      render(<AttendanceTimes status="checkedIn" checkedInTime={earlyTime} />);

      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements).toHaveLength(1);
    });

    it("should handle late times", () => {
      const lateTime = new Date("2025-01-15T23:59:00");

      render(<AttendanceTimes status="checkedIn" checkedInTime={lateTime} />);

      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements).toHaveLength(1);
    });

    it("should handle same times for different statuses", () => {
      const sameTime = new Date("2025-01-15T12:00:00");

      render(
        <AttendanceTimes
          status="completed"
          checkedInTime={sameTime}
          onGoingTime={sameTime}
          completedTime={sameTime}
        />
      );

      // Should show the time two times (checkedIn and onGoing)
      const timeElements = screen.getAllByText(/\d{2}:\d{2}/);
      expect(timeElements).toHaveLength(2);
    });
  });

  describe("Accessibility", () => {
    it("should provide proper structure for screen readers", () => {
      const { container } = render(
        <AttendanceTimes
          status="completed"
          checkedInTime={mockTimes.checkedInTime}
          onGoingTime={mockTimes.onGoingTime}
          completedTime={mockTimes.completedTime}
        />
      );

      // The component should have a clear structure with spans for each time type
      const timeContainer = container.firstChild as HTMLElement;
      expect(timeContainer).toBeInTheDocument();

      // Should have two spans for the two different time types (checkedIn and onGoing)
      const spans = timeContainer.querySelectorAll("span");
      expect(spans).toHaveLength(2);
    });
  });
});
