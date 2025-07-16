"use client";

import AttendanceList from "@/components/AttendanceList";
import CheckIn from "@/components/CheckIn";
import { IPriority } from "@/types/globas";
import React, { useState } from "react";

export default function AttendancePage() {
  const [externalCheckIn, setExternalCheckIn] = useState<{
    name: string;
    types: string[];
    isNew: boolean;
    priority: IPriority;
  } | null>(null);

  return (
    <div className="flex flex-col gap-8 mb-16">
      <CheckIn
        onCheckIn={(name, types, isNew, priority) =>
          setExternalCheckIn({ name, types, isNew, priority })
        }
      />
      <AttendanceList
        externalCheckIn={externalCheckIn}
        onCheckInProcessed={() => setExternalCheckIn(null)}
      />
    </div>
  );
}
