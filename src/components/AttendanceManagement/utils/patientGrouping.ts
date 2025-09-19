import type { IAttendanceStatusDetail, IAttendanceType } from "@/types/globals";

// Extended interface to include combined treatment information
export interface IGroupedPatient extends IAttendanceStatusDetail {
  originalType: IAttendanceType;
  treatmentTypes: IAttendanceType[];
  combinedType: 'lightBath' | 'rod' | 'combined';
}

// Define color mappings for treatment combinations
export const getTreatmentCombinationColor = (treatmentTypes: IAttendanceType[]): 'lightBath' | 'rod' | 'combined' => {
  const hasLightBath = treatmentTypes.includes('lightBath');
  const hasRod = treatmentTypes.includes('rod');
  
  if (hasLightBath && hasRod) {
    return 'combined'; // Green color for both treatments
  } else if (hasLightBath) {
    return 'lightBath'; // Yellow color for light bath only
  } else if (hasRod) {
    return 'rod'; // Blue color for rod only
  }
  
  // Fallback - shouldn't happen in lightBath + rod section
  return 'lightBath';
};

// Group patients by patientId for the same day, combining their treatments
export const groupPatientsByTreatments = (
  lightBathPatients: IAttendanceStatusDetail[],
  rodPatients: IAttendanceStatusDetail[]
): IGroupedPatient[] => {
  const patientMap = new Map<number, IGroupedPatient>();
  
  // Process light bath patients
  lightBathPatients.forEach(patient => {
    if (patient.patientId) {
      const existingPatient = patientMap.get(patient.patientId);
      if (existingPatient) {
        // Patient already exists, add lightBath to their treatment types
        existingPatient.treatmentTypes.push('lightBath');
        existingPatient.combinedType = getTreatmentCombinationColor(existingPatient.treatmentTypes);
      } else {
        // New patient, create entry
        patientMap.set(patient.patientId, {
          ...patient,
          originalType: 'lightBath',
          treatmentTypes: ['lightBath'],
          combinedType: 'lightBath'
        });
      }
    }
  });
  
  // Process rod patients
  rodPatients.forEach(patient => {
    if (patient.patientId) {
      const existingPatient = patientMap.get(patient.patientId);
      if (existingPatient) {
        // Patient already exists, add rod to their treatment types
        existingPatient.treatmentTypes.push('rod');
        existingPatient.combinedType = getTreatmentCombinationColor(existingPatient.treatmentTypes);
      } else {
        // New patient, create entry
        patientMap.set(patient.patientId, {
          ...patient,
          originalType: 'rod',
          treatmentTypes: ['rod'],
          combinedType: 'rod'
        });
      }
    }
  });
  
  return Array.from(patientMap.values());
};

// Get treatment type labels for display
export const getCombinedTreatmentLabel = (treatmentTypes: IAttendanceType[]): string => {
  const hasLightBath = treatmentTypes.includes('lightBath');
  const hasRod = treatmentTypes.includes('rod');
  
  if (hasLightBath && hasRod) {
    return 'BL + BS'; // Both treatments
  } else if (hasLightBath) {
    return 'BL'; // Light bath only
  } else if (hasRod) {
    return 'BS'; // Rod only
  }
  
  return '';
};
