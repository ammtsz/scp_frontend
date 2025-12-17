import {
  colors,
  typography,
  spacing,
  layout,
  components,
  breakpoints,
  getPriorityColors,
  getTreatmentColors,
  getStatusColors,
  default as tokens,
} from "../tokens";

describe("Design System Tokens", () => {
  describe("Color Palette", () => {
    it("should have primary colors with correct structure", () => {
      expect(colors.primary).toHaveProperty("50");
      expect(colors.primary).toHaveProperty("500");
      expect(colors.primary).toHaveProperty("900");
      
      // Check if colors are valid hex codes
      expect(colors.primary[500]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(colors.primary[600]).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should have status colors for success, warning, and error", () => {
      expect(colors.status).toHaveProperty("success");
      expect(colors.status).toHaveProperty("warning");
      expect(colors.status.success).toHaveProperty("600");
      expect(colors.status.warning).toHaveProperty("600");
    });

    it("should have treatment colors with all required properties", () => {
      const treatmentTypes: (keyof typeof colors.treatment)[] = ["spiritual", "lightBath", "rod"];
      
      treatmentTypes.forEach((type) => {
        expect(colors.treatment[type]).toHaveProperty("bg");
        expect(colors.treatment[type]).toHaveProperty("text");
        expect(colors.treatment[type]).toHaveProperty("border");
        expect(colors.treatment[type]).toHaveProperty("icon");
      });
    });

    it("should have neutral colors covering full grayscale range", () => {
      expect(colors.neutral).toHaveProperty("50");
      expect(colors.neutral).toHaveProperty("900");
      expect(colors.neutral[50]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(colors.neutral[900]).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should have surface colors for UI backgrounds", () => {
      expect(colors.surface).toHaveProperty("background");
      expect(colors.surface).toHaveProperty("card");
      expect(colors.surface).toHaveProperty("border");
      expect(colors.surface.card).toBe("#ffffff");
    });
  });

  describe("Typography", () => {
    it("should have font families with fallbacks", () => {
      expect(typography.fontFamily.sans).toContain("Inter");
      expect(typography.fontFamily.sans).toContain("-apple-system");
      expect(typography.fontFamily.mono).toContain("Fira Code");
      expect(typography.fontFamily.mono).toContain("monospace");
    });

    it("should have consistent font sizes in rem units", () => {
      const sizeKeys: (keyof typeof typography.fontSize)[] = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
      
      sizeKeys.forEach((size) => {
        expect(typography.fontSize[size]).toMatch(/^\d+(\.\d+)?rem$/);
      });
      
      expect(typography.fontSize.base).toBe("1rem");
      expect(typography.fontSize.xs).toBe("0.75rem");
    });

    it("should have font weights as numeric strings", () => {
      expect(typography.fontWeight.normal).toBe("400");
      expect(typography.fontWeight.medium).toBe("500");
      expect(typography.fontWeight.semibold).toBe("600");
      expect(typography.fontWeight.bold).toBe("700");
    });

    it("should have line heights with proper values", () => {
      expect(typography.lineHeight.tight).toBe("1.25");
      expect(typography.lineHeight.normal).toBe("1.5");
      expect(typography.lineHeight.relaxed).toBe("1.75");
    });

    it("should have text colors referencing color palette", () => {
      expect(typography.textColor.primary).toBe(colors.neutral[900]);
      expect(typography.textColor.secondary).toBe(colors.neutral[600]);
      expect(typography.textColor.link).toBe(colors.primary[600]);
      expect(typography.textColor.linkHover).toBe(colors.primary[700]);
    });
  });

  describe("Spacing", () => {
    it("should have consistent spacing scale", () => {
      expect(spacing[0]).toBe("0");
      expect(spacing[1]).toBe("0.25rem");
      expect(spacing[4]).toBe("1rem");
      expect(spacing.px).toBe("1px");
    });

    it("should increase proportionally", () => {
      const spacingValues: (keyof typeof spacing)[] = [1, 2, 3, 4, 5, 6, 8, 10, 12];
      
      spacingValues.forEach((value, index) => {
        if (index > 0) {
          const currentRem = parseFloat(spacing[value]);
          const previousRem = parseFloat(spacing[spacingValues[index - 1]]);
          expect(currentRem).toBeGreaterThan(previousRem);
        }
      });
    });
  });

  describe("Layout", () => {
    it("should have border radius options", () => {
      expect(layout.borderRadius.none).toBe("0");
      expect(layout.borderRadius.base).toBe("0.25rem");
      expect(layout.borderRadius.full).toBe("9999px");
    });

    it("should have box shadow variants", () => {
      expect(layout.boxShadow.none).toBe("none");
      expect(layout.boxShadow.sm).toContain("rgba");
      expect(layout.boxShadow.lg).toContain("rgba");
    });

    it("should have minimum touch targets for accessibility", () => {
      expect(layout.minTouchTarget.mobile).toBe("48px");
      expect(layout.minTouchTarget.desktop).toBe("44px");
    });

    it("should have responsive container sizes", () => {
      expect(layout.container.sm).toBe("640px");
      expect(layout.container.lg).toBe("1024px");
      expect(layout.container["2xl"]).toBe("1536px");
    });
  });

  describe("Component Tokens", () => {
    it("should have card component tokens", () => {
      expect(components.card.background).toBe(colors.surface.card);
      expect(components.card.border).toBe(colors.surface.border);
      expect(components.card.borderRadius).toBe(layout.borderRadius.lg);
      expect(components.card.padding).toBe(spacing[6]);
    });

    it("should have button component tokens with variants", () => {
      expect(components.button.variants).toHaveProperty("primary");
      expect(components.button.variants).toHaveProperty("secondary");
      expect(components.button.variants).toHaveProperty("success");
      expect(components.button.variants).toHaveProperty("warning");
      expect(components.button.variants).toHaveProperty("error");
      
      expect(components.button.variants.primary.background).toBe(colors.primary[600]);
      expect(components.button.variants.primary.hover).toBe(colors.primary[700]);
    });

    it("should have input component tokens", () => {
      expect(components.input.fontSize).toBe(typography.fontSize.base);
      expect(components.input.minHeight).toBe(layout.minTouchTarget.desktop);
      expect(components.input.focus.border).toBe(colors.primary[500]);
    });

    it("should have badge component tokens", () => {
      expect(components.badge.borderRadius).toBe(layout.borderRadius.full);
      expect(components.badge.fontSize).toBe(typography.fontSize.sm);
      expect(components.badge.fontWeight).toBe(typography.fontWeight.medium);
    });
  });

  describe("Breakpoints", () => {
    it("should have standard responsive breakpoints", () => {
      expect(breakpoints.sm).toBe("640px");
      expect(breakpoints.md).toBe("768px");
      expect(breakpoints.lg).toBe("1024px");
      expect(breakpoints.xl).toBe("1280px");
      expect(breakpoints["2xl"]).toBe("1536px");
    });

    it("should have breakpoints in ascending order", () => {
      const sizes = [640, 768, 1024, 1280, 1536];
      const breakpointValues = [
        parseInt(breakpoints.sm),
        parseInt(breakpoints.md),
        parseInt(breakpoints.lg),
        parseInt(breakpoints.xl),
        parseInt(breakpoints["2xl"]),
      ];
      
      expect(breakpointValues).toEqual(sizes);
    });
  });

  describe("Utility Functions", () => {
    describe("getPriorityColors", () => {
      it("should return emergency colors for priority 1", () => {
        const result = getPriorityColors(1);
        expect(result).toEqual(colors.priority.emergency);
        
        const resultString = getPriorityColors("1");
        expect(resultString).toEqual(colors.priority.emergency);
      });

      it("should return intermediate colors for priority 2", () => {
        const result = getPriorityColors(2);
        expect(result).toEqual(colors.priority.intermediate);
        
        const resultString = getPriorityColors("2");
        expect(resultString).toEqual(colors.priority.intermediate);
      });

      it("should return normal colors for priority 3", () => {
        const result = getPriorityColors(3);
        expect(result).toEqual(colors.priority.normal);
        
        const resultString = getPriorityColors("3");
        expect(resultString).toEqual(colors.priority.normal);
      });

      it("should return default colors for invalid priority", () => {
        const result = getPriorityColors("invalid");
        expect(result).toEqual({
          bg: colors.neutral[100],
          text: colors.neutral[600],
          border: colors.neutral[200],
          icon: "📋",
        });
        
        const resultZero = getPriorityColors(0);
        expect(resultZero).toEqual({
          bg: colors.neutral[100],
          text: colors.neutral[600],
          border: colors.neutral[200],
          icon: "📋",
        });
      });

      it("should handle edge cases gracefully", () => {
        expect(getPriorityColors("")).toEqual({
          bg: colors.neutral[100],
          text: colors.neutral[600],
          border: colors.neutral[200],
          icon: "📋",
        });
        
        expect(getPriorityColors("4")).toEqual({
          bg: colors.neutral[100],
          text: colors.neutral[600],
          border: colors.neutral[200],
          icon: "📋",
        });
      });
    });

    describe("getTreatmentColors", () => {
      it("should return spiritual colors for spiritual treatment", () => {
        const result = getTreatmentColors("spiritual");
        expect(result).toEqual(colors.treatment.spiritual);
      });

      it("should return lightBath colors for lightBath treatment", () => {
        const result = getTreatmentColors("lightBath");
        expect(result).toEqual(colors.treatment.lightBath);
      });

      it("should return lightBath colors for light_bath treatment (snake_case)", () => {
        const result = getTreatmentColors("light_bath");
        expect(result).toEqual(colors.treatment.lightBath);
      });

      it("should return rod colors for rod treatment", () => {
        const result = getTreatmentColors("rod");
        expect(result).toEqual(colors.treatment.rod);
      });

      it("should return spiritual colors as default for unknown treatment", () => {
        const result = getTreatmentColors("unknown");
        expect(result).toEqual(colors.treatment.spiritual);
        
        const resultEmpty = getTreatmentColors("");
        expect(resultEmpty).toEqual(colors.treatment.spiritual);
      });

      it("should handle case sensitivity", () => {
        const result = getTreatmentColors("SPIRITUAL");
        expect(result).toEqual(colors.treatment.spiritual); // Should fallback to default
      });
    });

    describe("getStatusColors", () => {
      it("should return correct colors for success status", () => {
        const result = getStatusColors("success");
        expect(result).toEqual(colors.status.success);
      });

      it("should return correct colors for warning status", () => {
        const result = getStatusColors("warning");
        expect(result).toEqual(colors.status.warning);
      });

      it("should return correct colors for error status", () => {
        const result = getStatusColors("error");
        expect(result).toEqual(colors.status.error);
      });

      it("should return correct colors for info status", () => {
        const result = getStatusColors("info");
        expect(result).toEqual(colors.status.info);
      });
    });
  });

  describe("Default Export", () => {
    it("should export all tokens in default export", () => {
      expect(tokens).toHaveProperty("colors");
      expect(tokens).toHaveProperty("typography");
      expect(tokens).toHaveProperty("spacing");
      expect(tokens).toHaveProperty("layout");
      expect(tokens).toHaveProperty("components");
      expect(tokens).toHaveProperty("breakpoints");
      expect(tokens).toHaveProperty("getPriorityColors");
      expect(tokens).toHaveProperty("getTreatmentColors");
      expect(tokens).toHaveProperty("getStatusColors");
    });

    it("should have utility functions available in default export", () => {
      expect(tokens.getPriorityColors(1)).toEqual(colors.priority.emergency);
      expect(tokens.getTreatmentColors("spiritual")).toEqual(colors.treatment.spiritual);
      expect(tokens.getStatusColors("success")).toEqual(colors.status.success);
    });
  });

  describe("Token Consistency", () => {
    it("should use consistent color references throughout tokens", () => {
      // Button variants should reference primary colors
      expect(components.button.variants.primary.background).toBe(colors.primary[600]);
      expect(components.button.variants.secondary.color).toBe(colors.primary[700]);
      
      // Card tokens should reference surface colors
      expect(components.card.background).toBe(colors.surface.card);
      expect(components.card.border).toBe(colors.surface.border);
    });

    it("should have proper spacing references in components", () => {
      expect(components.card.padding).toBe(spacing[6]);
      expect(components.button.padding.x).toBe(spacing[4]);
      expect(components.button.padding.y).toBe(spacing[2]);
    });

    it("should have proper layout references in components", () => {
      expect(components.card.borderRadius).toBe(layout.borderRadius.lg);
      expect(components.button.borderRadius).toBe(layout.borderRadius.md);
      expect(components.badge.borderRadius).toBe(layout.borderRadius.full);
    });

    it("should have proper typography references in components", () => {
      expect(components.button.fontSize).toBe(typography.fontSize.sm);
      expect(components.button.fontWeight).toBe(typography.fontWeight.semibold);
      expect(components.badge.fontSize).toBe(typography.fontSize.sm);
      expect(components.badge.fontWeight).toBe(typography.fontWeight.medium);
    });
  });

  describe("Accessibility Compliance", () => {
    it("should have minimum touch targets meeting accessibility standards", () => {
      // Mobile should be at least 48px (iOS/Android standards)
      expect(parseInt(layout.minTouchTarget.mobile)).toBeGreaterThanOrEqual(48);
      
      // Desktop should be at least 44px (WCAG standards)
      expect(parseInt(layout.minTouchTarget.desktop)).toBeGreaterThanOrEqual(44);
    });

    it("should have form input font size preventing iOS zoom", () => {
      // iOS zooms in if font size is less than 16px
      expect(components.input.fontSize).toBe("1rem"); // 16px
    });

    it("should have proper contrast colors for text", () => {
      // Primary text should be dark for good contrast on light backgrounds
      expect(typography.textColor.primary).toBe(colors.neutral[900]);
      
      // Inverse text should be white for dark backgrounds
      expect(typography.textColor.inverse).toBe("#ffffff");
    });
  });

  describe("Token Immutability", () => {
    it("should have tokens marked as const", () => {
      // This test ensures TypeScript const assertions are working
      // If tokens were mutable, TypeScript would allow property assignment
      expect(() => {
        // @ts-expect-error - Should not be able to modify const tokens
        colors.primary[500] = "#000000";
      }).not.toThrow(); // Runtime doesn't prevent this, but TS should catch it
    });
  });
});