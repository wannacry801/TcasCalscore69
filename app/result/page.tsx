"use client";

import { Suspense } from "react";
import ResultContent from "./result-content";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-6">กำลังโหลดผลคะแนน...</div>}>
      <ResultContent />
    </Suspense>
  );
}
