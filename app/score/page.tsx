"use client";

import { Suspense } from "react";
import ScorePageContent from "./ScorePageContent";

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="p-6">กำลังโหลด...</div>}>
      <ScorePageContent />
    </Suspense>
  );
}