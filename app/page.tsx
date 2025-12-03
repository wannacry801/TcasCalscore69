"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

// ไม่ใช้ SUBJECT_KEYS แล้ว แต่ต้องเหลือไว้เผื่อหน้า result
const SUBJECT_KEYS = [
  "TGAT", "TPAT1", "TPAT2", "TPAT3", "TPAT4", "TPAT5",
  "A-Math1", "A-Math2",
  "Physic", "Chem", "Bio",
  "Thai", "Eng", "Japan", "Korean", "Social"
];

type FacultyRow = {
  university: string;
  faculty: string;
  major?: string;        // เพิ่ม major เข้าไป
};

export default function InputPage() {
  const router = useRouter();

  const [rows, setRows] = useState<FacultyRow[]>([]);

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");

  useEffect(() => {
    async function loadCSV() {
      try {
        const res = await fetch("/Score.csv");
        const text = await res.text();
        const parsed = parseCSV(text);
        setRows(parsed);
      } catch (err) {
        console.error("โหลด Score.csv ไม่ได้:", err);
      }
    }
    loadCSV();
  }, []);

  function parseCSV(text: string): FacultyRow[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const header = lines[0].split(",");
    const hasMajor = header.includes("major");

    const result: FacultyRow[] = [];

    lines.slice(1).forEach((line) => {
      const cols = line.split(",");
      result.push({
        university: cols[0]?.trim(),
        faculty: cols[1]?.trim(),
        major: hasMajor ? cols[2]?.trim() : ""
      });
    });

    return result;
  }

  // dropdown options
  const universityOptions = [...new Set(rows.map((r) => r.university))];

  const facultyOptions = Array.from(
  new Set(
    rows
      .filter((r) => r.university === selectedUniversity)
      .map((r) => r.faculty)
  )
);

  const majorOptions = Array.from(
  new Set(
    rows
      .filter((r) => 
        r.university === selectedUniversity && 
        r.faculty === selectedFaculty
      )
      .map((r) => r.major || "")
  )
);
const handleSubmit = () => {
  if (!selectedUniversity || !selectedFaculty || !selectedMajor) {
    alert("กรุณาเลือกข้อมูลให้ครบ");
    return;
  }

  const payload = {
    university: selectedUniversity,
    faculty: selectedFaculty,
    major: selectedMajor
  };

  router.push(
    `/score?university=${encodeURIComponent(selectedUniversity)}&faculty=${encodeURIComponent(selectedFaculty)}&major=${encodeURIComponent(selectedMajor)}`
  );
};

return (
  <div className="min-h-screen flex justify-center bg-[#F7F3F5] py-12 px-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-sm border border-[#E2D8D0] px-6 py-8 space-y-8">
        
        <h1 className="text-3xl font-bold text-center text-[#C0CAC5]">
          TCAS Score Calculator
        </h1>

        {/* STEP 1 เลือกมหาวิทยาลัย */}
        <div className="space-y-3">
          <label className="font-medium text-lg text-[#C0CAC5]">
            เลือกมหาวิทยาลัย
          </label>

          <div className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-3">
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
                setSelectedFaculty("");
                setSelectedMajor("");
              }}
              className="w-full rounded-[16px] border border-[#E3E2E7] bg-white px-3 py-2"
            >
              <option value="">-- เลือกมหาวิทยาลัย --</option>
              {universityOptions.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 2 เลือกคณะ */}
        <div className="space-y-3">
          <label className="font-medium text-lg text-[#C0CAC5]">
            เลือกคณะ
          </label>

          <div className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-3">
            <select
              disabled={!selectedUniversity}
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedMajor("");
              }}
              className="w-full rounded-[16px] border border-[#E3E2E7] bg-white px-3 py-2"
            >
              <option value="">
                {selectedUniversity ? "-- เลือกคณะ --" : "กรุณาเลือกมหาวิทยาลัยก่อน"}
              </option>
              {facultyOptions.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 3 เลือกสาขา */}
        <div className="space-y-3">
          <label className="font-medium text-lg text-[#C0CAC5]">
            เลือกสาขา
          </label>

          <div className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-3">
            <select
              disabled={!selectedFaculty}
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full rounded-[16px] border border-[#E3E2E7] bg-white px-3 py-2"
            >
              <option value="">
                {selectedFaculty ? "-- เลือกสาขา --" : "กรุณาเลือกคณะก่อน"}
              </option>

              {majorOptions.map((m, idx) => (
                <option key={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ปุ่มไปหน้ายืนยันกรอกคะแนน */}
        <Button
          onPress={handleSubmit}
          size="lg"
          radius="full"
          className="mx-auto block px-12 py-6 bg-[#F7CDBA] text-[#5F5F5F]
                     text-2xl font-semibold shadow-md hover:opacity-90"
        >
          ไปหน้ากรอกคะแนน →
        </Button>
       <div className="text-center text-[#9B9B9B] text-xs mt-6 leading-relaxed">
  © 2025 TCAS Score Calculator — All Rights Reserved.<br/>
  โค้ดและเนื้อหาบนเว็บไซต์นี้ได้รับความคุ้มครองตามกฎหมายลิขสิทธิ์ 
  ห้ามคัดลอก นำไปใช้ ทำซ้ำ หรือแจกจ่าย ไม่ว่าในลักษณะใดก็ตาม 
  เว้นแต่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากผู้พัฒนา<br/><br/>
  เว็บไซต์นี้จัดทำขึ้นเพื่อช่วยคำนวณคะแนนเบื้องต้นเท่านั้น 
  ผลลัพธ์ไม่สามารถรับประกันผลการคัดเลือกจริงได้ โปรดตรวจสอบข้อมูลกับระบบ TCAS 
  และประกาศของมหาวิทยาลัยก่อนตัดสินใจ
</div>
      </div>
    </div>
  );
}
