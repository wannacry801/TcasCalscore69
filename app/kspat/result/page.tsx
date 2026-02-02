import { Suspense } from "react";
import KspatResultClient from "./ResultClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">กำลังประมวลผล...</div>}>
      <KspatResultClient />
    </Suspense>
  );
}
