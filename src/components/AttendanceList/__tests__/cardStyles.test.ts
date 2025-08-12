import {
  getPriorityLabel,
  getTooltipContent,
  getStatusStyles,
  getTypeBasedStyles,
  getTypeIndicatorConfig,
  shouldShowTypeIndicator,
  getStatusColor,
  getStatusLabel,
} from "../cardStyles";

describe("cardStyles utilities", () => {
  describe("getPriorityLabel", () => {
    it("should return correct labels for priority values", () => {
      expect(getPriorityLabel("1")).toBe("Emergência");
      expect(getPriorityLabel("2")).toBe("Intermediário");
      expect(getPriorityLabel("3")).toBe("Normal");
    });

    it("should return the original value for unknown priorities", () => {
      expect(getPriorityLabel("4")).toBe("4");
      expect(getPriorityLabel("unknown")).toBe("unknown");
    });
  });

  describe("getTooltipContent", () => {
    it("should format tooltip content correctly", () => {
      expect(getTooltipContent("João Silva", "1")).toBe(
        "João Silva - Prioridade: Emergência"
      );
      expect(getTooltipContent("Maria Santos", "2")).toBe(
        "Maria Santos - Prioridade: Intermediário"
      );
      expect(getTooltipContent("Pedro Costa", "3")).toBe(
        "Pedro Costa - Prioridade: Normal"
      );
    });

    it("should handle long names correctly", () => {
      const longName = "José da Silva Santos Oliveira Pereira";
      expect(getTooltipContent(longName, "1")).toBe(
        `${longName} - Prioridade: Emergência`
      );
    });

    it("should handle unknown priorities", () => {
      expect(getTooltipContent("Ana Costa", "4")).toBe(
        "Ana Costa - Prioridade: 4"
      );
    });
  });

  describe("getStatusStyles", () => {
    it("should return gray borders for all status types", () => {
      expect(getStatusStyles("scheduled")).toContain("border-l-gray-400");
      expect(getStatusStyles("checkedIn")).toContain("border-l-gray-400");
      expect(getStatusStyles("onGoing")).toContain("border-l-gray-400");
      expect(getStatusStyles("completed")).toContain("border-l-gray-400");
    });
  });

  describe("getTypeBasedStyles", () => {
    it("should return blue border for rod type", () => {
      expect(getTypeBasedStyles("rod")).toContain("border-l-blue-400");
    });
    
    it("should return yellow border for lightBath type", () => {
      expect(getTypeBasedStyles("lightBath")).toContain("border-l-yellow-400");
    });
    
    it("should return gray border for spiritual type", () => {
      expect(getTypeBasedStyles("spiritual")).toContain("border-l-gray-400");
    });
  });

  describe("getTypeIndicatorConfig", () => {
    it("should return correct config for each type", () => {
      expect(getTypeIndicatorConfig("spiritual")).toEqual({
        className: "text-gray-600",
        label: "Espiritual",
      });
      expect(getTypeIndicatorConfig("lightBath")).toEqual({
        className: "text-yellow-600",
        label: "Banho de Luz",
      });
      expect(getTypeIndicatorConfig("rod")).toEqual({
        className: "text-blue-600",
        label: "Bastão",
      });
    });
  });

  describe("shouldShowTypeIndicator", () => {
    it("should return false for spiritual type", () => {
      expect(shouldShowTypeIndicator("spiritual")).toBe(false);
    });

    it("should return true for other types", () => {
      expect(shouldShowTypeIndicator("lightBath")).toBe(true);
      expect(shouldShowTypeIndicator("rod")).toBe(true);
    });
  });

  describe("getStatusColor", () => {
    it("should return correct colors for each status", () => {
      expect(getStatusColor("scheduled")).toBe("text-blue-600");
      expect(getStatusColor("checkedIn")).toBe("text-red-600");
      expect(getStatusColor("onGoing")).toBe("text-yellow-600");
      expect(getStatusColor("completed")).toBe("text-green-600");
    });
  });

  describe("getStatusLabel", () => {
    it("should return correct labels for each status", () => {
      expect(getStatusLabel("scheduled")).toBe("Agendados");
      expect(getStatusLabel("checkedIn")).toBe("Sala de Espera");
      expect(getStatusLabel("onGoing")).toBe("Em Atendimento");
      expect(getStatusLabel("completed")).toBe("Finalizados");
    });
  });
});
