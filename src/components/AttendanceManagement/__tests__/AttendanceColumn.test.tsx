import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceColumn from "../components/AttendanceColumn";
import {
  AttendanceProgression,
  AttendanceType,
  AttendanceStatusDetail,
  Priority,
} from "@/types/types";
import { IDraggedItem } from "../types";

// Mock the AttendanceCard component
jest.mock("../components/AttendanceCards/AttendanceCard", () => {
  return function MockAttendanceCard({
    patient,
    index,
    dragged,
    handleDragStart,
    handleDragEnd,
    type,
    status,
  }: {
    patient: AttendanceStatusDetail;
    index: number;
    dragged: IDraggedItem | null;
    handleDragStart: (
      type: AttendanceType,
      index: number,
      status: AttendanceProgression
    ) => void;
    handleDragEnd: () => void;
    type: AttendanceType;
    status: AttendanceProgression;
  }) {
    const isDragged =
      dragged?.type === type &&
      dragged?.status === status &&
      dragged?.idx === index;

    return (
      <div
        data-testid={`attendance-card-${type}-${status}-${index}`}
        className={isDragged ? "dragging" : ""}
        draggable
        onDragStart={() => handleDragStart(type, index, status)}
        onDragEnd={handleDragEnd}
      >
        {patient.name} (Priority: {patient.priority})
      </div>
    );
  };
});

