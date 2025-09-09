/**
 * Patient Service - Centralized business logic for patient operations
 * 
 * This service handles all patient-related operations that are used within
 * the AttendanceManagement component.
 */

import { createPatient, updatePatient } from "@/api/patients";
import { IPatient, IPriority } from "@/types/globals";
import { transformPriorityToApi } from "@/utils/apiTransformers";

export interface CreatePatientParams {
  name: string;
  phone?: string;
  priority: IPriority;
  birthDate: Date;
  mainComplaint?: string;
}

export interface UpdatePatientParams {
  id: number;
  name?: string;
  phone?: string;
  priority?: IPriority;
  birthDate?: Date;
  mainComplaint?: string;
}

/**
 * Patient Service Class
 */
export class PatientService {
  /**
   * Create a new patient
   */
  static async createPatient({
    name,
    phone,
    priority,
    birthDate,
    mainComplaint
  }: CreatePatientParams) {
    try {
      const result = await createPatient({
        name: name.trim(),
        phone: phone?.trim() || undefined,
        priority: transformPriorityToApi(priority),
        birth_date: birthDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        main_complaint: mainComplaint?.trim() || undefined,
      });

      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error creating patient:", error);
      return {
        success: false,
        data: null,
        error: "Failed to create patient"
      };
    }
  }

  /**
   * Update an existing patient
   */
  static async updatePatient({
    id,
    name,
    phone,
    priority,
    birthDate,
    mainComplaint
  }: UpdatePatientParams) {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (name !== undefined) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone?.trim() || null;
      if (priority !== undefined) updateData.priority = transformPriorityToApi(priority);
      if (birthDate !== undefined) updateData.birth_date = birthDate.toISOString().split('T')[0];
      if (mainComplaint !== undefined) updateData.main_complaint = mainComplaint?.trim() || null;

      const result = await updatePatient(id.toString(), updateData);

      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error updating patient:", error);
      return {
        success: false,
        data: null,
        error: "Failed to update patient"
      };
    }
  }

  /**
   * Validate patient data before creation/update
   */
  static validatePatientData({
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
   * Format patient data for display
   */
  static formatPatientForDisplay(patient: IPatient) {
    return {
      ...patient,
      formattedPhone: patient.phone 
        ? patient.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        : 'N/A',
      formattedBirthDate: patient.birthDate.toLocaleDateString('pt-BR'),
      age: this.calculateAge(patient.birthDate)
    };
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export default PatientService;
