import { Suspense } from "react";
import KspatSelectClient from "./SelectClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">กำลังโหลด...</div>}>
      <KspatSelectClient />
    </Suspense>
  );
}
