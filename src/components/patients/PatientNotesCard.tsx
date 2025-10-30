import React, { useState, useEffect, useCallback } from "react";
import {
  getPatientNotes,
  createPatientNote,
  updatePatientNote,
  deletePatientNote,
} from "@/api/patients";
import type {
  PatientNoteResponseDto,
  CreatePatientNoteRequest,
  NoteCategory,
} from "@/api/types";
import { NOTE_CATEGORIES } from "@/api/types";
import { formatDateBR } from "@/utils/dateHelpers";

interface PatientNotesCardProps {
  patientId: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  general: "📝",
  treatment: "💊",
  observation: "👁️",
  behavior: "🧠",
  medication: "💉",
  progress: "📈",
  family: "👨‍👩‍👧‍👦",
  emergency: "🚨",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Geral",
  treatment: "Tratamento",
  observation: "Observação",
  behavior: "Comportamento",
  medication: "Medicação",
  progress: "Progresso",
  family: "Família",
  emergency: "Emergência",
};

export const PatientNotesCard: React.FC<PatientNotesCardProps> = ({
  patientId,
}) => {
  const [notes, setNotes] = useState<PatientNoteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] =
    useState<NoteCategory>("general");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getPatientNotes(patientId);
    if (result.success) {
      setNotes(result.value || []);
    } else {
      setError(result.error || "Erro ao carregar notas");
    }

    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    const noteData: CreatePatientNoteRequest = {
      note_content: newNoteContent.trim(),
      category: newNoteCategory,
    };

    const result = await createPatientNote(patientId, noteData);
    if (result.success && result.value) {
      setNotes((prev) => [result.value!, ...prev]);
      setNewNoteContent("");
      setNewNoteCategory("general");
      setIsAddingNote(false);
    } else {
      setError(result.error || "Erro ao criar nota");
    }
  };

  const handleEditNote = async (noteId: number, content: string) => {
    const result = await updatePatientNote(patientId, noteId.toString(), {
      note_content: content.trim(),
    });

    if (result.success && result.value) {
      setNotes((prev) =>
        prev.map((note) => (note.id === noteId ? result.value! : note))
      );
      setEditingNoteId(null);
    } else {
      setError(result.error || "Erro ao atualizar nota");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const result = await deletePatientNote(patientId, noteId.toString());
    if (result.success) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      setDeleteConfirmId(null);
    } else {
      setError(result.error || "Erro ao excluir nota");
    }
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
    setNewNoteContent("");
    setNewNoteCategory("general");
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
  };

  if (loading) {
    return (
      <div className="ds-card">
        <div className="ds-card-body">
          <div
            className="animate-pulse space-y-4"
            data-testid="loading-skeleton"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center flex-shrink-0">
            Notas
          </h2>
          <button
            onClick={() => setIsAddingNote(true)}
            className="bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0"
          >
            + Adicionar
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Add new note form */}
        {isAddingNote && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="ds-form-group">
              <label className="ds-label">Categoria</label>
              <select
                value={newNoteCategory}
                onChange={(e) =>
                  setNewNoteCategory(e.target.value as NoteCategory)
                }
                className="ds-input"
              >
                {NOTE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="ds-input mb-3 min-h-[100px] resize-y"
              placeholder="Digite a nota..."
              maxLength={2000}
            />
            <div className="flex justify-between items-center">
              <span className="ds-text-caption">
                {newNoteContent.length}/2000 caracteres
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={handleCancelAdd} className="ds-button-ghost">
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="ds-button-primary"
                >
                  Salvar Nota
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">📝</div>
            <p className="ds-text-body-secondary">
              Nenhuma nota adicionada ainda.
            </p>
            <p className="ds-text-caption mt-1">
              Clique em &quot;+ Adicionar&quot; para adicionar observações
              importantes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {CATEGORY_ICONS[note.category] || "📝"}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {CATEGORY_LABELS[note.category] || note.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingNoteId(note.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(note.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {editingNoteId === note.id ? (
                  <EditNoteForm
                    note={note}
                    onSave={(content) => handleEditNote(note.id, content)}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <>
                    <div className="text-gray-900 mb-2 whitespace-pre-wrap">
                      {note.note_content}
                    </div>
                    <div className="text-xs text-gray-500">
                      Criado em {formatDateBR(note.created_date)} às{" "}
                      {note.created_time}
                      {note.updated_date !== note.created_date && (
                        <span>
                          {" • "}Editado em {formatDateBR(note.updated_date)} às{" "}
                          {note.updated_time}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Delete confirmation */}
                {deleteConfirmId === note.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-sm mb-2">
                      Tem certeza que deseja excluir esta nota?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="ds-button-primary bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="ds-button-ghost"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">
            💡 Utilize as notas para registrar observações importantes sobre o
            comportamento, evolução do quadro, ou informações relevantes para
            futuros atendimentos.
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Note Form Component
interface EditNoteFormProps {
  note: PatientNoteResponseDto;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({
  note,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState(note.note_content);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="ds-input w-full min-h-[100px] resize-y mb-3"
        maxLength={2000}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {content.length}/2000 caracteres
        </span>
        <div className="flex gap-2">
          <button onClick={onCancel} className="ds-button-ghost">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="ds-button-primary text-sm"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
