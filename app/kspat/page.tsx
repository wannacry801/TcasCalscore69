"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";

export default function KspatPage() {
  const router = useRouter();

  // TPAT1
  const [tpat1, setTpat1] = useState<number | "">("");

  // A-Level (กรอกแยก)
  const [phy, setPhy] = useState<number | "">("");
  const [chem, setChem] = useState<number | "">("");
  const [bio, setBio] = useState<number | "">("");
  const [math1, setMath1] = useState<number | "">("");
  const [eng, setEng] = useState<number | "">("");
  const [thai, setThai] = useState<number | "">("");
  const [social, setSocial] = useState<number | "">("");

  // -------------------------
  // คำนวณคะแนน (ตรง Python)
  // -------------------------
  const calculateScore = () => {
    const tpatScore = Number(tpat1 || 0) / 10;

    const sciAvg =
      (Number(phy || 0) + Number(chem || 0) + Number(bio || 0)) / 3;

    const sciPart = sciAvg * 0.4 * 0.7;
    const mathPart = Number(math1 || 0) * 0.2 * 0.7;
    const engPart = Number(eng || 0) * 0.2 * 0.7;
    const thaiPart = Number(thai || 0) * 0.1 * 0.7;
    const socPart = Number(social || 0) * 0.1 * 0.7;

    const total = tpatScore + sciPart + mathPart + engPart + thaiPart + socPart;

    return Number(total.toFixed(4));
  };

  const totalScore = calculateScore();

  // -------------------------
  // ไปหน้าเลือกมหาลัย
  // -------------------------
  const handleNext = () => {
    if (tpat1 === "") {
      alert("กรุณากรอกคะแนน TPAT1");
      return;
    }

    router.push(
      `/kspat/select?data=${encodeURIComponent(
        JSON.stringify({
          totalScore,
          rawScores: {
            TPAT1: tpat1,
            Physic: phy,
            Chem: chem,
            Bio: bio,
            Math1: math1,
            Eng: eng,
            Thai: thai,
            Social: social
          }
        })
      )}`
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-[#F8FAF8] to-[#F1F3F5] py-12 px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.05)] border border-[#E8EBEF] px-5 py-8 sm:px-8 sm:py-10 space-y-8">

        <div className="text-center space-y-2">
          <p className="text-sm tracking-wide text-[#8BA0A6] font-medium">TCAS กสพท Calculator</p>
          <h1 className="text-3xl font-bold text-[#1F3A4A]">กรอกคะแนน กสพท</h1>
          <p className="text-lg text-[#5E6B75]">TPAT1 + A-Level</p>
        </div>

        {/* TPAT1 */}
        <div className="rounded-3xl border border-[#E6EBEF] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1F3A4A] text-lg">TPAT1 (30%)</h2>
            <span className="text-sm text-[#7C8B93]">เต็ม 300</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex rounded-full border border-[#E3E7EC] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-[#B8D5C8] overflow-hidden">
              <input
                type="number"
                inputMode="decimal"
                placeholder="กรอกคะแนน TPAT1"
                className="flex-1 bg-transparent px-5 py-4 text-lg text-[#1F3A4A] outline-none"
                value={tpat1}
                onChange={(e) => setTpat1(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="px-5 py-4 text-base text-[#6B7A84] bg-[#F3F6F8] border-l border-[#E3E7EC]">
                คะแนน
              </div>
            </div>
          </div>
        </div>

        {/* A-Level */}
        <div className="rounded-3xl border border-[#E6EBEF] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1F3A4A] text-lg">A-Level (70%)</h2>
            <span className="text-sm text-[#7C8B93]">เต็มวิชาละ 100</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { label: "ฟิสิกส์", value: phy, setter: setPhy },
              { label: "เคมี", value: chem, setter: setChem },
              { label: "ชีววิทยา", value: bio, setter: setBio },
              { label: "คณิตศาสตร์ 1", value: math1, setter: setMath1 },
              { label: "ภาษาอังกฤษ", value: eng, setter: setEng },
              { label: "ภาษาไทย", value: thai, setter: setThai },
              { label: "สังคมศึกษา", value: social, setter: setSocial },
            ].map((item) => (
              <div
                key={item.label}
                className="flex rounded-full border border-[#E3E7EC] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-[#B8D5C8] overflow-hidden"
              >
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={item.label}
                  className="flex-1 bg-transparent px-4 py-4 text-lg text-[#1F3A4A] outline-none text-center"
                  value={item.value}
                  onChange={(e) => item.setter(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RESULT */}
        <div className="rounded-3xl bg-gradient-to-r from-[#6BC2A4] to-[#8DD6BE] text-white px-6 py-6 text-center shadow-[0_12px_28px_rgba(107,194,164,0.35)]">
          <div className="text-sm opacity-90">คะแนนรวม (เต็ม 100)</div>
          <div className="text-5xl font-bold">{totalScore}</div>
        </div>

        <Button
          radius="full"
          size="lg"
          className="w-full max-w-lg mx-auto block px-10 py-5 bg-gradient-to-r from-[#F6C57F] to-[#F4A261] text-white
                     text-2xl font-semibold shadow-[0_12px_28px_rgba(244,162,97,0.35)] hover:opacity-95"
          onPress={handleNext}
        >
          เลือกสถาบัน →
        </Button>

        <p className="text-xs text-center text-[#7C8B93]">
          สูตรคำนวณอ้างอิงเกณฑ์ กสพท อย่างเป็นทางการ (30 : 70)
        </p>
      </div>
    </div>
  );
}
