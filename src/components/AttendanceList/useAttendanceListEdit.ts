import React from "react";
import { useAttendanceList } from "./useAttendanceList";

export function useAttendanceListEdit(
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null
) {
  const attendance = useAttendanceList(externalCheckIn);
  const [editMode, setEditMode] = React.useState<{ [key: string]: boolean }>({});
  const [editOrder, setEditOrder] = React.useState<{ [key: string]: string[] }>({});
  const [editDraggedIdx, setEditDraggedIdx] = React.useState<number | null>(null);

  const startEdit = (type: string) => {
    setEditMode((prev) => ({ ...prev, [type]: true }));
    setEditOrder((prev) => ({
      ...prev,
      [type]: [...attendance.checkedInPatients[type as keyof typeof attendance.checkedInPatients]],
    }));
  };
  const cancelEdit = (type: string) => {
    setEditMode((prev) => ({ ...prev, [type]: false }));
    setEditOrder((prev) => ({ ...prev, [type]: [] }));
    setEditDraggedIdx(null);
  };
  const saveEdit = (type: string) => {
    attendance.setCheckedInPatients((prev) => ({ ...prev, [type]: editOrder[type] }));
    setEditMode((prev) => ({ ...prev, [type]: false }));
    setEditOrder((prev) => ({ ...prev, [type]: [] }));
    setEditDraggedIdx(null);
  };
  const handleEditDragStart = (idx: number) => setEditDraggedIdx(idx);
  const handleEditDragOver = (idx: number, type: string) => {
    if (editDraggedIdx === null || editDraggedIdx === idx) return;
    if (
      editDraggedIdx === editOrder[type].length - 1 &&
      idx === editOrder[type].length - 1
    )
      return;
    if (editDraggedIdx === idx) return;
    const newOrder = [...editOrder[type]];
    const [removed] = newOrder.splice(editDraggedIdx, 1);
    newOrder.splice(idx, 0, removed);
    setEditOrder((prev) => ({ ...prev, [type]: newOrder }));
    setEditDraggedIdx(idx);
  };
  const handleEditDrop = () => setEditDraggedIdx(null);

  return {
    ...attendance,
    editMode,
    editOrder,
    editDraggedIdx,
    startEdit,
    cancelEdit,
    saveEdit,
    handleEditDragStart,
    handleEditDragOver,
    handleEditDrop,
  };
}
