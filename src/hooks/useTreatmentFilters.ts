"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  SessionFilters, 
  FilterPreset, 
  defaultFilters, 
  DateRange 
} from '@/types/filters';
import { TreatmentSessionResponseDto } from '@/api/types';

const STORAGE_KEYS = {
  PRESETS: 'treatment-filter-presets',
  LAST_FILTERS: 'treatment-last-filters'
} as const;

export function useTreatmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SessionFilters>(defaultFilters);
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    if (urlFilters) {
      setFilters(urlFilters);
    } else {
      // Load last used filters from localStorage
      const lastFilters = loadLastFilters();
      if (lastFilters) {
        setFilters(lastFilters);
      }
    }

    // Load saved presets
    const presets = loadSavedPresets();
    setSavedPresets(presets);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const url = buildURLWithFilters(filters);
    router.replace(url, { scroll: false });
    
    // Save last used filters
    saveLastFilters(filters);
  }, [filters, router]);

  // Filter function for sessions
  const filterSessions = useCallback((sessions: TreatmentSessionResponseDto[], patients?: { id: number; name: string }[]) => {
    return sessions.filter(session => {
      // Search term filter (patient name or session info)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        let matchesSearch = 
          session.body_location?.toLowerCase().includes(searchLower) ||
          session.notes?.toLowerCase().includes(searchLower) ||
          session.treatment_type.toLowerCase().includes(searchLower);
        
        // Also search patient names if patients data is available
        if (!matchesSearch && patients) {
          const patient = patients.find(p => p.id === session.patient_id);
          if (patient && patient.name.toLowerCase().includes(searchLower)) {
            matchesSearch = true;
          }
        }
        
        if (!matchesSearch) return false;
      }

      // Treatment type filter
      if (filters.treatmentTypes.length > 0) {
        if (!filters.treatmentTypes.includes(session.treatment_type)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(session.status)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const sessionDate = new Date(session.start_date);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (sessionDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (sessionDate > endDate) return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Update individual filter values
  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const updateTreatmentTypes = useCallback((treatmentTypes: string[]) => {
    setFilters(prev => ({ ...prev, treatmentTypes }));
  }, []);

  const updateStatuses = useCallback((statuses: string[]) => {
    setFilters(prev => ({ ...prev, statuses }));
  }, []);

  const updateDateRange = useCallback((dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  // Date preset handlers
  const setDatePreset = useCallback((preset: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (preset) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = null;
        end = null;
    }

    updateDateRange({ start, end });
  }, [updateDateRange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Preset management
  const savePreset = useCallback((name: string) => {
    const preset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date()
    };

    const updatedPresets = [...savedPresets, preset];
    setSavedPresets(updatedPresets);
    
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updatedPresets));
  }, [filters, savedPresets]);

  const loadPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters);
  }, []);

  const deletePreset = useCallback((presetId: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updatedPresets));
  }, [savedPresets]);

  // Check if filters are active (not default)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.treatmentTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null
    );
  }, [filters]);

  return {
    filters,
    filterSessions,
    updateSearchTerm,
    updateTreatmentTypes,
    updateStatuses,
    updateDateRange,
    setDatePreset,
    clearFilters,
    hasActiveFilters,
    savedPresets,
    savePreset,
    loadPreset,
    deletePreset
  };
}

// Helper functions
function parseFiltersFromURL(searchParams: URLSearchParams): SessionFilters | null {
  try {
    const search = searchParams.get('search');
    const types = searchParams.get('types');
    const statuses = searchParams.get('statuses');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!search && !types && !statuses && !startDate && !endDate) {
      return null;
    }

    return {
      searchTerm: search || '',
      treatmentTypes: types ? types.split(',') : [],
      statuses: statuses ? statuses.split(',') : [],
      dateRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null
      }
    };
  } catch (error) {
    console.error('Error parsing filters from URL:', error);
    return null;
  }
}

function buildURLWithFilters(filters: SessionFilters): string {
  const params = new URLSearchParams();
  
  if (filters.searchTerm) {
    params.set('search', filters.searchTerm);
  }
  
  if (filters.treatmentTypes.length > 0) {
    params.set('types', filters.treatmentTypes.join(','));
  }
  
  if (filters.statuses.length > 0) {
    params.set('statuses', filters.statuses.join(','));
  }
  
  if (filters.dateRange.start) {
    params.set('startDate', filters.dateRange.start.toISOString().split('T')[0]);
  }
  
  if (filters.dateRange.end) {
    params.set('endDate', filters.dateRange.end.toISOString().split('T')[0]);
  }

  const queryString = params.toString();
  return `/treatment-tracking${queryString ? `?${queryString}` : ''}`;
}

function loadSavedPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!stored) return [];
    
    const presets = JSON.parse(stored) as FilterPreset[];
    return presets.map((preset) => ({
      ...preset,
      createdAt: new Date(preset.createdAt),
      filters: {
        ...preset.filters,
        dateRange: {
          start: preset.filters.dateRange.start ? new Date(preset.filters.dateRange.start) : null,
          end: preset.filters.dateRange.end ? new Date(preset.filters.dateRange.end) : null
        }
      }
    }));
  } catch (error) {
    console.error('Error loading saved presets:', error);
    return [];
  }
}

function saveLastFilters(filters: SessionFilters): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving last filters:', error);
  }
}

function loadLastFilters(): SessionFilters | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_FILTERS);
    if (!stored) return null;
    
    const filters = JSON.parse(stored);
    return {
      ...filters,
      dateRange: {
        start: filters.dateRange.start ? new Date(filters.dateRange.start) : null,
        end: filters.dateRange.end ? new Date(filters.dateRange.end) : null
      }
    };
  } catch (error) {
    console.error('Error loading last filters:', error);
    return null;
  }
}