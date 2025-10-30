// Date helper functions

import { getNextAttendanceDate } from "@/api/attendances";

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  
  // Handle both ISO date strings and date objects
  let d: Date;
  if (dateStr.includes('T')) {
    // Full ISO string
    d = new Date(dateStr);
  } else {
    // Date-only string (YYYY-MM-DD) - parse as local time to avoid timezone issues
    d = new Date(dateStr + 'T00:00:00');
  }
  
  if (isNaN(d.getTime())) return dateStr;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateWithDayOfWeekBR(dateStr: string): string {
  if (!dateStr) return "";
  
  // Handle both ISO date strings and date objects
  let d: Date;
  if (dateStr.includes('T')) {
    // Full ISO string
    d = new Date(dateStr);
  } else {
    // Date-only string (YYYY-MM-DD) - parse as local time to avoid timezone issues
    d = new Date(dateStr + 'T00:00:00');
  }
  
  if (isNaN(d.getTime())) return dateStr;
  
  // Get today's date for comparison (at midnight to avoid time issues)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Set the input date to midnight for comparison
  const inputDate = new Date(d);
  inputDate.setHours(0, 0, 0, 0);
  
  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const monthsInPortuguese = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const dayOfWeek = daysOfWeek[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = monthsInPortuguese[d.getMonth()];
  const year = d.getFullYear();
  
  // Check if it's today or tomorrow
  if (inputDate.getTime() === today.getTime()) {
    return `HOJE - ${dayOfWeek}, ${day} de ${month} de ${year}`;
  } else if (inputDate.getTime() === tomorrow.getTime()) {
    return `AMANHÃ - ${dayOfWeek}, ${day} de ${month} de ${year}`;
  }
  
  return `${dayOfWeek}, ${day} de ${month} de ${year}`;
}

// Get the next available date based on schedule settings
export const getNextAvailableDate = async (): Promise<string> => {
  try {
    const result = await getNextAttendanceDate();
    if (result.success && result.value?.next_date) {
      return result.value.next_date;
    }
  } catch (error) {
    console.warn('Error fetching next available date, falling back to next Tuesday:', error);
  }
  
  // Fallback to next Tuesday if API call fails
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7; // 2 = Tuesday
  const nextTuesday = new Date(today);
  
  // If today is Tuesday, schedule for today, otherwise next Tuesday
  if (dayOfWeek === 2) {
    nextTuesday.setDate(today.getDate());
  } else {
    nextTuesday.setDate(today.getDate() + (daysUntilTuesday || 7));
  }
  
  return nextTuesday.toISOString().split('T')[0];
};

/**
 * Safe date formatting that handles both Date objects and string dates
 * @param date - Date object or string date
 * @returns Formatted date string in DD/MM/YYYY format or error message
 */
export const formatDateSafe = (date: Date | string): string => {
  try {
    // Handle both Date objects and string dates
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Data inválida";
    }

    return formatDateBR(dateObj.toISOString());
  } catch {
    return "Data inválida";
  }
};

/**
 * Calculate days until a scheduled date
 * @param scheduledDate - Date object or string date
 * @returns Number of days until the scheduled date (0 or positive)
 */
export const getDaysUntil = (scheduledDate: Date | string): number => {
  try {
    const today = new Date();
    const scheduled = new Date(scheduledDate);

    if (isNaN(scheduled.getTime())) {
      return 0;
    }

    const diffTime = scheduled.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
};

// Future: Implement additional date calculations for scheduling and history as needed
