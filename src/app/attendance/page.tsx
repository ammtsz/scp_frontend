"use client";

import AttendanceList from "@/components/AttendanceList";
import CheckIn from "@/components/CheckIn";
import React, { useState } from "react";

export default function AttendancePage() {
  const [externalCheckIn, setExternalCheckIn] = useState<{
    name: string;
    types: string[];
    isNew: boolean;
  } | null>(null);

  return (
    <div className="flex flex-col gap-8 mt-8">
      <CheckIn
        onCheckIn={(name, types, isNew) =>
          setExternalCheckIn({ name, types, isNew })
        }
      />
      <AttendanceList externalCheckIn={externalCheckIn} />
    </div>
  );
}
