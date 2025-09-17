import React from "react";
import TreatmentProgressBadge from "./TreatmentProgressBadge";

/**
 * TreatmentProgressDemo - Demonstrates the visual progress tracking features
 * Shows different scenarios of treatment session progress with various styling options
 */
const TreatmentProgressDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Treatment Progress Tracking Demo
      </h1>

      {/* Compact Mode Examples */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Compact Mode (For Attendance Cards)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Light Bath Progress */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">
              Light Bath - Session 2 of 5
            </h3>
            <TreatmentProgressBadge
              treatmentType="light_bath"
              currentSession={2}
              totalSessions={5}
              size="sm"
              compact={true}
            />
          </div>

          {/* Rod Progress */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">Rod - Session 7 of 10</h3>
            <TreatmentProgressBadge
              treatmentType="rod"
              currentSession={7}
              totalSessions={10}
              size="sm"
              compact={true}
            />
          </div>

          {/* Spiritual Progress */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">
              Spiritual - Session 3 of 8
            </h3>
            <TreatmentProgressBadge
              treatmentType="spiritual"
              currentSession={3}
              totalSessions={8}
              size="sm"
              compact={true}
            />
          </div>
        </div>
      </section>

      {/* Expanded Mode Examples */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Expanded Mode (With Progress Bars)
        </h2>
        <div className="space-y-4">
          {/* Light Bath Detailed */}
          <div className="border border-gray-200 p-4 rounded">
            <h3 className="text-base font-medium mb-3">
              Light Bath Treatment Progress
            </h3>
            <TreatmentProgressBadge
              treatmentType="light_bath"
              currentSession={2}
              totalSessions={5}
              size="md"
              showPercentage={true}
              showProgressBar={true}
              compact={false}
            />
          </div>

          {/* Rod Treatment In Progress */}
          <div className="border border-gray-200 p-4 rounded">
            <h3 className="text-base font-medium mb-3">
              Rod Treatment Progress
            </h3>
            <TreatmentProgressBadge
              treatmentType="rod"
              currentSession={7}
              totalSessions={10}
              size="md"
              showPercentage={true}
              showProgressBar={true}
              compact={false}
            />
          </div>

          {/* Completed Treatment */}
          <div className="border border-gray-200 p-4 rounded">
            <h3 className="text-base font-medium mb-3">
              Completed Spiritual Treatment
            </h3>
            <TreatmentProgressBadge
              treatmentType="spiritual"
              currentSession={8}
              totalSessions={8}
              size="md"
              showPercentage={true}
              showProgressBar={true}
              isCompleted={true}
              compact={false}
            />
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Size Variants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Small */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">Small Size</h3>
            <TreatmentProgressBadge
              treatmentType="light_bath"
              currentSession={3}
              totalSessions={5}
              size="sm"
              showProgressBar={true}
            />
          </div>

          {/* Medium */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">Medium Size</h3>
            <TreatmentProgressBadge
              treatmentType="rod"
              currentSession={3}
              totalSessions={5}
              size="md"
              showProgressBar={true}
            />
          </div>

          {/* Large */}
          <div className="border border-gray-200 p-3 rounded">
            <h3 className="text-sm font-medium mb-2">Large Size</h3>
            <TreatmentProgressBadge
              treatmentType="spiritual"
              currentSession={3}
              totalSessions={5}
              size="lg"
              showProgressBar={true}
              showPercentage={true}
            />
          </div>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Integration Examples
        </h2>
        <div className="space-y-4">
          {/* Attendance Card Simulation */}
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">
                Maria Silva (Alta)
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Banho de Luz
              </span>
            </div>
            <TreatmentProgressBadge
              treatmentType="light_bath"
              currentSession={2}
              totalSessions={5}
              size="sm"
              compact={true}
            />
            <div className="text-xs text-gray-500 mt-1">
              Entrada: 14:30 | Em andamento desde 15:00
            </div>
          </div>

          {/* Treatment History Panel Simulation */}
          <div className="border border-gray-300 p-4 rounded-lg">
            <h3 className="font-medium mb-3">
              Treatment History - João Santos
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    Light Bath Treatment
                  </span>
                  <span className="text-xs text-green-600">Completed</span>
                </div>
                <TreatmentProgressBadge
                  treatmentType="light_bath"
                  currentSession={5}
                  totalSessions={5}
                  size="sm"
                  showProgressBar={true}
                  isCompleted={true}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Rod Treatment</span>
                  <span className="text-xs text-blue-600">In Progress</span>
                </div>
                <TreatmentProgressBadge
                  treatmentType="rod"
                  currentSession={3}
                  totalSessions={8}
                  size="sm"
                  showProgressBar={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center text-gray-500 text-sm">
        🎉 Progress Tracking Implementation Complete! 🎉
        <br />
        Visual indicators now show &quot;Session X of Y&quot; with color-coded
        treatment types
      </div>
    </div>
  );
};

export default TreatmentProgressDemo;
