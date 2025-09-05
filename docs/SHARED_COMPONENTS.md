# Shared Components Documentation

This document provides comprehensive documentation for the shared components created as part of the code redundancy elimination effort.

## Overview

During the refactoring process, we identified and consolidated common UI patterns into reusable components. These components provide consistent behavior, styling, and error handling across the application.

## Components

### BaseModal

**Location**: `/src/components/common/BaseModal.tsx`

A standardized modal component that provides consistent styling and behavior for all modal dialogs in the application.

#### Props

```typescript
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showCloseButton?: boolean;
}
```

#### Usage

```tsx
import BaseModal from "@/components/common/BaseModal";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Patient Information"
      subtitle="Update patient details"
      maxWidth="lg"
    >
      <form>{/* Modal content */}</form>
    </BaseModal>
  );
}
```

#### Features

- **Consistent styling**: Standard modal appearance across the application
- **Keyboard support**: ESC key to close
- **Click outside to close**: Clicking the backdrop closes the modal
- **Responsive sizing**: Configurable max width for different screen sizes
- **Accessibility**: Proper ARIA labels and focus management

### ErrorDisplay

**Location**: `/src/components/common/ErrorDisplay.tsx`

A standardized error display component that provides consistent error messaging throughout the application.

#### Props

```typescript
interface ErrorDisplayProps {
  error: string | null;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

#### Usage

```tsx
import ErrorDisplay from "@/components/common/ErrorDisplay";

function MyForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form>
      <ErrorDisplay
        error={error}
        dismissible
        onDismiss={() => setError(null)}
      />
      {/* Form fields */}
    </form>
  );
}
```

#### Features

- **Consistent styling**: Red background with appropriate padding and borders
- **Dismissible option**: Optional close button for user-dismissible errors
- **Conditional rendering**: Only renders when error is present
- **Customizable styling**: Additional CSS classes can be applied

### LoadingButton

**Location**: `/src/components/common/LoadingButton.tsx`

A button component that shows loading state during async operations, preventing double-submissions and providing user feedback.

#### Props

```typescript
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}
```

#### Usage

```tsx
import LoadingButton from "@/components/common/LoadingButton";

function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoadingButton
      onClick={handleSubmit}
      isLoading={isSubmitting}
      loadingText="Salvando..."
      variant="primary"
    >
      Salvar
    </LoadingButton>
  );
}
```

#### Features

- **Loading states**: Automatic spinner and text replacement during loading
- **Disabled during loading**: Prevents double-clicks and multiple submissions
- **Variant styles**: Primary, secondary, and danger styling options
- **Accessible**: Proper ARIA states for screen readers

## Form Hooks

### useFormHandler

**Location**: `/src/hooks/useFormHandler.ts`

A generic form handling hook that provides common form patterns including state management, validation, and submission handling.

#### Props

```typescript
interface UseFormHandlerOptions<T> {
  initialState: T;
  onSubmit?: (data: T) => Promise<void> | void;
  validate?: (data: T) => string | null;
  formatters?: {
    [K in keyof T]?: (value: unknown) => unknown;
  };
}
```

#### Usage

```tsx
import { useFormHandler } from "@/hooks/useFormHandler";

interface FormData {
  name: string;
  email: string;
  quantity: number;
}

