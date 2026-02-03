"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";

type MedRow = {
  university: string;
  faculty: string; // ใช้เป็น "สาย"
  major: string;
};

function parseCSV(text: string): MedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const [university, faculty, major] = line.split(",").map((x) => x.trim());
    return { university, faculty, major };
  });
}

export default function KspatSelectClient() {
  const router = useRouter();
  const params = useSearchParams();

  const dataString = params.get("data");
  const decoded = useMemo(() => {
    if (!dataString) return null;
    try {
      return JSON.parse(decodeURIComponent(dataString));
    } catch (e) {
      console.error("decode data error", e);
      return null;
    }
  }, [dataString]);

  const totalScore: number | undefined = decoded?.totalScore;

  const [rows, setRows] = useState<MedRow[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  // โหลด kspat_university_list.csv (ของ กสพท โดยเฉพาะ)
  useEffect(() => {
    if (!decoded) return;

    async function loadCSV() {
      try {
        const res = await fetch("/kspat_university_list.csv");
        const text = await res.text();
        setRows(parseCSV(text));
      } catch (e) {
        console.error("โหลด kspat_university_list.csv ไม่ได้", e);
      }
    }

    loadCSV();
  }, [decoded]);

  if (!decoded || totalScore === undefined) {
    return <div className="p-10">ไม่พบข้อมูลคะแนน</div>;
  }

  /** ===== options ===== */

  // สาย (แพทย์ / ทันตะ / เภสัช / สัตวแพทย์)
  const facultyOptions = [...new Set(rows.map((r) => r.faculty))];

  // มหาวิทยาลัยตามสายที่เลือก
  const universityOptions = [
    ...new Set(
      rows
        .filter((r) => r.faculty === selectedFaculty)
        .map((r) => r.university)
    ),
  ];

  const handleNext = () => {
    if (!selectedFaculty || !selectedUniversity) {
      alert("กรุณาเลือกข้อมูลให้ครบ");
      return;
    }

    router.push(
      `/kspat/result?data=${encodeURIComponent(
        JSON.stringify({
          totalScore,
          faculty: selectedFaculty,
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
            value={selectedFaculty}
            onChange={(e) => {
              setSelectedFaculty(e.target.value);
              setSelectedUniversity("");
            }}
            className="w-full rounded-[16px] border border-[#CFE5DC] px-3 py-2"
          >
            <option value="">-- เลือกสาย --</option>
            {facultyOptions.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* เลือกมหาวิทยาลัย */}
        <div className="space-y-3">
          <label className="font-medium text-[#2F7D6B]">
            เลือกมหาวิทยาลัย
          </label>

          <select
            disabled={!selectedFaculty}
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full rounded-[16px] border border-[#CFE5DC] px-3 py-2"
          >
            <option value="">
              {selectedFaculty ? "-- เลือกมหาวิทยาลัย --" : "กรุณาเลือกสายก่อน"}
            </option>
            {universityOptions.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* คะแนน */}
        <div className="rounded-[20px] bg-[#EAF4F0] px-4 py-4 text-center">
          <div className="text-sm text-[#5F8F82]">คะแนนรวมของคุณ</div>
          <div className="text-3xl font-bold text-[#2F7D6B]">
            {totalScore}
          </div>
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
