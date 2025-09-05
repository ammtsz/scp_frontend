/**
 * Light bath colors for spiritual center treatments
 * Based on SCP requirements for treatment color selection
 */
export const LIGHT_BATH_COLORS = [
  'azul',
  'verde', 
  'amarelo',
  'vermelho',
  'violeta',
  'branco',
  'laranja'
] as const;

export type LightBathColor = typeof LIGHT_BATH_COLORS[number];

/**
 * Color groups for better UX organization
 */
export const COLOR_GROUPS = {
  primary: ['azul', 'verde', 'vermelho'] as const,
  secondary: ['amarelo', 'violeta', 'laranja'] as const,
  neutral: ['branco'] as const,
} as const;

/**
 * Display names for colors in Portuguese
 */
export const COLOR_DISPLAY_NAMES: Record<LightBathColor, string> = {
  azul: 'Azul',
  verde: 'Verde',
  amarelo: 'Amarelo',
  vermelho: 'Vermelho',
  violeta: 'Violeta',
  branco: 'Branco',
  laranja: 'Laranja'
};

/**
 * Validates if a color is a valid light bath color
 */
export const isValidLightBathColor = (color: string): color is LightBathColor => {
  return LIGHT_BATH_COLORS.includes(color as LightBathColor);
};
