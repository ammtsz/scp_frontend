/**
 * Patient Utility Functions
 * 
 * Pure utility functions for patient data validation and calculations.
 * These functions don't involve API calls and can be used across the application.
 */

import { Patient } from "@/types/types";

/**
 * Validate patient data before creation/update
 */
export function validatePatientData({
  name,
  phone,
  birthDate
}: {
  name: string;
  phone?: string;
  birthDate: Date;
}) {
  const errors: string[] = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Phone validation (optional but must be valid if provided)
  if (phone && phone.trim().length > 0) {
    const phoneRegex = /^\d{10,15}$/; // Simple phone validation
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      errors.push("Phone number must be 10-15 digits");
    }
  }

  // Birth date validation
  const today = new Date();
  if (birthDate > today) {
    errors.push("Birth date cannot be in the future");
  }

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120); // Max 120 years old
  if (birthDate < minDate) {
    errors.push("Birth date is too far in the past");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format patient data for display
 */
export function formatPatientForDisplay(patient: Patient) {
  return {
    ...patient,
    formattedPhone: patient.phone 
      ? patient.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : 'N/A',
    formattedBirthDate: patient.birthDate.toLocaleDateString('pt-BR'),
    age: calculateAge(patient.birthDate)
  };
}