import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PatientNotesCard } from "../PatientNotesCard";
import * as patientsApi from "@/api/patients";
import type { PatientNoteResponseDto } from "@/api/types";

// Mock the API functions
jest.mock("@/api/patients", () => ({
  getPatientNotes: jest.fn(),
  createPatientNote: jest.fn(),
  updatePatientNote: jest.fn(),
  deletePatientNote: jest.fn(),
}));

// Mock the formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: jest.fn((date: string) => {
    const mockDate = new Date(date);
    return mockDate.toLocaleDateString("pt-BR");
  }),
}));

const mockGetPatientNotes = patientsApi.getPatientNotes as jest.MockedFunction<
  typeof patientsApi.getPatientNotes
>;
const mockCreatePatientNote =
  patientsApi.createPatientNote as jest.MockedFunction<
    typeof patientsApi.createPatientNote
  >;
const mockUpdatePatientNote =
  patientsApi.updatePatientNote as jest.MockedFunction<
    typeof patientsApi.updatePatientNote
  >;
const mockDeletePatientNote =
  patientsApi.deletePatientNote as jest.MockedFunction<
    typeof patientsApi.deletePatientNote
  >;

const createMockNote = (
  id: number,
  overrides?: Partial<PatientNoteResponseDto>
): PatientNoteResponseDto => ({
  id,
  patient_id: 123,
  note_content: `Test note content ${id}`,
  category: "general",
  created_date: "2025-01-15",
  created_time: "10:30:00",
  updated_date: "2025-01-15",
  updated_time: "10:30:00",
  ...overrides,
});

