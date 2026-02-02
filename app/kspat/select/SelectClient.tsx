"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";

type MedRow = {
  track: string;
  university: string;
};

function parseCSV(text: string): MedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const [track, university] = line.split(",").map((x) => x.trim());
    return { track, university };
  });
}

export default function KspatSelectClient() {
  const router = useRouter();
  const params = useSearchParams();

  const dataString = params.get("data");
  if (!dataString) return <div className="p-10">ไม่พบข้อมูลคะแนน</div>;

  const decoded = JSON.parse(decodeURIComponent(dataString));
  const totalScore: number = decoded.totalScore;

  const [rows, setRows] = useState<MedRow[]>([]);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  // โหลด MedUnit.csv (แยกจากคณะทั่วไป)
  useEffect(() => {
    async function loadCSV() {
      try {
        const res = await fetch("/MedUnit.csv");
        const text = await res.text();
        setRows(parseCSV(text));
      } catch (e) {
        console.error("โหลด MedUnit.csv ไม่ได้", e);
      }
    }
    loadCSV();
  }, []);

  const trackOptions = [...new Set(rows.map((r) => r.track))];

  const universityOptions = rows
    .filter((r) => r.track === selectedTrack)
    .map((r) => r.university);

  const handleNext = () => {
    if (!selectedTrack || !selectedUniversity) {
      alert("กรุณาเลือกข้อมูลให้ครบ");
      return;
    }

    router.push(
      `/kspat/result?data=${encodeURIComponent(
        JSON.stringify({
          totalScore,
          track: selectedTrack,
          university: selectedUniversity,
        })
      )}`
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F2F8F5] py-12 px-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white border border-[#DDEBE4] px-6 py-10 space-y-8">
        <h1 className="text-2xl font-bold text-center text-[#2F7D6B]">
          เลือกสายและสถาบัน (กสพท)
        </h1>

        {/* เลือกสาย */}
        <div className="space-y-3">
          <label className="font-medium text-[#2F7D6B]">เลือกสาย</label>

          <select
            value={selectedTrack}
            onChange={(e) => {
              setSelectedTrack(e.target.value);
              setSelectedUniversity("");
            }}
            className="w-full rounded-[16px] border border-[#CFE5DC] px-3 py-2"
          >
            <option value="">-- เลือกสาย --</option>
            {trackOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* เลือกมหาลัย */}
        <div className="space-y-3">
          <label className="font-medium text-[#2F7D6B]">เลือกมหาวิทยาลัย</label>

          <select
            disabled={!selectedTrack}
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full rounded-[16px] border border-[#CFE5DC] px-3 py-2"
          >
            <option value="">
              {selectedTrack ? "-- เลือกมหาวิทยาลัย --" : "กรุณาเลือกสายก่อน"}
            </option>
            {universityOptions.map((u, i) => (
              <option key={i}>{u}</option>
            ))}
          </select>
        </div>

        <div className="rounded-[20px] bg-[#EAF4F0] px-4 py-4 text-center">
          <div className="text-sm text-[#5F8F82]">คะแนนรวมของคุณ</div>
          <div className="text-3xl font-bold text-[#2F7D6B]">{totalScore}</div>
        </div>

        <Button
          radius="full"
          size="lg"
          className="mx-auto block px-12 py-6 bg-[#6BBF9C] text-white text-xl font-semibold shadow-md hover:opacity-90"
          onPress={handleNext}
        >
          ดูโอกาสติด →
        </Button>
      </div>
    </div>
  );
}
