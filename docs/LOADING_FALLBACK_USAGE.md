# LoadingFallback Component Usage Guide

## Overview

The `LoadingFallback` component provides a consistent, customizable loading experience for lazy-loaded components throughout the application.

## Basic Usage

```tsx
import LoadingFallback from "@/components/common/LoadingFallback";

// Default usage
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>;
```

## Props

| Prop          | Type                             | Default           | Description                      |
| ------------- | -------------------------------- | ----------------- | -------------------------------- |
| `message`     | `string`                         | `"Carregando..."` | Custom loading message           |
| `size`        | `'small' \| 'medium' \| 'large'` | `'medium'`        | Size of the loading indicator    |
| `showSpinner` | `boolean`                        | `true`            | Whether to show animated spinner |
| `className`   | `string`                         | `''`              | Additional CSS classes           |

## Usage Examples

### Different Sizes

```tsx
// Small (for modals, small components)
<LoadingFallback
  message="Carregando modal..."
  size="small"
/>

// Medium (default, for forms and components)
<LoadingFallback
  message="Carregando formulário..."
  size="medium"
/>

// Large (for full pages, major features)
<LoadingFallback
  message="Carregando quadro de atendimentos..."
  size="large"
/>
```

### Without Spinner

```tsx
<LoadingFallback message="Processando dados..." showSpinner={false} />
```

### Custom Styling

```tsx
<LoadingFallback
  message="Carregando..."
  className="bg-blue-50 rounded-lg border"
/>
```

## Current Usage in Application

### Route-Level Loading

- **Attendance Page**: `"Carregando quadro de atendimentos..."` (large)
- **Agenda Page**: `"Carregando calendário da agenda..."` (large)
- **New Patient Page**: `"Carregando formulário de cadastro..."` (medium)

### Modal Loading

- **Attendance Modals**: `"Carregando modais..."` (small)
- **Treatment Modal**: `"Carregando modal de tratamento..."` (small)

## Accessibility Features

- Uses `role="status"` for screen reader compatibility
- Proper ARIA labels for loading states
- Semantic HTML structure

## CSS Classes Applied

### Size Variations

- **Small**: `p-4 text-sm` with `w-4 h-4` spinner
- **Medium**: `p-8 text-base` with `w-6 h-6` spinner
- **Large**: `p-12 text-lg` with `w-8 h-8` spinner

### Styling

- Container: `flex items-center justify-center`
- Content: `flex items-center space-x-3`
- Spinner: `border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`
- Text: `text-gray-600 font-medium`

## Best Practices

1. **Match message to context**: Use specific, user-friendly Portuguese messages
2. **Choose appropriate size**:
   - `small` for modals and small components
   - `medium` for forms and regular components
   - `large` for full-page loading
3. **Consider spinner usage**: Disable for very quick loads or text-only contexts
4. **Maintain consistency**: Use similar messages for similar features