function MyForm() {
  const { formData, handleChange, handleSubmit, isLoading, error, resetForm } =
    useFormHandler<FormData>({
      initialState: {
        name: "",
        email: "",
        quantity: 1,
      },
      onSubmit: async (data) => {
        await api.submitForm(data);
      },
      validate: (data) => {
        if (!data.name) return "Name is required";
        if (!data.email) return "Email is required";
        return null;
      },
      formatters: {
        quantity: (value) => Math.max(1, parseInt(value as string) || 1),
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <input
        name="quantity"
        type="number"
        value={formData.quantity}
        onChange={handleChange}
      />
      <ErrorDisplay error={error} />
      <LoadingButton isLoading={isLoading}>Submit</LoadingButton>
    </form>
  );
}
```

#### Features

- **Generic type support**: Fully typed form data handling
- **Automatic validation**: Built-in validation with error display
- **Field formatters**: Transform input values (e.g., phone formatting)
- **Loading states**: Automatic loading state management
- **Error handling**: Consistent error state management

### usePatientFormHandler

**Location**: `/src/hooks/useFormHandler.ts`

A specialized version of `useFormHandler` optimized for patient forms with built-in validation and formatting for common patient fields.

#### Usage

```tsx
import { usePatientFormHandler } from "@/hooks/useFormHandler";

interface PatientData {
  name: string;
  phone: string;
  birthDate: Date | null;
}

function PatientForm() {
  const { formData, handleChange, handleSubmit, isLoading, error } =
    usePatientFormHandler<PatientData>({
      initialState: {
        name: "",
        phone: "",
        birthDate: null,
      },
      onSubmit: async (data) => {
        await api.createPatient(data);
      },
      requirePhone: true,
      requireBirthDate: true,
    });

  return (
    <form onSubmit={handleSubmit}>
      {/* Phone will be automatically formatted */}
      {/* Birth date will be automatically validated */}
      {/* Form fields */}
    </form>
  );
}
```

#### Features

- **Built-in patient validation**: Name, phone, and birth date validation
- **Automatic phone formatting**: Brazilian phone number formatting
- **Date handling**: Safe date parsing and validation
- **Configurable requirements**: Optional phone and birth date validation

## Utility Functions

### formHelpers.ts

**Location**: `/src/utils/formHelpers.ts`

Utility functions for form handling, validation, and formatting.

#### Key Functions

- `formatPhoneNumber(phone: string)`: Formats phone numbers in Brazilian format
- `formatDateForInput(date: Date | null)`: Formats dates for HTML input fields
- `validatePatientForm(data, requirePhone, requireBirthDate)`: Validates patient form data
- `createSafeDate(dateString: string)`: Safely creates Date objects from strings

## Migration Guide

### From Custom Form State to useFormHandler

**Before:**

```tsx
const [formData, setFormData] = useState(initialData);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleChange = (e) => {
  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await onSubmit(formData);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**After:**

```tsx
const {
  formData,
  handleChange,
  handleSubmit,
  isLoading,
  error,
} = useFormHandler({
  initialState: initialData,
  onSubmit,
  validate: (data) => /* validation logic */,
});
```

### From Custom Modals to BaseModal

**Before:**

```tsx
{
  isOpen && (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Title</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
```

**After:**

```tsx
<BaseModal isOpen={isOpen} onClose={onClose} title="Title">
  {children}
</BaseModal>
```

## Best Practices

1. **Use BaseModal for all modal dialogs** to ensure consistent UX
2. **Use ErrorDisplay for all error messages** to maintain visual consistency
3. **Use LoadingButton for async actions** to prevent double-submissions
4. **Use useFormHandler for complex forms** to reduce boilerplate
5. **Use usePatientFormHandler for patient-related forms** to leverage built-in validation

## Testing

All shared components include comprehensive test coverage:

- Unit tests for component behavior
- Integration tests for form hooks
- Accessibility tests for modal components
- Error handling tests for all components

Run tests with: `npm test`

## Performance Considerations

- All components are optimized with React.memo where appropriate
- Hooks use useCallback and useMemo to prevent unnecessary re-renders
- Form validation is debounced to improve performance
- Modal components use portal rendering for better performance

## Future Enhancements

Potential improvements for shared components:

1. **Advanced form validation**: Schema-based validation with libraries like Yup or Zod
2. **Form auto-save**: Automatic saving of form state to localStorage
3. **Enhanced accessibility**: More ARIA attributes and keyboard navigation
4. **Theming support**: CSS custom properties for easier theming
5. **Animation support**: Smooth transitions for modals and error displays
