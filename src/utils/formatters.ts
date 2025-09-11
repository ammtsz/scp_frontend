// Formatter utilities for treatment tracking components

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return "";
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return String(dateInput);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to HH:MM format
 */
export function formatTime(timeInput: string | Date): string {
  if (!timeInput) return "";
  
  let date: Date;
  
  if (typeof timeInput === 'string') {
    // If it's a time string like "14:30:00", create a date with that time
    if (timeInput.includes(':') && !timeInput.includes('T')) {
      const today = new Date();
      const [hours, minutes] = timeInput.split(':').map(Number);
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
    } else {
      date = new Date(timeInput);
    }
  } else {
    date = timeInput;
  }
  
  if (isNaN(date.getTime())) return String(timeInput);
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format date and time together
 */
export function formatDateTime(dateTimeInput: string | Date): string {
  if (!dateTimeInput) return "";
  
  const date = typeof dateTimeInput === 'string' ? new Date(dateTimeInput) : dateTimeInput;
  
  if (isNaN(date.getTime())) return String(dateTimeInput);
  
  return `${formatDate(date)} às ${formatTime(date)}`;
}

/**
 * Check if a date is today
 */
export function isToday(dateInput: string | Date): boolean {
  if (!dateInput) return false;
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past
 */
export function isPast(dateInput: string | Date): boolean {
  if (!dateInput) return false;
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  
  return date < now;
}

/**
 * Get relative time description (e.g., "hoje", "amanhã", "em 3 dias")
 */
export function getRelativeTimeDescription(dateInput: string | Date): string {
  if (!dateInput) return "";
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const today = new Date();
  
  // Reset time to compare only dates
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "amanhã";
  if (diffDays === -1) return "ontem";
  if (diffDays > 1) return `em ${diffDays} dias`;
  if (diffDays < -1) return `há ${Math.abs(diffDays)} dias`;
  
  return formatDate(date);
}
