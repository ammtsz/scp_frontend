/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className} data-testid={`link-${href}`}>
        {children}
      </a>
    );
  };
});

describe("Home Page", () => {
  it("should render the main heading", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("MVP Center - Sistema de Atendimento");
  });

  it("should render all navigation links", () => {
    render(<Home />);

    // Check that all links are present
    expect(screen.getByTestId("link-/patients")).toHaveTextContent("Pacientes");
    expect(screen.getByTestId("link-/patients/new")).toHaveTextContent(
      "Novo Paciente"
    );
    expect(screen.getByTestId("link-/agenda")).toHaveTextContent("Agenda");
    expect(screen.getByTestId("link-/attendance")).toHaveTextContent(
      "Atendimentos"
    );
    expect(screen.getByTestId("link-/patients/history")).toHaveTextContent(
      "Histórico"
    );
  });

  it("should have correct href attributes for all links", () => {
    render(<Home />);

    expect(screen.getByTestId("link-/patients")).toHaveAttribute(
      "href",
      "/patients"
    );
    expect(screen.getByTestId("link-/patients/new")).toHaveAttribute(
      "href",
      "/patients/new"
    );
    expect(screen.getByTestId("link-/agenda")).toHaveAttribute(
      "href",
      "/agenda"
    );
    expect(screen.getByTestId("link-/attendance")).toHaveAttribute(
      "href",
      "/attendance"
    );
    expect(screen.getByTestId("link-/patients/history")).toHaveAttribute(
      "href",
      "/patients/history"
    );
  });

  it("should have proper styling classes on links", () => {
    render(<Home />);

    // Check primary button styling (blue background)
    const patientsLink = screen.getByTestId("link-/patients");
    expect(patientsLink).toHaveClass(
      "bg-blue-600",
      "text-white",
      "hover:bg-blue-700"
    );

    const agendaLink = screen.getByTestId("link-/agenda");
    expect(agendaLink).toHaveClass(
      "bg-blue-600",
      "text-white",
      "hover:bg-blue-700"
    );

    // Check secondary button styling (light blue background)
    const newPatientLink = screen.getByTestId("link-/patients/new");
    expect(newPatientLink).toHaveClass(
      "bg-blue-100",
      "text-blue-700",
      "hover:bg-blue-200"
    );

    const attendanceLink = screen.getByTestId("link-/attendance");
    expect(attendanceLink).toHaveClass(
      "bg-blue-100",
      "text-blue-700",
      "hover:bg-blue-200"
    );

    // Check tertiary button styling (transparent background)
    const historyLink = screen.getByTestId("link-/patients/history");
    expect(historyLink).toHaveClass(
      "bg-transparent",
      "text-gray-600",
      "hover:bg-gray-100"
    );
  });

  it("should have proper container structure", () => {
    const { container } = render(<Home />);

    // Check main container classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      "min-h-screen",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "p-8",
      "gap-8",
      "bg-blue-50"
    );

    // Check inner card container
    const cardContainer = container.querySelector(".bg-white");
    expect(cardContainer).toHaveClass(
      "bg-white",
      "rounded-lg",
      "shadow-sm",
      "border",
      "border-gray-200",
      "max-w-md",
      "w-full",
      "p-6"
    );
  });

  it("should have all links with common styling", () => {
    render(<Home />);

    const allLinks = [
      screen.getByTestId("link-/patients"),
      screen.getByTestId("link-/patients/new"),
      screen.getByTestId("link-/agenda"),
      screen.getByTestId("link-/attendance"),
      screen.getByTestId("link-/patients/history"),
    ];

    allLinks.forEach((link) => {
      expect(link).toHaveClass(
        "block",
        "w-full",
        "px-4",
        "py-2",
        "rounded-md",
        "transition-colors"
      );
    });
  });

  it("should render links in correct order", () => {
    render(<Home />);

    const links = screen.getAllByRole("link");
    const linkTexts = links.map((link) => link.textContent);

    expect(linkTexts).toEqual([
      "Pacientes",
      "Novo Paciente",
      "Agenda",
      "Atendimentos",
      "Histórico",
    ]);
  });
});
