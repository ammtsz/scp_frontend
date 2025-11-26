// Filter types for treatment tracking page

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: SessionFilters;
  createdAt: Date;
}

export interface SessionFilters {
  searchTerm: string;
  treatmentTypes: string[];
  statuses: string[];
  dateRange: DateRange;
}

export const defaultFilters: SessionFilters = {
  searchTerm: '',
  treatmentTypes: [],
  statuses: [],
  dateRange: { start: null, end: null }
};

export const TREATMENT_TYPE_OPTIONS = [
  { value: 'light_bath', label: 'Banho de Luz', icon: '💡' },
  { value: 'rod', label: 'Bastão', icon: '🪄' }
] as const;

export const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendado', icon: '📅' },
  { value: 'completed', label: 'Concluído', icon: '✅' },
  { value: 'cancelled', label: 'Cancelado', icon: '❌' },
] as const;

export const DATE_PRESETS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'custom', label: 'Período personalizado' }
] as const;