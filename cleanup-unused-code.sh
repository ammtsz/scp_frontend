#!/bin/bash

# Code Cleanup Script for MVP Center
# Removes unused exports, files, and redundant code

echo "🧹 Starting code cleanup..."

# 1. Remove unused functions from apiTransformers.ts
echo "📝 Cleaning up apiTransformers.ts unused exports..."

# Create a list of actually used functions
USED_FUNCTIONS=(
  "transformPriority"
  "transformStatus" 
  "transformAttendanceType"
  "transformAttendanceProgression"
  "transformSinglePatientFromApi"
  "transformPatientsFromApi"
  "transformAttendanceWithPatientByDate"
  "transformPriorityToApi"
  "transformStatusToApi"
  "transformAttendanceTypeToApi"
  "getAttendanceTypeLabel"
)

echo "✅ Used functions identified: ${#USED_FUNCTIONS[@]} functions"

# 2. Check for unused component files
echo "📁 Checking for unused component files..."

# Find .tsx files that might be unused
find src -name "*.tsx" -type f | while read file; do
  filename=$(basename "$file" .tsx)
  # Skip test files
  if [[ "$file" == *".test.tsx" ]] || [[ "$file" == *".spec.tsx" ]]; then
    continue
  fi
  
  # Check if component is imported anywhere
  if ! grep -r "import.*$filename" src --exclude-dir=__tests__ --exclude="$file" >/dev/null 2>&1; then
    echo "🔍 Potentially unused: $file"
  fi
done

# 3. Check for unused hook files  
echo "🪝 Checking for unused hook files..."

find src -name "use*.ts" -type f | while read file; do
  filename=$(basename "$file" .ts)
  # Skip test files
  if [[ "$file" == *".test.ts" ]] || [[ "$file" == *".spec.ts" ]]; then
    continue
  fi
  
  # Check if hook is imported anywhere
  if ! grep -r "import.*$filename" src --exclude-dir=__tests__ --exclude="$file" >/dev/null 2>&1; then
    echo "🔍 Potentially unused hook: $file"
  fi
done

echo "🎉 Cleanup analysis complete!"