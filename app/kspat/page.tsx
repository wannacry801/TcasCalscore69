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
    <div className="min-h-screen flex justify-center bg-[#F2F8F5] py-12 px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white border border-[#DDEBE4] px-6 py-10 space-y-8">

        <h1 className="text-3xl font-bold text-center text-[#2F7D6B]">
          คำนวณคะแนน กสพท
        </h1>

        {/* TPAT1 */}
        <div className="rounded-[20px] bg-[#EAF4F0] border border-[#CFE5DC] px-4 py-5 space-y-3">
          <h2 className="font-semibold text-[#2F7D6B] text-lg">
            TPAT1 (30%)
          </h2>

          <Input
            type="number"
            label="คะแนน TPAT1 (เต็ม 300)"
            value={tpat1.toString()}
            onChange={(e) => setTpat1(Number(e.target.value))}
          />
        </div>

        {/* A-Level */}
        <div className="rounded-[20px] bg-[#EAF4F0] border border-[#CFE5DC] px-4 py-5 space-y-4">
          <h2 className="font-semibold text-[#2F7D6B] text-lg">
            A-Level (70%)
          </h2>

          <Input label="ฟิสิกส์" type="number" value={phy.toString()} onChange={(e) => setPhy(Number(e.target.value))} />
          <Input label="เคมี" type="number" value={chem.toString()} onChange={(e) => setChem(Number(e.target.value))} />
          <Input label="ชีววิทยา" type="number" value={bio.toString()} onChange={(e) => setBio(Number(e.target.value))} />

          <Input label="คณิตศาสตร์ 1" type="number" value={math1.toString()} onChange={(e) => setMath1(Number(e.target.value))} />
          <Input label="ภาษาอังกฤษ" type="number" value={eng.toString()} onChange={(e) => setEng(Number(e.target.value))} />
          <Input label="ภาษาไทย" type="number" value={thai.toString()} onChange={(e) => setThai(Number(e.target.value))} />
          <Input label="สังคมศึกษา" type="number" value={social.toString()} onChange={(e) => setSocial(Number(e.target.value))} />
        </div>

        {/* RESULT */}
        <div className="rounded-[24px] bg-[#2F7D6B] text-white px-6 py-6 text-center">
          <div className="text-sm opacity-90">คะแนนรวม (เต็ม 100)</div>
          <div className="text-5xl font-bold">{totalScore}</div>
        </div>

        <Button
          radius="full"
          size="lg"
          className="mx-auto block px-14 py-6 bg-[#6BBF9C] text-white
                     text-2xl font-semibold shadow-md hover:opacity-90"
          onPress={handleNext}
        >
          เลือกสถาบัน →
        </Button>

        <p className="text-xs text-center text-[#7FA99E]">
          สูตรคำนวณอ้างอิงเกณฑ์ กสพท อย่างเป็นทางการ (30 : 70)
        </p>
      </div>
    </div>
  );
}