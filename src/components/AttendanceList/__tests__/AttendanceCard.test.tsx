import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceCard from "../AttendanceCard";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
  IPriority,
} from "@/types/globals";
import { IDraggedItem } from "../types";

// Mock the AttendanceTimes component
jest.mock("../AttendanceTimes", () => {
  return function MockAttendanceTimes({
    status,
    checkedInTime,
    onGoingTime,
    completedTime,
  }: {
    status: IAttendanceProgression;
    checkedInTime?: Date;
    onGoingTime?: Date;
    completedTime?: Date;
  }) {
    return (
      <div data-testid="attendance-times">
        Times: {status} -
        {checkedInTime && ` CheckedIn: ${checkedInTime.toISOString()}`}
        {onGoingTime && ` OnGoing: ${onGoingTime.toISOString()}`}
        {completedTime && ` Completed: ${completedTime.toISOString()}`}
      </div>
    );
  };
});

describe("AttendanceCard Component", () => {
  const mockPatient: IAttendanceStatusDetail = {
    name: "João Silva",
    priority: "1" as IPriority,
    checkedInTime: new Date("2025-01-15T09:00:00Z"),
    onGoingTime: null,
    completedTime: null,
  };

  const defaultProps = {
    patient: mockPatient,
    status: "checkedIn" as IAttendanceProgression,
    type: "spiritual" as IAttendanceType,
    idx: 0,
    dragged: null as IDraggedItem | null,
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    isNextToBeAttended: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render patient name and priority", () => {
      render(<AttendanceCard {...defaultProps} />);

      expect(screen.getByText(/João Silva \(1\)/)).toBeInTheDocument();
    });

    it("should render AttendanceTimes component", () => {
      render(<AttendanceCard {...defaultProps} />);

      expect(screen.getByTestId("attendance-times")).toBeInTheDocument();
    });

    it("should show patient index for checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="checkedIn" idx={2} />);

      expect(screen.getByText(/3\. João Silva \(1\)/)).toBeInTheDocument(); // idx + 1
    });

    it("should not show patient index for non-checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="scheduled" />);

      expect(screen.getByText(/João Silva \(1\)/)).toBeInTheDocument();
      expect(screen.queryByText(/1\./)).not.toBeInTheDocument();
    });

    it("should show 'next to be attended' indicator when isNextToBeAttended is true", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={true} />);

      expect(screen.getByText("Próximo a ser atendido")).toBeInTheDocument();
    });

    it("should not show 'next to be attended' indicator when isNextToBeAttended is false", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={false} />);

      expect(
        screen.queryByText("Próximo a ser atendido")
      ).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply correct border color for scheduled status", () => {
      render(<AttendanceCard {...defaultProps} status="scheduled" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-gray-400");
    });

    it("should apply correct border color for checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="checkedIn" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-yellow-400");
    });

    it("should apply correct border color for onGoing status", () => {
      render(<AttendanceCard {...defaultProps} status="onGoing" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-red-400");
    });

    it("should apply correct border color for completed status", () => {
      render(<AttendanceCard {...defaultProps} status="completed" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-green-400");
    });

    it("should apply dragged opacity when item is being dragged", () => {
      const draggedItem: IDraggedItem = {
        type: "spiritual",
        status: "checkedIn",
        idx: 0,
        name: "Test Patient",
      };

      render(<AttendanceCard {...defaultProps} dragged={draggedItem} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("opacity-60");
    });

    it("should not apply dragged opacity when item is not being dragged", () => {
      const draggedItem: IDraggedItem = {
        type: "lightBath", // Different type
        status: "checkedIn",
        idx: 0,
        name: "Test Patient",
      };

      render(<AttendanceCard {...defaultProps} dragged={draggedItem} />);

      const card = screen.getByRole("listitem");
      expect(card).not.toHaveClass("opacity-60");
    });

    it("should have proper base classes", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass(
        "relative",
        "h-20",
        "w-full",
        "flex",
        "items-center",
        "justify-center",
        "p-2",
        "rounded",
        "border-2",
        "cursor-move",
        "select-none"
      );
    });
  });

  describe("Drag and Drop", () => {
    it("should be draggable", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveAttribute("draggable", "true");
    });

    it("should call handleDragStart when drag starts", () => {
      const mockHandleDragStart = jest.fn();
      render(
        <AttendanceCard
          {...defaultProps}
          handleDragStart={mockHandleDragStart}
        />
      );

      const card = screen.getByRole("listitem");
      fireEvent.dragStart(card);

      expect(mockHandleDragStart).toHaveBeenCalledWith(
        "spiritual",
        0,
        "checkedIn"
      );
    });

    it("should call handleDragEnd when drag ends", () => {
      const mockHandleDragEnd = jest.fn();
      render(
        <AttendanceCard {...defaultProps} handleDragEnd={mockHandleDragEnd} />
      );

      const card = screen.getByRole("listitem");
      fireEvent.dragEnd(card);

      expect(mockHandleDragEnd).toHaveBeenCalled();
    });
  });

  describe("Dragged State Detection", () => {
    const testCases = [
      {
        description: "should detect dragged state when all properties match",
        dragged: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
          name: "Test Patient",
        },
        cardProps: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
        },
        expectedDragged: true,
      },
      {
        description: "should not detect dragged state when type differs",
        dragged: {
          type: "lightBath" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
          name: "Test Patient",
        },
        cardProps: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
      {
        description: "should not detect dragged state when status differs",
        dragged: {
          type: "spiritual" as IAttendanceType,
          status: "scheduled" as IAttendanceProgression,
          idx: 0,
          name: "Test Patient",
        },
        cardProps: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
      {
        description: "should not detect dragged state when index differs",
        dragged: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 1,
          name: "Test Patient",
        },
        cardProps: {
          type: "spiritual" as IAttendanceType,
          status: "checkedIn" as IAttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
    ];

    testCases.forEach(
      ({ description, dragged, cardProps, expectedDragged }) => {
        it(description, () => {
          render(
            <AttendanceCard
              {...defaultProps}
              {...cardProps}
              dragged={dragged}
            />
          );

          const card = screen.getByRole("listitem");
          if (expectedDragged) {
            expect(card).toHaveClass("opacity-60");
          } else {
            expect(card).not.toHaveClass("opacity-60");
          }
        });
      }
    );
  });

  describe("Patient Data Variations", () => {
    it("should render different priority values", () => {
      const patientWithPriority2: IAttendanceStatusDetail = {
        ...mockPatient,
        priority: "2" as IPriority,
      };

      render(
        <AttendanceCard {...defaultProps} patient={patientWithPriority2} />
      );

      expect(screen.getByText(/João Silva \(2\)/)).toBeInTheDocument();
    });

    it("should render different patient names", () => {
      const differentPatient: IAttendanceStatusDetail = {
        ...mockPatient,
        name: "Maria Santos",
      };

      render(<AttendanceCard {...defaultProps} patient={differentPatient} />);

      expect(screen.getByText(/Maria Santos \(1\)/)).toBeInTheDocument();
    });

    it("should pass correct times to AttendanceTimes component", () => {
      const patientWithTimes: IAttendanceStatusDetail = {
        name: "Test Patient",
        priority: "1" as IPriority,
        checkedInTime: new Date("2025-01-15T09:00:00Z"),
        onGoingTime: new Date("2025-01-15T09:30:00Z"),
        completedTime: new Date("2025-01-15T10:00:00Z"),
      };

      render(<AttendanceCard {...defaultProps} patient={patientWithTimes} />);

      const attendanceTimes = screen.getByTestId("attendance-times");
      expect(attendanceTimes).toHaveTextContent(
        "CheckedIn: 2025-01-15T09:00:00.000Z"
      );
      expect(attendanceTimes).toHaveTextContent(
        "OnGoing: 2025-01-15T09:30:00.000Z"
      );
      expect(attendanceTimes).toHaveTextContent(
        "Completed: 2025-01-15T10:00:00.000Z"
      );
    });
  });

  describe("Next to be Attended Indicator", () => {
    it("should position the indicator correctly", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={true} />);

      const indicator = screen.getByText("Próximo a ser atendido");
      expect(indicator).toHaveClass(
        "absolute",
        "top-1",
        "left-1",
        "text-red-700",
        "text-xs",
        "font-bold",
        "px-1",
        "py-0",
        "rounded",
        "z-10"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper list item semantics", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toBeInTheDocument();
    });

    it("should be keyboard navigable (draggable)", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveAttribute("draggable");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null times gracefully", () => {
      const patientWithNullTimes: IAttendanceStatusDetail = {
        name: "Test Patient",
        priority: "1" as IPriority,
        checkedInTime: null,
        onGoingTime: null,
        completedTime: null,
      };

      render(
        <AttendanceCard {...defaultProps} patient={patientWithNullTimes} />
      );

      expect(screen.getByText(/Test Patient \(1\)/)).toBeInTheDocument();
      expect(screen.getByTestId("attendance-times")).toBeInTheDocument();
    });

    it("should handle undefined isNextToBeAttended prop", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isNextToBeAttended, ...propsWithoutNextToBeAttended } =
        defaultProps;

      render(<AttendanceCard {...propsWithoutNextToBeAttended} />);

      expect(
        screen.queryByText("Próximo a ser atendido")
      ).not.toBeInTheDocument();
    });

    it("should handle high index numbers correctly", () => {
      render(<AttendanceCard {...defaultProps} status="checkedIn" idx={99} />);

      expect(screen.getByText(/100\. João Silva \(1\)/)).toBeInTheDocument(); // idx + 1
    });
  });
});
