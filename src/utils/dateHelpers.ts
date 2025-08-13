// Date helper functions

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

// TODO: Implement date calculations for scheduling and history
