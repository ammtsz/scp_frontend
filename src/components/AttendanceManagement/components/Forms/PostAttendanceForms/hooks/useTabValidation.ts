import { useState, useCallback, useMemo } from 'react';
import type { SpiritualTreatmentData } from './usePostAttendanceForm';
import type { TabDefinition } from '@/components/common/TabbedModal';

interface UseTabValidationProps {
  formData: SpiritualTreatmentData;
}

export const useTabValidation = ({ formData }: UseTabValidationProps) => {
  const [activeTab, setActiveTab] = useState('basic-info');

  // Validation logic for each tab
  const validateBasicInfo = useCallback(() => {
    return !!(
      formData.mainComplaint?.trim() &&
      formData.treatmentStatus &&
      formData.attendanceDate &&
      formData.startDate &&
      formData.returnWeeks > 0
    );
  }, [formData]);

  const validateGeneralRecommendations = useCallback(() => {
    // This tab is optional, but we show warning if all fields are empty
    const hasAnyRecommendation = !!(
      formData.food?.trim() ||
      formData.water?.trim() ||
      formData.ointments?.trim()
    );
    return hasAnyRecommendation;
  }, [formData]);

  const validateTreatmentRecommendations = useCallback(() => {
    // This tab is always valid (treatment recommendations are optional)
    return true;
  }, []);

  // Tab definitions with validation status
  const tabs: TabDefinition[] = useMemo(() => [
    {
      id: 'basic-info',
      label: 'Informações Básicas',
      isValid: validateBasicInfo(),
      isRequired: true,
    },
    {
      id: 'general-recommendations',
      label: 'Recomendações Gerais',
      isValid: validateGeneralRecommendations(),
      hasWarning: !validateGeneralRecommendations(),
      isRequired: false,
    },
    {
      id: 'treatment-recommendations',
      label: 'Tratamentos Específicos',
      isValid: validateTreatmentRecommendations(),
      isRequired: false,
    },
  ], [validateBasicInfo, validateGeneralRecommendations, validateTreatmentRecommendations]);

  // Check if form can be submitted (at least basic info must be valid)
  const canSubmit = useMemo(() => {
    return validateBasicInfo();
  }, [validateBasicInfo]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return {
    activeTab,
    tabs,
    canSubmit,
    handleTabChange,
  };
};

export default useTabValidation;
