# Drag and Drop Functions - useDragAndDrop Hook

## Overview

This document explains the responsibilities and differences between the drag-and-drop functions in the `useDragAndDrop` hook located at `src/components/AttendanceManagement/hooks/useDragAndDrop.ts`.

## Function Responsibilities

### 1. **`handleDragStart`** - Drag Initiation

**Responsibility**: Captures the initial drag operation and sets up the dragged item state.

```typescript
const handleDragStart = useCallback(
  (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression,
    patientId?: number
  ) => {
    // Find the patient being dragged
    let patient = patientId
      ? findPatient(type, status, patientId)
      : getPatients(type, status)[idx];

    // Store drag context in state
    setDragged({ type, status, idx, patientId: patient.patientId });
  },
  [findPatient, getPatients]
);
```

**Key Actions**:

- Identifies which patient card is being dragged
- Stores drag context (`type`, `status`, `patientId`) in state
- Validates that the patient exists before starting drag

---

### 2. **`handleDragEnd`** - Drag Cleanup

**Responsibility**: Cleans up drag state when drag operation ends (regardless of success/failure).

```typescript
const handleDragEnd = useCallback(() => {
  setDragged(null); // Clear drag state
}, []);
```

**Key Actions**:

- Resets drag state to `null`
- Called automatically by the drag system when drag ends
- Ensures UI returns to normal state

---

### 3. **`handleDropWithConfirm`** - Drop Logic & Business Rules

**Responsibility**: The main drop handler that applies business rules and determines what action to take.

```typescript
const handleDropWithConfirm = useCallback(
  (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
    // Business rule validations:

    // 1. Prevent cross-type moves (spiritual ↔ lightBath)
    if (dragged.type !== toType) return;

    // 2. New patient detection (status 'N' → checkedIn)
    if (toStatus === "checkedIn" && patientData?.status === "N") {
      onNewPatientDetected?.(patientData, patient.attendanceId);
      return;
    }

    // 3. Multi-section handling (patient in both consultation types)
    if (
      isInBothTypes &&
      dragged.status === "scheduled" &&
      toStatus === "checkedIn"
    ) {
      setMultiSectionModalOpen(true);
      return;
    }

    // 4. Treatment completion workflow (→ completed with active treatments)
    if (toStatus === "completed") {
      // Check for active treatments and show completion modal
      return;
    }

    // 5. Regular move
    performMove(toType, toStatus);
  },
  [
    /* dependencies */
  ]
);
```

**Key Actions**:

- **Validates business rules** (cross-type prevention, new patients, etc.)
- **Routes to different workflows** (modals, confirmations, direct moves)
- **Does NOT perform the actual move** - delegates to other functions
- Acts as the "traffic controller" for drop operations

---

### 4. **`performMove`** - Core Move Logic

**Responsibility**: Executes the actual patient movement between sections with backend sync.

```typescript
const performMove = useCallback(
  async (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
    // 1. Backend synchronization
    if (patient.attendanceId) {
      await updateAttendanceStatus(patient.attendanceId, toStatus);
    }

    // 2. Immutable state update
    let newAttendancesByDate = { ...attendancesByDate };

    // Remove from source
    newAttendancesByDate[dragged.type][dragged.status] = newAttendancesByDate[
      dragged.type
    ][dragged.status].filter((p) => p.patientId !== dragged.patientId);

    // Add to destination with updated timestamps
    newAttendancesByDate[toType][toStatus] = [
      ...newAttendancesByDate[toType][toStatus],
      updatePatientTimestamps(patient, toStatus),
    ];

    // 3. Update React state
    setAttendancesByDate(newAttendancesByDate);
  },
  [
    /* dependencies */
  ]
);
```

**Key Actions**:

- **Backend API call** to sync status change
- **Immutable state updates** (remove from source, add to destination)
- **Timestamp updates** (checkedInTime, onGoingTime, completedTime)
- **Pure data manipulation** - no business logic or UI decisions

---

### 5. **`handleConfirm`** - Confirmation Dialog Handler

**Responsibility**: Handles user confirmation for moves that require explicit approval.

```typescript
const handleConfirm = useCallback(async () => {
  if (!dragged || !pendingDrop) return;

  // Execute the pending move
  await performMove(pendingDrop.toType, pendingDrop.toStatus);

  // Clean up confirmation state
  setConfirmOpen(false);
  setPendingDrop(null);
  setDragged(null);
}, [dragged, pendingDrop, performMove]);
```

**Key Actions**:

- **Executes pending moves** that were held for confirmation
- **Manages confirmation modal state**
- **Delegates actual move** to `performMove`

---

## Key Differences Summary

| Function                | Purpose           | When Called      | Backend Sync             | State Changes       |
| ----------------------- | ----------------- | ---------------- | ------------------------ | ------------------- |
| `handleDragStart`       | Initialize drag   | Drag begins      | ❌ No                    | Sets `dragged`      |
| `handleDragEnd`         | Cleanup           | Drag ends        | ❌ No                    | Clears `dragged`    |
| `handleDropWithConfirm` | Business logic    | Drop occurs      | ❌ No                    | Routing only        |
| `performMove`           | Execute move      | After validation | ✅ Yes                   | Updates attendances |
| `handleConfirm`         | User confirmation | Modal "OK"       | ✅ Yes (via performMove) | Clears modals       |

## Workflow Example

```
User drags patient card → handleDragStart (store drag state)
User drops on new section → handleDropWithConfirm (validate & route)
  ├─ New patient? → Show modal
  ├─ Multi-section? → Show modal
  ├─ Need confirmation? → Show modal → handleConfirm → performMove
  └─ Regular move? → performMove (immediate)
User releases mouse → handleDragEnd (cleanup)
```

## Architecture Benefits

The architecture separates **concerns cleanly**:

- **Business rules** in `handleDropWithConfirm`
- **Data manipulation** in `performMove`
- **UI state management** in confirmation handlers
- **Clean separation** between validation, execution, and cleanup

## Special Workflows

### New Patient Detection

When a patient with status 'N' (new) is moved to 'checkedIn', the system:

1. Detects new patient status
2. Triggers `onNewPatientDetected` callback
3. Opens new patient modal instead of regular move

### Multi-Section Handling

When a patient is scheduled in multiple consultation types (spiritual + lightBath):

1. Detects multi-section scenario
2. Opens confirmation modal
3. User chooses: move all sections or just the dragged one

### Treatment Completion

When moving to 'completed' status with active treatments:

1. Checks for active treatment sessions via API
2. Opens treatment completion modal if treatments exist
3. Handles treatment completion workflow before status change

---

_Generated on September 19, 2025_
_File: src/components/AttendanceManagement/hooks/useDragAndDrop.ts_
