/**
 * Design System Tokens for MVP Center
 * 
 * This file defines the standardized design tokens used throughout the application.
 * All components should reference these tokens for consistent visual design.
 */

// ===========================================
// COLOR PALETTE
// ===========================================

export const colors = {
  // Primary Colors (Blue theme for healthcare)
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Soft blue
    300: '#93c5fd',  // Medium blue
    400: '#60a5fa',  // Bright blue
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',  // Dark blue
    700: '#1d4ed8',  // Darker blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Deepest blue
  },

  // Status Colors
  status: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },

  // Priority Colors (for patient priority levels)
  priority: {
    emergency: {
      bg: '#fef2f2',      // error-50
      text: '#991b1b',     // error-800
      border: '#fecaca',   // error-200
      icon: '🚨'
    },
    intermediate: {
      bg: '#fffbeb',       // warning-50
      text: '#92400e',     // warning-800
      border: '#fde68a',   // warning-200
      icon: '⚠️'
    },
    normal: {
      bg: '#f0fdf4',       // success-50
      text: '#166534',     // success-800
      border: '#bbf7d0',   // success-200
      icon: '✅'
    },
  },

  // Neutral Colors (Gray scale)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Treatment Type Colors
  treatment: {
    spiritual: {
      bg: '#f3e8ff',       // purple-50
      text: '#6b21a8',     // purple-800
      border: '#c4b5fd',   // purple-200
      icon: '🔮'
    },
    lightBath: {
      bg: '#fffbeb',       // yellow-50
      text: '#92400e',     // yellow-800
      border: '#fde68a',   // yellow-200
      icon: '💡'
    },
    rod: {
      bg: '#f3e8ff',       // purple-50
      text: '#6b21a8',     // purple-800
      border: '#c4b5fd',   // purple-200
      icon: '⚡'
    },
  },

  // Surface Colors
  surface: {
    background: '#f9fafb',    // neutral-50
    card: '#ffffff',          // white
    overlay: 'rgba(0, 0, 0, 0.50)',
    border: '#e5e7eb',        // neutral-200
    divider: '#d1d5db',       // neutral-300
  },
} as const;

// ===========================================
// TYPOGRAPHY
// ===========================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['Fira Code', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Text Colors
  textColor: {
    primary: colors.neutral[900],      // Main text
    secondary: colors.neutral[600],    // Secondary text
    muted: colors.neutral[500],        // Muted text
    placeholder: colors.neutral[400],  // Placeholder text
    inverse: '#ffffff',                // White text
    link: colors.primary[600],         // Link text
    linkHover: colors.primary[700],    // Link hover
  },
} as const;

// ===========================================
// SPACING
// ===========================================

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ===========================================
// LAYOUT & SIZING
// ===========================================

export const layout = {
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',     // 2px
    base: '0.25rem',    // 4px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    full: '9999px',     // fully rounded
  },

  // Shadows
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Minimum Touch Targets (Mobile Accessibility)
  minTouchTarget: {
    mobile: '48px',     // iOS/Android minimum
    desktop: '44px',    // Web accessibility minimum
  },

  // Container Max Widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// ===========================================
// COMPONENT TOKENS
// ===========================================

export const components = {
  // Card Component
  card: {
    background: colors.surface.card,
    border: colors.surface.border,
    borderRadius: layout.borderRadius.lg,
    shadow: layout.boxShadow.sm,
    padding: spacing[6],
  },

  // Button Component
  button: {
    borderRadius: layout.borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    minHeight: layout.minTouchTarget.desktop,
    padding: {
      x: spacing[4],
      y: spacing[2],
    },
    variants: {
      primary: {
        background: colors.primary[600],
        color: typography.textColor.inverse,
        hover: colors.primary[700],
      },
      secondary: {
        background: colors.primary[100],
        color: colors.primary[700],
        hover: colors.primary[200],
      },
      success: {
        background: colors.status.success[600],
        color: typography.textColor.inverse,
        hover: colors.status.success[700],
      },
      warning: {
        background: colors.status.warning[600],
        color: typography.textColor.inverse,
        hover: colors.status.warning[700],
      },
      error: {
        background: colors.status.error[600],
        color: typography.textColor.inverse,
        hover: colors.status.error[700],
      },
    },
  },

  // Form Input Component
  input: {
    borderRadius: layout.borderRadius.md,
    fontSize: typography.fontSize.base, // 16px to prevent iOS zoom
    minHeight: layout.minTouchTarget.desktop,
    padding: {
      x: spacing[3],
      y: spacing[2],
    },
    border: colors.surface.border,
    focus: {
      border: colors.primary[500],
      shadow: `0 0 0 3px ${colors.primary[100]}`,
    },
  },

  // Badge Component
  badge: {
    borderRadius: layout.borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    padding: {
      x: spacing[3],
      y: spacing[1],
    },
  },
} as const;

// ===========================================
// BREAKPOINTS
// ===========================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get priority colors based on priority level
 */
export const getPriorityColors = (priority: string | number) => {
  const p = priority.toString();
  switch (p) {
    case '1':
      return colors.priority.emergency;
    case '2':
      return colors.priority.intermediate;
    case '3':
      return colors.priority.normal;
    default:
      return {
        bg: colors.neutral[100],
        text: colors.neutral[600],
        border: colors.neutral[200],
        icon: '📋',
      };
  }
};

/**
 * Get treatment type colors based on treatment type
 */
export const getTreatmentColors = (type: string) => {
  switch (type) {
    case 'spiritual':
      return colors.treatment.spiritual;
    case 'lightBath':
    case 'light_bath':
      return colors.treatment.lightBath;
    case 'rod':
      return colors.treatment.rod;
    default:
      return colors.treatment.spiritual;
  }
};

/**
 * Get status colors based on status type
 */
export const getStatusColors = (status: 'success' | 'warning' | 'error' | 'info') => {
  return colors.status[status];
};

// Export all tokens as default
export default {
  colors,
  typography,
  spacing,
  layout,
  components,
  breakpoints,
  getPriorityColors,
  getTreatmentColors,
  getStatusColors,
} as const;