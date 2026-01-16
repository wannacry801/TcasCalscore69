"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Input, Button } from "@heroui/react";

function normalize(str: string) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/—/g, "")
    .replace(/-/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

export default function ScorePageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const university = params.get("university") ?? "";
  const faculty = params.get("faculty") ?? "";
  const major = params.get("major") ?? "";

  const [weights, setWeights] = useState<any>(null);
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    if (!university || !faculty || !major) return;

    Papa.parse("/Score.csv", {
      download: true,
      header: true,
      complete: (result: { data: any[] }) => {
        const found = result.data.find((d: any) =>
          normalize(d.university) === normalize(university) &&
          normalize(d.faculty) === normalize(faculty) &&
          normalize(d.major) === normalize(major)
        );

        setWeights(found || null);
      },
    });
  }, [university, faculty, major]);

  if (!weights)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F7F3F5] text-lg">
        กำลังโหลด...
      </div>
    );

  const handleNext = () => {
    // --- ปรับ Logic ส่วนคำนวณตรงนี้ ---
    const normalizedScores = { ...scores };

    Object.keys(normalizedScores).forEach((subject) => {
      const normSubject = normalize(subject);
      const rawValue = normalizedScores[subject];

      if (normSubject.includes("tpat1")) {
        // TPAT1 เต็ม 300: ทำให้เป็นฐาน 100 โดยการหาร 3
        // เช่น กรอก 230 -> จะส่งไป 76.66 (เมื่อหน้า result ไปคูณ weight 30% จะได้ 23 แต้มพอดี)
        normalizedScores[subject] = rawValue / 3;
      } 
      else if (normSubject.includes("gpax")) {
        // GPAX เต็ม 4: ทำให้เป็นฐาน 100 โดยการคูณ 25
        // เช่น กรอก 3.50 -> จะส่งไป 87.5
        normalizedScores[subject] = rawValue <= 4 ? rawValue * 25 : rawValue;
      }
      // วิชาอื่นๆ (TGAT/A-Level) เป็นฐาน 100 อยู่แล้ว ไม่ต้องปรับ
    });

    router.push(
      `/result?data=${encodeURIComponent(
        JSON.stringify({
          university,
          faculty,
          major,
          weights,
          scores: normalizedScores, // ส่งคะแนนที่ปรับเป็นฐาน 100 แล้ว
        })
      )}`
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F7F3F5] py-12 px-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-sm border border-[#E2D8D0] px-6 py-8 space-y-6">
        
        <h1 className="text-3xl font-bold text-center text-[#C0CAC5]">
          กรอกคะแนนสำหรับสาขา
        </h1>

        <h2 className="text-2xl font-semibold text-center text-[#777777]">
          {university} — {faculty} — {major}
        </h2>

        <div className="space-y-4">
          {Object.entries(weights).map(([subject, percent]) => {
            if (["university", "faculty", "major"].includes(subject)) return null;
            if (Number(percent) <= 0) return null;

            const normSub = normalize(subject);
            const isTPAT1 = normSub.includes("tpat1");
            const isGPAX = normSub.includes("gpax");

            return (
              <div key={subject}
                className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-4 space-y-3">
                <h2 className="font-semibold text-lg text-[#777777]">{subject}</h2>

                <Input
                  type="number"
                  label={`น้ำหนัก ${percent}%`}
                  // เพิ่ม Placeholder ให้ User กรอกถูกฐาน
                  placeholder={isTPAT1 ? "เต็ม 300" : isGPAX ? "เกรดเฉลี่ย (0-4)" : "เต็ม 100"}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [subject]: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        <Button
          radius="full"
          className="mx-auto block px-12 py-6 bg-[#F7CDBA] text-[#5F5F5F]
                     text-2xl font-semibold shadow-md hover:opacity-90"
          onPress={handleNext}
        >
          ไปหน้าผลคะแนน →
        </Button>

      </div>
    </div>
  );
}
