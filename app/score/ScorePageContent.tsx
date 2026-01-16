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
    // ปรับ Logic การเตรียม scores ก่อนส่งไปหน้าถัดไป
    const processedScores = { ...scores };

    Object.keys(processedScores).forEach((subject) => {
      const normSubject = normalize(subject);
      const rawValue = processedScores[subject];

      if (normSubject.includes("tpat1")) {
        // ถ้าเป็น TPAT1 (ฐาน 300) ให้หาร 3 เพื่อให้เป็นฐาน 100 สำหรับหน้า result
        processedScores[subject] = rawValue / 3;
      } else if (normSubject.includes("gpax") && rawValue <= 4) {
        // ถ้าเป็นเกรดเฉลี่ย (ฐาน 4) ให้คูณ 25 เพื่อให้เป็นฐาน 100
        processedScores[subject] = rawValue * 25;
      }
    });

    router.push(
      `/result?data=${encodeURIComponent(
        JSON.stringify({
          university,
          faculty,
          major,
          weights,
          scores: processedScores, // ส่งคะแนนที่ปรับฐาน (Normalized) แล้วไป
          rawScores: scores, // (Option) ส่งคะแนนดิบที่ User กรอกไปด้วยถ้าต้องการแสดงผล
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
                  label={`น้ำหนัก ${percent}% ${isTPAT1 ? "(เต็ม 300)" : isGPAX ? "(เกรด 0-4)" : "(เต็ม 100)"}`}
                  placeholder={isTPAT1 ? "กรอกคะแนนเต็ม 300" : isGPAX ? "เช่น 3.75" : "กรอกคะแนนเต็ม 100"}
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
