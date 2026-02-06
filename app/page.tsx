"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

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
  const [showAnnouncement, setShowAnnouncement] = useState(true);

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
        major: hasMajor ? cols[2]?.trim() : "",
      });
    });

    return result;
  }

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

    router.push(
      `/score?university=${encodeURIComponent(selectedUniversity)}&faculty=${encodeURIComponent(selectedFaculty)}&major=${encodeURIComponent(selectedMajor)}`
    );
  };

  return (
  <div className="min-h-screen flex justify-center bg-gradient-to-b from-[#F9FBFC] to-[#F3F5F7] py-12 px-4">
      {showAnnouncement && (
        <div className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center">
          <div className="max-w-xl w-full rounded-[28px] bg-[#FFF5EA] shadow-[0_16px_32px_rgba(0,0,0,0.10)] border border-[#E8C08A] px-4 py-3 flex items-center gap-3">
            <div className="flex-1 text-sm text-[#4B5563] text-center sm:text-left">
              <p className="font-semibold text-[#C05621]">Website อยู่ในช่วงUpdate UIและเพิ่มมหาลัย</p>
              <p>หากเจอปัญหาแนะนำรีเฟรชหรือแจ้งผู้พัฒนาระบบ</p>
              <p>Update 1.0 beta วิศวะกรรมพระนครเหนือและลาดกระบัง</p>
              <p>ปิดการใช้การคำนวณคณะวิทยาศาตร์จุฬาลงกรณ์ชั่วคราว</p>
              <p>เว็ปไซต์นี้อ้างอิงเกณตามMytcas.com</p>
              <p>ลาดกระบังไม่สามารถคำนวณได้จนสอบAlevel69เสร็จ</p>
              <p>ขออภัยในความไม่สะดวก</p>
            </div>
            <button
              aria-label="ปิดประกาศ"
              className="rounded-full bg-[#FFF1E6] text-[#C05621] w-8 h-8 flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              onClick={() => setShowAnnouncement(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.06)] border border-[#E4E7EB] px-6 py-10 space-y-8 mt-10">
        
        <h1 className="text-3xl font-bold text-center text-[#2F3D4A]">
          TCAS Score Calculator
        </h1>

        {/* STEP 1 เลือกมหาวิทยาลัย */}
        <div className="space-y-3">
          <label className="font-medium text-lg text-[#55616D]">
            เลือกมหาวิทยาลัย
          </label>

          <div className="rounded-3xl border border-[#E3E7EC] bg-[#FAF6F2] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.03)]">
            <select
              value={selectedUniversity}
              onChange={(e) => {
                setSelectedUniversity(e.target.value);
                setSelectedFaculty("");
                setSelectedMajor("");
              }}
              className="w-full rounded-full border border-[#E3E7EC] bg-white px-4 py-4 text-lg text-[#2F3D4A] focus:outline-none focus:ring-2 focus:ring-[#F6C57F]"
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
          <label className="font-medium text-lg text-[#55616D]">
            เลือกคณะ
          </label>

          <div className="rounded-3xl border border-[#E3E7EC] bg-[#FAF6F2] px-10 py-5 shadow-[0_6px_16px_rgba(0,0,0,0.03)]">
            <select
              disabled={!selectedUniversity}
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedMajor("");
              }}
              className="w-full rounded-full border border-[#E3E7EC] bg-white px-10 py-5 text-lg text-[#2F3D4A] focus:outline-none focus:ring-2 focus:ring-[#F6C57F]"
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
          <label className="font-medium text-lg text-[#55616D]">
            เลือกสาขา
          </label>

          <div className="rounded-3xl border border-[#E3E7EC] bg-[#FAF6F2] px-10 py-5 shadow-[0_6px_16px_rgba(0,0,0,0.03)]">
            <select
              disabled={!selectedFaculty}
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full rounded-full border border-[#E3E7EC] bg-white px-10 py-5 text-lg text-[#2F3D4A] focus:outline-none focus:ring-2 focus:ring-[#F6C57F]"
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
        <div className="flex flex-col gap-4 items-center">
          <Button
            onPress={handleSubmit}
            size="lg"
            radius="full"
            className="w-10 max-w-md px-50 py-30 bg-gradient-to-r from-[#F6C57F] to-[#F4A261] text-white text-xl font-semibold shadow-[0_12px_28px_rgba(244,162,97,0.35)] hover:opacity-95"
          >
            ไปหน้ากรอกคะแนน →
          </Button>
          <Button
            onPress={() => router.push("/kspat")}
            size="lg"
            radius="full"
            variant="bordered"
            className="w-10 10-w-md px-10 py-4 border-2 border-[#C2855A] text-[#C2855A] text-lg font-semibold hover:bg-[#FFF5EC] rounded-full"
          >
            คำนวณคะแนนสำหรับสาย กสพท
          </Button>
        </div>
       <div className="text-center text-[#9B9B9B] text-xs mt-6 leading-relaxed">
  อยู่ในช่วงแก้ไขuiอาจเกิดbugได้<br/>
  <br/><br/>
  © 2025 TCAS Score Calculator — All Rights Reserved.
</div>
      </div>
    </div>
  );
}
