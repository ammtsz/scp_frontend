import {
  LIGHT_BATH_COLORS,
  COLOR_GROUPS,
  COLOR_DISPLAY_NAMES,
  isValidLightBathColor,
  type LightBathColor
} from '../treatmentColors';

describe('treatmentColors', () => {
  describe('LIGHT_BATH_COLORS', () => {
    test('should contain all expected colors', () => {
      expect(LIGHT_BATH_COLORS).toEqual([
        'azul',
        'verde',
        'amarelo',
        'vermelho',
        'violeta',
        'branco',
        'laranja'
      ]);
    });

    test('should be a readonly array', () => {
      expect(Array.isArray(LIGHT_BATH_COLORS)).toBe(true);
      expect(LIGHT_BATH_COLORS.length).toBe(7);
    });
  });

  describe('COLOR_GROUPS', () => {
    test('should have correct primary colors', () => {
      expect(COLOR_GROUPS.primary).toEqual(['azul', 'verde', 'vermelho']);
    });

    test('should have correct secondary colors', () => {
      expect(COLOR_GROUPS.secondary).toEqual(['amarelo', 'violeta', 'laranja']);
    });

    test('should have correct neutral colors', () => {
      expect(COLOR_GROUPS.neutral).toEqual(['branco']);
    });

    test('should contain all colors from LIGHT_BATH_COLORS', () => {
      const allGroupColors = [
        ...COLOR_GROUPS.primary,
        ...COLOR_GROUPS.secondary,
        ...COLOR_GROUPS.neutral
      ];
      expect(allGroupColors.sort()).toEqual([...LIGHT_BATH_COLORS].sort());
    });
  });

  describe('COLOR_DISPLAY_NAMES', () => {
    test('should have display names for all colors', () => {
      LIGHT_BATH_COLORS.forEach(color => {
        expect(COLOR_DISPLAY_NAMES[color]).toBeDefined();
        expect(typeof COLOR_DISPLAY_NAMES[color]).toBe('string');
        expect(COLOR_DISPLAY_NAMES[color].length).toBeGreaterThan(0);
      });
    });

    test('should have correct display names', () => {
      expect(COLOR_DISPLAY_NAMES.azul).toBe('Azul');
      expect(COLOR_DISPLAY_NAMES.verde).toBe('Verde');
      expect(COLOR_DISPLAY_NAMES.amarelo).toBe('Amarelo');
      expect(COLOR_DISPLAY_NAMES.vermelho).toBe('Vermelho');
      expect(COLOR_DISPLAY_NAMES.violeta).toBe('Violeta');
      expect(COLOR_DISPLAY_NAMES.branco).toBe('Branco');
      expect(COLOR_DISPLAY_NAMES.laranja).toBe('Laranja');
    });

    test('should have Portuguese capitalized names', () => {
      Object.values(COLOR_DISPLAY_NAMES).forEach(displayName => {
        expect(displayName[0]).toBe(displayName[0].toUpperCase());
      });
    });
  });

  describe('isValidLightBathColor', () => {
    test('should return true for valid colors', () => {
      LIGHT_BATH_COLORS.forEach(color => {
        expect(isValidLightBathColor(color)).toBe(true);
      });
    });

    test('should return false for invalid colors', () => {
      const invalidColors = [
        'rosa',
        'preto',
        'cinza',
        'marrom',
        'invalid',
        '',
        'AZUL',
        'Verde',
        'VERMELHO'
      ];

      invalidColors.forEach(color => {
        expect(isValidLightBathColor(color)).toBe(false);
      });
    });

    test('should return false for non-string values', () => {
      expect(isValidLightBathColor(null as unknown as string)).toBe(false);
      expect(isValidLightBathColor(undefined as unknown as string)).toBe(false);
      expect(isValidLightBathColor(123 as unknown as string)).toBe(false);
      expect(isValidLightBathColor(true as unknown as string)).toBe(false);
      expect(isValidLightBathColor({} as unknown as string)).toBe(false);
      expect(isValidLightBathColor([] as unknown as string)).toBe(false);
    });

    test('should be case sensitive', () => {
      expect(isValidLightBathColor('Azul')).toBe(false);
      expect(isValidLightBathColor('AZUL')).toBe(false);
      expect(isValidLightBathColor('azuL')).toBe(false);
      expect(isValidLightBathColor('azul')).toBe(true);
    });

    test('should handle whitespace', () => {
      expect(isValidLightBathColor(' azul')).toBe(false);
      expect(isValidLightBathColor('azul ')).toBe(false);
      expect(isValidLightBathColor(' azul ')).toBe(false);
      expect(isValidLightBathColor('\tazul')).toBe(false);
      expect(isValidLightBathColor('azul\n')).toBe(false);
    });

    test('should work with type guard functionality', () => {
      const testColor: string = 'azul';
      
      if (isValidLightBathColor(testColor)) {
        // Type should be narrowed to LightBathColor
        const validColor: LightBathColor = testColor;
        expect(COLOR_DISPLAY_NAMES[validColor]).toBe('Azul');
      }
    });

    test('should handle edge cases', () => {
      expect(isValidLightBathColor('')).toBe(false);
      expect(isValidLightBathColor('azul,verde')).toBe(false);
      expect(isValidLightBathColor('azul verde')).toBe(false);
      expect(isValidLightBathColor('azul-claro')).toBe(false);
    });
  });

  describe('type safety', () => {
    test('should ensure LightBathColor type matches array values', () => {
      // This test ensures our type is correctly derived from the array
      const color: LightBathColor = 'azul';
      expect(LIGHT_BATH_COLORS.includes(color)).toBe(true);
    });

    test('should work with COLOR_DISPLAY_NAMES type safety', () => {
      LIGHT_BATH_COLORS.forEach(color => {
        // This should compile without issues due to proper typing
        const displayName = COLOR_DISPLAY_NAMES[color];
        expect(typeof displayName).toBe('string');
      });
    });
  });
});