"use client";

import React, { useState } from "react";
import { Settings, Globe } from "react-feather";
import { useTimezone } from "@/contexts/TimezoneContext";
import { TimezoneSettingsModal } from "@/components/layout/TimezoneSettingsModal";

/**
 * Top navigation bar component
 * Features app branding on the left and timezone settings on the right
 */
export function TopNavigation() {
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const { userTimezone, timezoneInfo } = useTimezone();

  const getTimezoneDisplay = () => {
    if (timezoneInfo) {
      const offset =
        timezoneInfo.offset >= 0
          ? `+${timezoneInfo.offset}`
          : timezoneInfo.offset;
      return `${timezoneInfo.timezone.split("/")[1]} (GMT${offset})`;
    }
    return userTimezone.split("/")[1] || "São Paulo";
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* App Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                MVP Center
              </h1>
              <p className="text-xs text-gray-500">Sistema de Atendimento</p>
            </div>
          </div>

          {/* Right Side - Timezone Settings */}
          <div className="flex items-center space-x-4">
            {/* Current Timezone Display */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Globe size={16} className="text-gray-400" />
              <span className="hidden sm:inline">{getTimezoneDisplay()}</span>
            </div>

            {/* Settings Menu Button */}
            <button
              onClick={() => setShowTimezoneModal(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Configurações de Fuso Horário"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Timezone Settings Modal */}
      {showTimezoneModal && (
        <TimezoneSettingsModal
          isOpen={showTimezoneModal}
          onClose={() => setShowTimezoneModal(false)}
        />
      )}
    </>
  );
}
