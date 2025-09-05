// Common form utility functions

/**
 * Safely formats a date for HTML input[type="date"] fields
 * @param date - Date object or null
 * @returns Formatted date string (YYYY-MM-DD) or empty string
 */
export function formatDateForInput(date: Date | null): string {
  if (!date || isNaN(date.getTime())) {
    return "";
  }
  try {
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Formats phone number for Brazilian standards
 * @param value - Raw phone input
 * @returns Formatted phone number (XX) XXXXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return "";
  
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, "");
  
  // Format as (XX) XXXXX-XXXX for Brazilian phones
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else {
    // Limit to 11 digits
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

/**
 * Safely creates a Date from string input
 * @param dateString - Date string input
 * @returns Valid Date object or current date
 */
export function createSafeDate(dateString: string): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns True if valid or empty, false otherwise
 */
export function validatePhoneFormat(phone: string): boolean {
  if (!phone) return true; // Optional field
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
}

/**
 * Common form validation for patient data
 * @param data - Patient form data
 * @param requirePhone - Whether phone is required
 * @param requireBirthDate - Whether birth date is required
 * @returns Validation error message or null if valid
 */
export function validatePatientForm(
  data: {
    name: string;
    phone: string;
    birthDate: Date | null;
  },
  requirePhone = false,
  requireBirthDate = false
): string | null {
  if (!data.name.trim()) {
    return "Nome é obrigatório";
  }

  if (requireBirthDate && !data.birthDate) {
    return "Data de nascimento é obrigatória";
  }

  if (requirePhone && !data.phone.trim()) {
    return "Telefone é obrigatório";
  }

  if (data.phone && !validatePhoneFormat(data.phone)) {
    return "Telefone deve estar no formato (XX) XXXXX-XXXX";
  }

  return null;
}
