"use client";

import { useSearchParams } from "next/navigation";
import ResultContent from "./result-content";

export default function ResultPage() {
  const params = useSearchParams();
  const dataParam = params.get("data");

  if (!dataParam) return <div className="p-6">ไม่พบข้อมูล</div>;

  const data = JSON.parse(dataParam);
  const RC = ResultContent as any;

  return (
    <div className="p-4">
      <RC data={data} />
    </div>
  );
}
