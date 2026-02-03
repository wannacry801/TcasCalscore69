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
    .replace(/—/g, "") // ลบ em-dash
    .replace(/-/g, "") // ลบ hyphen ปกติ
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // ลบ zero-width
}

export default function ScorePageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const university = params.get("university") ?? "";
  const faculty = params.get("faculty") ?? "";
  const major = params.get("major") ?? "";

  type WeightRow = Record<string, string>;
  type ScoreMap = Record<string, number>;

  const [weights, setWeights] = useState<WeightRow | null>(null);
  const [scores, setScores] = useState<ScoreMap>({});

  useEffect(() => {
    if (!university || !faculty || !major) return;

    Papa.parse("/Score.csv", {
      download: true,
      header: true,
      complete: (result: { data: WeightRow[] }) => {
        const found = result.data.find(
          (d) =>
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

  const grouped = {
    TGAT: [] as [string, string][],
    TPAT: [] as [string, string][],
    ALEVEL: [] as [string, string][],
  };

  Object.entries(weights).forEach(([subject, percent]) => {
    if (["university", "faculty", "major"].includes(subject)) return;
    if (Number(percent) <= 0) return;
    if (subject.toUpperCase().startsWith("TGAT")) {
      grouped.TGAT.push([subject, String(percent)]);
    } else if (subject.toUpperCase().startsWith("TPAT")) {
      grouped.TPAT.push([subject, String(percent)]);
    } else {
      grouped.ALEVEL.push([subject, String(percent)]);
    }
  });

  const renderSection = (title: string, items: [string, string][]) => {
    if (!items.length) return null;
    return (
      <div className="space-y-4 rounded-3xl border border-[#E8EBEF] bg-white shadow-[0_10px_26px_rgba(0,0,0,0.03)] p-4">
        <h3 className="text-lg font-semibold text-[#E67E22] px-1">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(([subject, percent]) => (
            <label
              key={subject}
              className="block rounded-2xl bg-[#FBFBFD] border-2 border-[#E1E4EA] shadow-[0_6px_16px_rgba(0,0,0,0.02)] p-3 space-y-2 focus-within:ring-2 focus-within:ring-[#F6C57F]"
            >
              <div className="flex items-center justify-between text-xs text-[#6B7A84]">
                <span className="font-semibold text-[#1F3A4A] text-sm">{subject}</span>
                <span> {percent}% </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                placeholder={subject}
                className="w-full rounded-full bg-white text-center border-2 border-[#D5D9DF] px-5 py-4 text-lg font-semibold text-[#1F3A4A] outline-none focus:border-[#F6C57F] focus:ring-2 focus:ring-[#F6C57F] placeholder:text-[#CBD2D8]"
                onChange={(e) =>
                  setScores({
                    ...scores,
                    [subject]: Number(e.target.value),
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-[#F8FAF8] to-[#F1F3F5] py-14 px-5">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.05)] border border-[#E8EBEF] px-5 py-8 sm:px-8 sm:py-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm tracking-wide text-[#8BA0A6] font-medium">TCAS Score Calculator</p>
          <h1 className="text-3xl font-bold text-[#1F3A4A]">กรอกคะแนนสำหรับสาขา</h1>
          <p className="text-lg text-[#5E6B75]">
            {university} — {faculty} — {major}
          </p>
        </div>

      <div className="space-y-8">
        {renderSection("TGAT", grouped.TGAT)}
        {renderSection("TPAT", grouped.TPAT)}
        {renderSection("A-Level", grouped.ALEVEL)}
      </div>

        <div className="pt-2">
          <Button
            radius="full"
            size="lg"
            className="w-full px-5 py-4 text-xl font-semibold bg-gradient-to-r from-[#6BC2A4] to-[#8DD6BE] text-white shadow-[0_12px_28px_rgba(107,194,164,0.35)] hover:opacity-95"
            onPress={handleNext}
          >
            ไปหน้าผลคะแนน →
          </Button>
        </div>
      </div>
    </div>
  );
}
