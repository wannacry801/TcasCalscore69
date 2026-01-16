"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Input, Button } from "@heroui/react";

// ฟังก์ชันทำความสะอาดข้อความเพื่อใช้ในการเปรียบเทียบ subject
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

  // ฟังก์ชันคำนวณคะแนนตามประเภทวิชา
  const calculateFinalPoint = (subjectName: string, score: number, weight: number) => {
    const normName = normalize(subjectName);
    
    // 1. กรณี TPAT1: ใช้ฐานคะแนนเต็ม 300
    if (normName.includes("tpat1")) {
      return (score / 300) * weight;
    }
    
    // 2. กรณี GPAX: ถ้ากรอกมาเป็นเกรด 0-4.00 ให้แปลงเป็นฐาน 100 ก่อน
    if (normName.includes("gpax")) {
      const gpaScore = score <= 4 ? score * 25 : score; // ถ้ากรอก 3.5 จะกลายเป็น 87.5
      return (gpaScore / 100) * weight;
    }

    // 3. กรณีอื่นๆ (TGAT, TPAT2-5, A-Level): ใช้ฐานคะแนนเต็ม 100
    return (score / 100) * weight;
  };

  const handleNext = () => {
    // เตรียมข้อมูลที่ประมวลผลแล้ว
    const processedResults = Object.entries(weights).reduce((acc: any, [subject, percent]) => {
      if (["university", "faculty", "major"].includes(subject)) return acc;
      
      const weightVal = Number(percent);
      if (weightVal <= 0) return acc;

      const rawScore = scores[subject] || 0;
      const calculatedPoint = calculateFinalPoint(subject, rawScore, weightVal);

      acc[subject] = {
        rawScore: rawScore,
        weight: weightVal,
        point: Number(calculatedPoint.toFixed(4)) // เก็บละเอียด 4 ตำแหน่ง
      };
      return acc;
    }, {});

    // คำนวณคะแนนรวมทั้งหมด
    const totalScore = Object.values(processedResults).reduce((sum: number, item: any) => sum + item.point, 0);

    router.push(
      `/result?data=${encodeURIComponent(
        JSON.stringify({
          university,
          faculty,
          major,
          results: processedResults,
          totalScore: totalScore.toFixed(4)
        })
      )}`
    );
  };

  if (!weights)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F7F3F5] text-lg">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center bg-[#F7F3F5] py-12 px-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-sm border border-[#E2D8D0] px-6 py-8 space-y-6">
        
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-[#C0CAC5]">กรอกคะแนนของคุณ</h1>
          <h2 className="text-xl font-semibold text-[#777777]">
            {university} <br/> 
            <span className="text-base font-normal">{faculty} — {major}</span>
          </h2>
        </div>

        <div className="space-y-4">
          {Object.entries(weights).map(([subject, percent]) => {
            if (["university", "faculty", "major"].includes(subject)) return null;
            if (Number(percent) <= 0) return null;

            const normSubject = normalize(subject);
            const isTPAT1 = normSubject.includes("tpat1");
            const isGPAX = normSubject.includes("gpax");

            // กำหนด Label และ Placeholder ตามประเภทวิชา
            let label = `น้ำหนัก ${percent}%`;
            let placeholder = "เต็ม 100";
            
            if (isTPAT1) {
              label += " (ฐานคะแนนเต็ม 300)";
              placeholder = "กรอกคะแนน 0 - 300";
            } else if (isGPAX) {
              label += " (เกรดเฉลี่ย 0.00 - 4.00)";
              placeholder = "เช่น 3.50";
            }

            return (
              <div key={subject}
                className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-4 space-y-3 transition-all hover:shadow-md">
                <h2 className="font-semibold text-lg text-[#777777]">{subject}</h2>

                <Input
                  type="number"
                  label={label}
                  placeholder={placeholder}
                  variant="bordered"
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [subject]: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white rounded-xl"
                />
              </div>
            );
          })}
        </div>

        <Button
          radius="full"
          className="w-full py-7 bg-[#F7CDBA] text-[#5F5F5F]
                     text-2xl font-semibold shadow-md hover:scale-[1.02] transition-transform"
          onPress={handleNext}
        >
          คำนวณผลคะแนน →
        </Button>

      </div>
    </div>
  );
}