describe("AttendanceColumn Component", () => {
  const mockPatients = [
    {
      name: "João Silva",
      priority: "1" as Priority,
      checkedInTime: "09:00:00",
      onGoingTime: null,
      completedTime: null,
      originalType: "spiritual" as AttendanceType,
    },
    {
      name: "Maria Santos",
      priority: "2" as Priority,
      checkedInTime: "10:00:00",
      onGoingTime: null,
      completedTime: null,
      originalType: "spiritual" as AttendanceType,
    },
  ];

  const defaultProps = {
    status: "checkedIn" as AttendanceProgression,
    patients: mockPatients,
    dragged: null as IDraggedItem | null,
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDrop: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Column Header", () => {
    it("should display correct label for scheduled status", () => {
      render(<AttendanceColumn {...defaultProps} status="scheduled" />);

      expect(screen.getByText("Agendados")).toBeInTheDocument();
    });

    it("should display correct label for checkedIn status", () => {
      render(<AttendanceColumn {...defaultProps} status="checkedIn" />);

      expect(screen.getByText("Sala de Espera")).toBeInTheDocument();
    });

    it("should display correct label for onGoing status", () => {
      render(<AttendanceColumn {...defaultProps} status="onGoing" />);

      expect(screen.getByText("Em Atendimento")).toBeInTheDocument();
    });

    it("should display correct label for completed status", () => {
      render(<AttendanceColumn {...defaultProps} status="completed" />);

      expect(screen.getByText("Finalizados")).toBeInTheDocument();
    });

    it("should apply correct text color for scheduled status", () => {
      render(<AttendanceColumn {...defaultProps} status="scheduled" />);

      const header = screen.getByText("Agendados");
      expect(header).toHaveClass("text-blue-600");
    });

    it("should apply correct text color for checkedIn status", () => {
      render(<AttendanceColumn {...defaultProps} status="checkedIn" />);

      const header = screen.getByText("Sala de Espera");
      expect(header).toHaveClass("text-red-600");
    });

    it("should apply correct text color for onGoing status", () => {
      render(<AttendanceColumn {...defaultProps} status="onGoing" />);

      const header = screen.getByText("Em Atendimento");
      expect(header).toHaveClass("text-yellow-600");
    });

    it("should apply correct text color for completed status", () => {
      render(<AttendanceColumn {...defaultProps} status="completed" />);

      const header = screen.getByText("Finalizados");
      expect(header).toHaveClass("text-green-600");
    });
  });

  describe("Patient Cards", () => {
    it("should render all patient cards", () => {
      render(<AttendanceColumn {...defaultProps} />);

      expect(
        screen.getByTestId("attendance-card-spiritual-checkedIn-0")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("attendance-card-spiritual-checkedIn-1")
      ).toBeInTheDocument();
      expect(screen.getByText("João Silva (Priority: 1)")).toBeInTheDocument();
      expect(
        screen.getByText("Maria Santos (Priority: 2)")
      ).toBeInTheDocument();
    });

    it("should render empty column when no patients", () => {
      render(<AttendanceColumn {...defaultProps} patients={[]} />);

      expect(screen.queryByTestId(/attendance-card/)).not.toBeInTheDocument();
    });

    it("should pass correct props to AttendanceCard components", () => {
      render(<AttendanceColumn {...defaultProps} />);

      // First patient card should exist
      const firstCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-0"
      );
      expect(firstCard).toBeInTheDocument();

      // Second patient card should exist
      const secondCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-1"
      );
      expect(secondCard).toBeInTheDocument();
    });
  });

  describe("Drag and Drop Events", () => {
    it("should call handleDragStart when card is dragged", () => {
      const mockHandleDragStart = jest.fn();
      render(
        <AttendanceColumn
          {...defaultProps}
          handleDragStart={mockHandleDragStart}
        />
      );

      const firstCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-0"
      );
      fireEvent.dragStart(firstCard);

      expect(mockHandleDragStart).toHaveBeenCalledWith(
        "spiritual",
        0,
        "checkedIn",
        undefined
      );
    });

    it("should call handleDragEnd when drag ends", () => {
      const mockHandleDragEnd = jest.fn();
      render(
        <AttendanceColumn {...defaultProps} handleDragEnd={mockHandleDragEnd} />
      );

      const firstCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-0"
      );
      fireEvent.dragEnd(firstCard);

      expect(mockHandleDragEnd).toHaveBeenCalled();
    });

    it("should show dragged state when item is being dragged", () => {
      const draggedItem: IDraggedItem = {
        type: "spiritual",
        status: "checkedIn",
        idx: 0,
        patientId: 1,
      };

      render(<AttendanceColumn {...defaultProps} dragged={draggedItem} />);

      const draggedCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-0"
      );
      expect(draggedCard).toHaveClass("dragging");
    });

    it("should not show dragged state for other cards", () => {
      const draggedItem: IDraggedItem = {
        type: "spiritual",
        status: "checkedIn",
        idx: 0,
        patientId: 1,
      };

      render(<AttendanceColumn {...defaultProps} dragged={draggedItem} />);

      const nonDraggedCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-1"
      );
      expect(nonDraggedCard).not.toHaveClass("dragging");
    });
  });

  describe("Drop Zone", () => {
    it("should have proper drop zone styling", () => {
      const { container } = render(<AttendanceColumn {...defaultProps} />);

      const dropZone = container.querySelector(".border-dashed");
      expect(dropZone).toBeInTheDocument();
      expect(dropZone).toHaveClass(
        "bg-gray-100",
        "p-4",
        "rounded-lg",
        "border-2",
        "border-dashed",
        "border-gray-300"
      );
    });

    it("should handle drop events on the column", () => {
      const mockHandleDrop = jest.fn();
      const { container } = render(
        <AttendanceColumn {...defaultProps} handleDrop={mockHandleDrop} />
      );

      const dropZone = container.querySelector(".border-dashed");
      expect(dropZone).toBeInTheDocument();

      fireEvent.drop(dropZone!);
      expect(mockHandleDrop).toHaveBeenCalled();
    });

    it("should prevent default drag over behavior", () => {
      const draggedItem: IDraggedItem = {
        type: "spiritual",
        status: "scheduled", // Different status to trigger preventDefault
        idx: 0,
        patientId: 1,
      };

      const { container } = render(
        <AttendanceColumn {...defaultProps} dragged={draggedItem} />
      );

      const dropZone = container.querySelector(".border-dashed");
      expect(dropZone).toBeInTheDocument();

      const dragOverEvent = new Event("dragover", { bubbles: true });
      const preventDefaultSpy = jest.spyOn(dragOverEvent, "preventDefault");

      fireEvent(dropZone!, dragOverEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Layout and Styling", () => {
    it("should have correct column layout classes", () => {
      const { container } = render(<AttendanceColumn {...defaultProps} />);

      const column = container.firstChild as HTMLElement;
      expect(column).toHaveClass("flex-1", "min-h-[300px]");
    });

    it("should have centered header", () => {
      render(<AttendanceColumn {...defaultProps} />);

      const header = screen.getByText("Sala de Espera");
      expect(header).toHaveClass("font-semibold", "text-red-600");
    });

    it("should have proper drop zone layout", () => {
      const { container } = render(<AttendanceColumn {...defaultProps} />);

      const dropZone = container.querySelector(".border-dashed");
      expect(dropZone).toHaveClass(
        "bg-gray-100",
        "p-4",
        "rounded-lg",
        "border-2",
        "border-dashed",
        "border-gray-300"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(<AttendanceColumn {...defaultProps} />);

      // Header should be visible and descriptive
      expect(screen.getByText("Sala de Espera")).toBeInTheDocument();

      // Cards should be draggable
      const cards = screen.getAllByTestId(/attendance-card/);
      cards.forEach((card) => {
        expect(card).toHaveAttribute("draggable", "true");
      });
    });

    it("should support keyboard navigation for drag operations", () => {
      render(<AttendanceColumn {...defaultProps} />);

      const firstCard = screen.getByTestId(
        "attendance-card-spiritual-checkedIn-0"
      );
      expect(firstCard).toHaveAttribute("draggable", "true");
    });
  });

  describe("Different Attendance Types", () => {
    it("should work with lightBath type", () => {
      const lightBathPatients = [
        {
          ...mockPatients[0],
          originalType: "lightBath" as AttendanceType,
        },
        {
          ...mockPatients[1],
          originalType: "lightBath" as AttendanceType,
        },
      ];

      render(
        <AttendanceColumn {...defaultProps} patients={lightBathPatients} />
      );

      expect(
        screen.getByTestId("attendance-card-lightBath-checkedIn-0")
      ).toBeInTheDocument();
    });

    it("should work with different statuses", () => {
      const scheduledProps = {
        ...defaultProps,
        status: "scheduled" as AttendanceProgression,
      };

      render(<AttendanceColumn {...scheduledProps} />);

      expect(screen.getByText("Agendados")).toBeInTheDocument();
      expect(
        screen.getByTestId("attendance-card-spiritual-scheduled-0")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle unknown status gracefully", () => {
      // TypeScript would normally prevent this, but testing runtime behavior
      render(
        <AttendanceColumn
          {...defaultProps}
          status={"unknown" as AttendanceProgression}
        />
      );

      // Should show the unknown status as the header text
      expect(screen.getByText("unknown")).toBeInTheDocument();
    });

    it("should handle null dragged item", () => {
      render(<AttendanceColumn {...defaultProps} dragged={null} />);

      const cards = screen.getAllByTestId(/attendance-card/);
      cards.forEach((card) => {
        expect(card).not.toHaveClass("dragging");
      });
    });

    it("should handle dragged item from different column", () => {
      const draggedItem: IDraggedItem = {
        type: "lightBath",
        status: "scheduled",
        idx: 0,
        patientId: 1,
      };

      render(<AttendanceColumn {...defaultProps} dragged={draggedItem} />);

      const cards = screen.getAllByTestId(/attendance-card/);
      cards.forEach((card) => {
        expect(card).not.toHaveClass("dragging");
      });
    });
  });
});
