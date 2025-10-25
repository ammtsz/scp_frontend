import React from "react";
import { Skeleton } from "@/components/common/SkeletonLoading";

interface PatientDetailSkeletonProps {
  showCards?: boolean;
}

export const PatientDetailSkeleton: React.FC<PatientDetailSkeletonProps> = ({
  showCards = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Header Card Skeleton */}
        <div className="ds-card mb-6">
          <div className="ds-card-body">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16" rounded />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCards && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Treatment Card */}
              <div className="ds-card">
                <div className="ds-card-body">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>

              {/* Attendance History Card */}
              <div className="ds-card">
                <div className="ds-card-body">
                  <Skeleton className="h-6 w-56 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Skeleton className="h-3 w-3" rounded />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Future Appointments Card */}
              <div className="ds-card">
                <div className="ds-card-body">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-3 w-3" rounded />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Cards */}
            <div className="space-y-6">
              {/* Patient Notes Card */}
              <div className="ds-card">
                <div className="ds-card-body">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Status Overview Card */}
              <div className="ds-card">
                <div className="ds-card-body">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