describe("PatientNotesCard", () => {
  const defaultProps = {
    patientId: "123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no notes exist", async () => {
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [] });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("Nenhuma nota adicionada ainda.")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Clique em "Nova Nota" para adicionar observações importantes.'
      )
    ).toBeInTheDocument();
  });

  it("renders notes list when notes exist", async () => {
    const mockNotes = [
      createMockNote(1, { note_content: "First note", category: "treatment" }),
      createMockNote(2, {
        note_content: "Second note",
        category: "observation",
      }),
    ];

    mockGetPatientNotes.mockResolvedValue({ success: true, value: mockNotes });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("First note")).toBeInTheDocument();
      expect(screen.getByText("Second note")).toBeInTheDocument();
    });

    expect(screen.getByText("Tratamento")).toBeInTheDocument();
    expect(screen.getByText("Observação")).toBeInTheDocument();
  });

  it("handles API error when loading notes", async () => {
    mockGetPatientNotes.mockResolvedValue({
      success: false,
      error: "Paciente não encontrado",
    });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Paciente não encontrado")).toBeInTheDocument();
    });
  });

  it("allows adding a new note", async () => {
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [] });
    const newNote = createMockNote(1, { note_content: "New test note" });
    mockCreatePatientNote.mockResolvedValue({ success: true, value: newNote });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("✏️ Nova")).toBeInTheDocument();
    });

    // Click "Nova Nota" button
    fireEvent.click(screen.getByText("✏️ Nova"));

    // Form should appear
    expect(screen.getByPlaceholderText("Digite a nota...")).toBeInTheDocument();
    expect(screen.getByText("Categoria")).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByPlaceholderText("Digite a nota..."), {
      target: { value: "New test note" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Salvar Nota"));

    await waitFor(() => {
      expect(mockCreatePatientNote).toHaveBeenCalledWith("123", {
        note_content: "New test note",
        category: "general",
      });
    });

    // Note should appear in the list
    await waitFor(() => {
      expect(screen.getByText("New test note")).toBeInTheDocument();
    });
  });

  it("allows editing an existing note", async () => {
    const mockNote = createMockNote(1, { note_content: "Original note" });
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [mockNote] });

    const updatedNote = createMockNote(1, { note_content: "Updated note" });
    mockUpdatePatientNote.mockResolvedValue({
      success: true,
      value: updatedNote,
    });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Original note")).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText("Editar"));

    // Edit form should appear
    const textarea = screen.getByDisplayValue("Original note");
    expect(textarea).toBeInTheDocument();

    // Update content
    fireEvent.change(textarea, { target: { value: "Updated note" } });

    // Save changes
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => {
      expect(mockUpdatePatientNote).toHaveBeenCalledWith("123", "1", {
        note_content: "Updated note",
      });
    });

    // Updated content should appear
    await waitFor(() => {
      expect(screen.getByText("Updated note")).toBeInTheDocument();
    });
  });

  it("allows deleting a note with confirmation", async () => {
    const mockNote = createMockNote(1, { note_content: "Note to delete" });
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [mockNote] });
    mockDeletePatientNote.mockResolvedValue({ success: true });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Note to delete")).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText("Excluir"));

    // Confirmation should appear
    expect(
      screen.getByText("Tem certeza que deseja excluir esta nota?")
    ).toBeInTheDocument();

    // Confirm deletion (select the confirmation button, not the initial delete button)
    const confirmButtons = screen.getAllByText("Excluir");
    fireEvent.click(confirmButtons[1]); // The confirmation button

    await waitFor(() => {
      expect(mockDeletePatientNote).toHaveBeenCalledWith("123", "1");
    });

    // Note should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText("Note to delete")).not.toBeInTheDocument();
    });
  });

  it("allows canceling note deletion", async () => {
    const mockNote = createMockNote(1, { note_content: "Note to keep" });
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [mockNote] });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Note to keep")).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText("Excluir"));

    // Confirmation should appear
    expect(
      screen.getByText("Tem certeza que deseja excluir esta nota?")
    ).toBeInTheDocument();

    // Cancel deletion
    fireEvent.click(screen.getByText("Cancelar"));

    // Confirmation should disappear
    expect(
      screen.queryByText("Tem certeza que deseja excluir esta nota?")
    ).not.toBeInTheDocument();

    // Note should still be there
    expect(screen.getByText("Note to keep")).toBeInTheDocument();
  });

  it("validates form inputs", async () => {
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [] });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("✏️ Nova")).toBeInTheDocument();
    });

    // Click "Nova Nota" button
    fireEvent.click(screen.getByText("✏️ Nova"));

    // Submit button should be disabled when content is empty
    const submitButton = screen.getByText("Salvar Nota");
    expect(submitButton).toBeDisabled();

    // Add content
    fireEvent.change(screen.getByPlaceholderText("Digite a nota..."), {
      target: { value: "Test content" },
    });

    // Submit button should be enabled
    expect(submitButton).not.toBeDisabled();
  });

  it("shows character count for note content", async () => {
    mockGetPatientNotes.mockResolvedValue({ success: true, value: [] });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("✏️ Nova")).toBeInTheDocument();
    });

    // Click "Nova Nota" button
    fireEvent.click(screen.getByText("✏️ Nova"));

    // Character count should start at 0
    expect(screen.getByText("0/2000 caracteres")).toBeInTheDocument();

    // Add content
    const testContent = "Test note content";
    fireEvent.change(screen.getByPlaceholderText("Digite a nota..."), {
      target: { value: testContent },
    });

    // Character count should update
    expect(
      screen.getByText(`${testContent.length}/2000 caracteres`)
    ).toBeInTheDocument();
  });

  it("handles different note categories correctly", async () => {
    const mockNotes = [
      createMockNote(1, { category: "treatment" }),
      createMockNote(2, { category: "emergency" }),
      createMockNote(3, { category: "family" }),
    ];

    mockGetPatientNotes.mockResolvedValue({ success: true, value: mockNotes });

    render(<PatientNotesCard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Tratamento")).toBeInTheDocument();
      expect(screen.getByText("Emergência")).toBeInTheDocument();
      expect(screen.getByText("Família")).toBeInTheDocument();
    });
  });
});
