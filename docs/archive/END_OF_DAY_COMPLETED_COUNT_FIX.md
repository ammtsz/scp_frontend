# End of Day Modal - Completed Attendances Count Fix

## Issue Description

The end of day feature was displaying 0 for finalized attendances in the summary (step 3 - confirmation) even when attendances had been completed during the day.

## Root Cause

The calculation in `EndOfDayModal.tsx` was only counting attendances that were completed during the end-of-day process itself, not the total number of completed attendances for the day. The logic was:

```tsx
{
  incompleteAttendances.length - formData.incompleteAttendances.length;
}
```

This calculation would show:

- 0 when no incomplete attendances were marked as complete during the end-of-day process
- Only the count of newly completed attendances, not the total day's completed attendances

## Solution

### 1. Updated EndOfDayModal Interface

Added an optional `completedAttendances` prop to the `EndOfDayModalProps` interface:

```tsx
interface EndOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (data: EndOfDayData) => Promise<void>;
  incompleteAttendances: IAttendanceStatusDetail[];
  scheduledAbsences: IAttendanceStatusDetail[];
  completedAttendances?: IAttendanceStatusDetail[]; // NEW
  isLoading?: boolean;
}
```

### 2. Updated AttendanceList Component

Added a `getCompletedAttendances()` function to collect all completed attendances:

```tsx
const getCompletedAttendances = (): IAttendanceStatusDetail[] => {
  if (!attendancesByDate) return [];

  const completed: IAttendanceStatusDetail[] = [];
  // Collect all completed attendances from all types
  ["spiritual", "lightBath", "rod"].forEach((type) => {
    const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
    if (typeData && typeof typeData === "object" && "completed" in typeData) {
      const completedData = typeData.completed;
      if (Array.isArray(completedData)) {
        completed.push(...(completedData as IAttendanceStatusDetail[]));
      }
    }
  });

  return completed;
};
```

Updated the EndOfDayModal call to include the completed attendances:

```tsx
<EndOfDayModal
  isOpen={endOfDayModalOpen}
  onClose={() => setEndOfDayModalOpen(false)}
  onFinalize={handleEndOfDaySubmit}
  incompleteAttendances={getIncompleteAttendances()}
  scheduledAbsences={[]}
  completedAttendances={getCompletedAttendances()} // NEW
  isLoading={false}
/>
```

### 3. Updated Calculation Logic

Fixed the calculation in the confirmation step to include both already completed attendances and newly completed ones:

```tsx
<li>
  ✓ Atendimentos finalizados:{" "}
  {completedAttendances.length +
    (incompleteAttendances.length - formData.incompleteAttendances.length)}
</li>
```

This calculation now shows:

- `completedAttendances.length`: Count of attendances that were already completed
- `(incompleteAttendances.length - formData.incompleteAttendances.length)`: Count of attendances completed during the end-of-day process
- **Total**: All attendances completed during the day

## Testing

### Unit Tests

Created comprehensive unit tests in `EndOfDayModal.completedCountUnit.test.tsx` to verify the calculation logic works correctly:

```tsx
it("should calculate completed attendances correctly with completedAttendances prop", () => {
  // Tests that already completed attendances are counted correctly
});

it("should calculate total completed count including newly completed from incomplete", () => {
  // Tests that the total includes both pre-completed and newly completed
});
```

### Test Results

✅ All unit tests pass
✅ Logic correctly calculates total completed attendances
✅ Handles edge cases (0 completed, large numbers, mixed scenarios)

## Files Modified

1. `/src/components/TreatmentForm/EndOfDayModal.tsx`

   - Added `completedAttendances` prop to interface
   - Updated component signature to accept the new prop
   - Fixed calculation logic in confirmation step

2. `/src/components/AttendanceList/index.tsx`

   - Added `getCompletedAttendances()` function
   - Updated EndOfDayModal props to include completed attendances

3. `/src/components/TreatmentForm/__tests__/EndOfDayModal.completedCountUnit.test.tsx`
   - Created unit tests to verify the fix

## Example Scenarios

### Before Fix

- 5 attendances completed during the day
- End of day modal shows: "✓ Atendimentos finalizados: 0"

### After Fix

- 5 attendances completed during the day
- End of day modal shows: "✓ Atendimentos finalizados: 5"

### Mixed Scenario

- 3 attendances already completed
- 2 incomplete attendances marked complete during end-of-day process
- End of day modal shows: "✓ Atendimentos finalizados: 5"

## Benefits

1. **Accurate Reporting**: Users now see the correct total of completed attendances
2. **Better User Experience**: Clear visibility into daily productivity
3. **Data Integrity**: Proper tracking of all completed work
4. **Future Compatibility**: Extensible design for additional attendance statistics
