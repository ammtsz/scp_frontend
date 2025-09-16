import React, { ReactNode } from "react";
import BaseModal from "../BaseModal";

export interface TabDefinition {
  id: string;
  label: string;
  icon?: string;
  isValid?: boolean;
  hasWarning?: boolean;
}

interface TabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

// Helper function to check if form can be submitted (no invalid tabs)
export const canSubmitForm = (tabs: TabDefinition[]): boolean => {
  return !tabs.some((tab) => !tab.isValid && !tab.hasWarning);
};

const TabbedModal: React.FC<TabbedModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  actions,
  maxWidth = "2xl",
}) => {
  const getTabStatusIcon = (tab: TabDefinition) => {
    if (tab.isValid) return "✅";
    if (tab.hasWarning) return "⚠️";
    return "❌"; // Invalid - will prevent form submission
  };

  const getTabStatusTooltip = (tab: TabDefinition) => {
    if (tab.isValid) return "Todos os campos obrigatórios foram preenchidos.";
    if (tab.hasWarning) return "Atenção! Formulário em branco.";
    return "Preencha todos os campos obrigatórios.";
  };

  const getTabClassName = (tab: TabDefinition) => {
    const isActive = activeTab === tab.id;
    let baseClasses =
      "flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative flex-1 min-w-0 border-b-2";

    if (isActive) {
      baseClasses += " text-blue-600 border-blue-600 bg-blue-50/30";
    } else {
      baseClasses +=
        " text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300";
    }

    return baseClasses;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
      preventOverflow={true}
      height="h-[80vh]"
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation - Fixed */}
        <div className="flex-shrink-0 px-6 pt-6 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={getTabClassName(tab)}
                type="button"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-xs flex-shrink-0 relative group cursor-help"
                    title={getTabStatusTooltip(tab)}
                  >
                    {getTabStatusIcon(tab)}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      {getTabStatusTooltip(tab)}
                    </div>
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 bg-white px-6 py-6 overflow-y-auto min-h-0 pb-16">
          {children}
        </div>

        {/* Actions - Fixed */}
        {actions && (
          <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
            {actions}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default TabbedModal;
