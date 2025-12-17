import React from "react";
import { render, screen } from "@testing-library/react";
import DesignSystemDemo from "../page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe("DesignSystemDemo Page", () => {
  beforeEach(() => {
    render(<DesignSystemDemo />);
  });

  it("renders the main heading", () => {
    expect(screen.getByText("Design System Demo")).toBeInTheDocument();
  });

  describe("Typography Section", () => {
    it("renders the typography section", () => {
      expect(screen.getByText("Typography")).toBeInTheDocument();
    });

    it("renders all heading levels", () => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Heading 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Heading 2" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "Heading 3" })
      ).toBeInTheDocument();
    });

    it("renders different text styles", () => {
      expect(
        screen.getByText("Body text - Lorem ipsum dolor sit amet")
      ).toBeInTheDocument();
      expect(screen.getByText("Secondary body text")).toBeInTheDocument();
      expect(screen.getByText("Caption text")).toBeInTheDocument();
      expect(screen.getByText("Label text")).toBeInTheDocument();
    });
  });

  describe("Button Section", () => {
    it("renders the buttons section", () => {
      expect(
        screen.getByRole("heading", { name: "Buttons" })
      ).toBeInTheDocument();
    });

    it("renders all button variants", () => {
      expect(
        screen.getByRole("button", { name: "Primary Button" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Secondary Button" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Success Button" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Outline Button" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Ghost Button" })
      ).toBeInTheDocument();
    });

    it("renders disabled button", () => {
      const disabledButton = screen.getByRole("button", { name: "Disabled" });
      expect(disabledButton).toBeInTheDocument();
      expect(disabledButton).toBeDisabled();
    });

    it("applies correct CSS classes to buttons", () => {
      expect(
        screen.getByRole("button", { name: "Primary Button" })
      ).toHaveClass("ds-button-primary");
      expect(
        screen.getByRole("button", { name: "Secondary Button" })
      ).toHaveClass("ds-button-secondary");
      expect(
        screen.getByRole("button", { name: "Success Button" })
      ).toHaveClass("ds-button-success");
      expect(
        screen.getByRole("button", { name: "Outline Button" })
      ).toHaveClass("ds-button-outline");
      expect(screen.getByRole("button", { name: "Ghost Button" })).toHaveClass(
        "ds-button-ghost"
      );
    });
  });

  describe("Badge Section", () => {
    it("renders the badges section", () => {
      expect(
        screen.getByRole("heading", { name: "Badges" })
      ).toBeInTheDocument();
    });

    it("renders all badge variants", () => {
      expect(screen.getByText("Exceção")).toBeInTheDocument();
      expect(screen.getByText("Idoso/crianças")).toBeInTheDocument();
      expect(screen.getByText("Padrão")).toBeInTheDocument();
      expect(screen.getByText("Default Badge")).toBeInTheDocument();
    });

    it("applies correct CSS classes to badges", () => {
      expect(screen.getByText("Exceção")).toHaveClass(
        "ds-badge-priority-emergency"
      );
      expect(screen.getByText("Idoso/crianças")).toHaveClass(
        "ds-badge-priority-intermediate"
      );
      expect(screen.getByText("Padrão")).toHaveClass(
        "ds-badge-priority-normal"
      );
      expect(screen.getByText("Default Badge")).toHaveClass("ds-badge");
    });
  });

  describe("Form Section", () => {
    it("renders the form elements section", () => {
      expect(
        screen.getByRole("heading", { name: "Form Elements" })
      ).toBeInTheDocument();
    });

    it("renders all form inputs", () => {
      expect(
        screen.getByPlaceholderText("Enter your name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your email")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("This is disabled")).toBeInTheDocument();
    });

    it("renders inputs with correct attributes", () => {
      const nameInput = screen.getByPlaceholderText("Enter your name");
      const emailInput = screen.getByPlaceholderText("Enter your email");
      const disabledInput = screen.getByDisplayValue("This is disabled");

      expect(nameInput).toHaveAttribute("placeholder", "Enter your name");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
      expect(disabledInput).toBeDisabled();
      expect(disabledInput).toHaveValue("This is disabled");
    });

    it("applies correct CSS classes to form elements", () => {
      const nameInput = screen.getByPlaceholderText("Enter your name");
      const emailInput = screen.getByPlaceholderText("Enter your email");
      const disabledInput = screen.getByDisplayValue("This is disabled");

      expect(nameInput).toHaveClass("ds-input");
      expect(emailInput).toHaveClass("ds-input");
      expect(disabledInput).toHaveClass("ds-input");
    });
  });

  describe("Card Variations", () => {
    it("renders card with header", () => {
      expect(
        screen.getByRole("heading", { name: "Card with Header" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("This card has a header section.")
      ).toBeInTheDocument();
    });

    it("renders card without header", () => {
      expect(
        screen.getByRole("heading", { name: "Card without Header" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("This card only has a body section.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Action" })
      ).toBeInTheDocument();
    });
  });

  describe("Interactive Demo Section", () => {
    it("renders the interactive demo section", () => {
      expect(
        screen.getByRole("heading", { name: "Interactive Demo" })
      ).toBeInTheDocument();
    });

    it("renders interactive elements", () => {
      expect(screen.getByText("Alta Prioridade")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Complete Task" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("renders quick action form", () => {
      expect(screen.getByText("Quick Action")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter a command")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Execute" })
      ).toBeInTheDocument();
    });

    it("applies correct CSS classes to interactive elements", () => {
      expect(screen.getByText("Alta Prioridade")).toHaveClass(
        "ds-badge-priority-emergency"
      );
      expect(screen.getByRole("button", { name: "Complete Task" })).toHaveClass(
        "ds-button-success"
      );
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass(
        "ds-button-outline"
      );
      expect(screen.getByRole("button", { name: "Execute" })).toHaveClass(
        "ds-button-primary"
      );
    });
  });

  describe("Layout and Structure", () => {
    it("renders with correct container classes", () => {
      // Get the outermost container with the correct classes
      const outerContainer = screen
        .getByText("Design System Demo")
        .closest("div")?.parentElement;
      expect(outerContainer).toHaveClass("min-h-screen", "bg-gray-50", "p-8");
    });

    it("renders sections in cards with proper structure", () => {
      // Check that sections are wrapped in cards
      const typographySection = screen
        .getByText("Typography")
        .closest(".ds-card");
      const buttonSection = screen.getByText("Buttons").closest(".ds-card");

      expect(typographySection).toBeInTheDocument();
      expect(buttonSection).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      const h1 = screen.getAllByRole("heading", { level: 1 });
      const h2 = screen.getAllByRole("heading", { level: 2 });
      const h3 = screen.getAllByRole("heading", { level: 3 });

      expect(h1).toHaveLength(2); // "Design System Demo" and "Heading 1"
      expect(h2.length).toBeGreaterThan(0);
      expect(h3.length).toBeGreaterThan(0);
    });

    it("has proper form labels", () => {
      // Check that labels exist with correct text
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Disabled Input")).toBeInTheDocument();
      expect(screen.getByText("Quick Action")).toBeInTheDocument();

      // Check that inputs exist with proper placeholders/values
      expect(
        screen.getByPlaceholderText("Enter your name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your email")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("This is disabled")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter a command")
      ).toBeInTheDocument();
    });

    it("has accessible buttons", () => {
      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
