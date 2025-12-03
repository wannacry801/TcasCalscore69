"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Input, Button } from "@heroui/react";

export default function ScorePage() {
  const params = useSearchParams();
  const router = useRouter();

  const university = params.get("university");
  const faculty = params.get("faculty");
  const major = params.get("major");

  const [weights, setWeights] = useState<any>(null);
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    if (!university || !faculty || !major) return;

    Papa.parse("/Score.csv", {
      download: true,
      header: true,
      complete: (result: { data: any[]; }) => {
        const found = result.data.find(
          (d: any) =>
            d.university === university &&
            d.faculty === faculty &&
            d.major === major
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
    router.push(
      `/result?data=${encodeURIComponent(
        JSON.stringify({
          university,
          faculty,
          major,
          weights,
          scores,
        })
      )}`
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-[#F7F3F5] py-12 px-4">
      <div
        className="
          w-full max-w-2xl 
          rounded-[24px] bg-white 
          shadow-sm border border-[#E2D8D0] 
          px-6 py-8 space-y-6
        "
      >
        {/* HEADER */}
        <h1 className="text-3xl font-bold text-center text-[#C0CAC5]">
          กรอกคะแนนสำหรับสาขา
        </h1>

        <h2 className="text-2xl font-semibold text-center text-[#777777]">
          {university} — {faculty} — {major}
        </h2>

        {/* SCORE INPUT CARDS */}
        <div className="space-y-4">
          {Object.entries(weights).map(([subject, percent]) => {
            if (["university", "faculty", "major"].includes(subject))
              return null;

            if (Number(percent) <= 0) return null;

            return (
              <div
                key={subject}
                className="
                  rounded-[20px] border border-[#E3E2E7] 
                  bg-[#F7EDE4] px-4 py-4 space-y-3
                "
              >
                <h2 className="font-semibold text-lg text-[#777777]">
                  {subject}
                </h2>

                <Input
                  type="number"
                  label={`น้ำหนัก ${percent}%`}
                  placeholder="กรอกคะแนนดิบ"
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

        {/* SUBMIT BUTTON */}
        <Button
          radius="full"
          className="
            mx-auto block 
            px-12 py-6
            bg-[#F7CDBA]
            text-[#5F5F5F]
            text-2xl
            font-semibold
            shadow-md
            hover:opacity-90
          "
          onPress={handleNext}
        >
          ไปหน้าผลคะแนน →
        </Button>
      </div>
    </div>
  );
}