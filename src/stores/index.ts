/**
 * Stores Barrel Export
 * 
 * Centralized exports for all Zustand stores
 */

// Attendance Store - Core drag & drop and workflow management
export { useAttendanceStore } from './attendanceStore';

// Agenda Store - Calendar and scheduling UI state  
export { useAgendaStore } from './agendaStore';

// Export store types for convenience
export type { AttendanceStore } from './attendanceStore';
export type { AgendaStore } from './agendaStore';