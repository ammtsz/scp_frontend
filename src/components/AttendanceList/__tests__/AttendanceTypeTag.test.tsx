import React from "react";
import { render, screen } from "@testing-library/react";
import AttendanceTypeTag from "../AttendanceTypeTag";
import { IAttendanceType } from "@/types/globals";

describe("AttendanceTypeTag", () => {
  describe("renders correctly for all attendance types", () => {
    test.each([
      ["rod", "Bastão", "bg-blue-100", "text-blue-700"],
      ["lightBath", "Banho de Luz", "bg-yellow-100", "text-yellow-700"],
      ["spiritual", "Consulta Espiritual", "bg-gray-100", "text-gray-700"],
    ])(
      "renders %s type correctly",
      (type, expectedLabel, expectedBg, expectedText) => {
        render(<AttendanceTypeTag type={type as IAttendanceType} />);

        const tag = screen.getByText(expectedLabel);
        expect(tag).toBeInTheDocument();
        expect(tag).toHaveClass(expectedBg);
        expect(tag).toHaveClass(expectedText);
      }
    );
  });

  describe("size variations", () => {
    it("renders small size by default", () => {
      render(<AttendanceTypeTag type="rod" />);

      const tag = screen.getByText("Bastão");
      expect(tag).toHaveClass("px-2", "py-0.5", "text-xs");
    });

    it("renders medium size when specified", () => {
      render(<AttendanceTypeTag type="rod" size="md" />);

      const tag = screen.getByText("Bastão");
      expect(tag).toHaveClass("px-3", "py-1", "text-sm");
    });
  });

  describe("styling consistency", () => {
    it("applies consistent base classes", () => {
      render(<AttendanceTypeTag type="spiritual" />);

      const tag = screen.getByText("Consulta Espiritual");
      expect(tag).toHaveClass(
        "inline-flex",
        "items-center",
        "rounded-full",
        "border",
        "font-medium"
      );
    });
  });

  describe("edge cases", () => {
    it("handles unknown attendance type gracefully", () => {
      // TypeScript would prevent this, but testing runtime behavior
      render(<AttendanceTypeTag type={"unknown" as IAttendanceType} />);

      const tag = screen.getByText("Desconhecido");
      expect(tag).toBeInTheDocument();
      expect(tag).toHaveClass("bg-gray-100", "text-gray-500");
    });
  });
});
