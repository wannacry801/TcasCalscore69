"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";

type HistRow = {
  university: string;
  faculty: string;
  major: string;
  Min_Score_66?: number;
  Min_Score_67?: number;
  Min_Score_68?: number;
};

// แปลงชื่อมหาวิทยาลัยเป็น slug สำหรับใช้หาไฟล์โลโก้ใน public/logos
const universityLogoSlugMap: Record<string, string> = {
  "พระจอมเกล้าพระนครเหนือ(kmutnb)": "kmutnb",
  "พระจอมเกล้าคุณทหารลาดกระบัง(kmitl)": "kmitl",
};

function slugifyUniversity(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function getUniversityLogo(name: string) {
  const override = universityLogoSlugMap[name];
  const slug = override ?? slugifyUniversity(name);
  return `/logos/${slug}.png`;
}

function getUniversityInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const dataParam = params.get("data");
  const [hist, setHist] = useState<HistRow | null>(null);

  const decoded = useMemo(() => {
    if (!dataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(dataParam));
    } catch (e) {
      console.error("decode data error", e);
      return null;
    }
  }, [dataParam]);

  if (!decoded) return <div className="p-10 text-center text-gray-500">ไม่พบข้อมูลคะแนน</div>;

  const { university, faculty, major, weights, scores } = decoded as {
    university: string;
    faculty: string;
    major: string;
    weights: Record<string, number | string>;
    scores: Record<string, number | string>;
  };

  // 1. กรองเฉพาะวิชาที่ใช้จริง (Weight > 0)
  const usedSubjects = Object.entries(weights).filter(([_, weight]) => Number(weight) > 0);

  // คำนวณคะแนนรวม
  const total = usedSubjects.reduce(
    (sum, [key, weight]) => sum + (Number(scores[key] || 0) * Number(weight)) / 100,
    0
  );

  useEffect(() => {
    fetch("/HisScore.csv")
      .then((r) => r.text())
      .then((text) => {
        const rows = text
          .trim()
          .split("\n")
          .slice(1)
          .map((l) => {
            const [u, f, m, s66, s67, s68] = l.split(",");
            return {
              university: u,
              faculty: f,
              major: m,
              Min_Score_66: s66 ? Number(s66) : undefined,
              Min_Score_67: s67 ? Number(s67) : undefined,
              Min_Score_68: s68 ? Number(s68) : undefined,
            };
          });
        setHist(rows.find((r) => r.university === university && r.faculty === faculty && r.major === major) ?? null);
      });
  }, [decoded, university, faculty, major]);

  const getMinScoreByYear = (year: number) => {
    if (!hist) return undefined;
    if (year === 68) return hist.Min_Score_68;
    if (year === 67) return hist.Min_Score_67;
    if (year === 66) return hist.Min_Score_66;
    return undefined;
  };

  const baseMin =
    hist?.Min_Score_68 ?? hist?.Min_Score_67 ?? hist?.Min_Score_66 ?? null;
  const diffFromBase = baseMin !== null ? total - baseMin : null;
  const diffColor =
    diffFromBase === null
      ? "bg-[#6BBF9C] text-white border border-[#A7D7C5]"
      : diffFromBase < -2
      ? "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
      : diffFromBase < 0
      ? "bg-[#FFFBEB] text-[#C05621] border border-[#FEF3C7]"
      : "bg-[#ECFDF3] text-[#166534] border border-[#BBF7D0]";
  const diffLabel =
    diffFromBase === null
      ? ""
      : diffFromBase >= 0
      ? `สูงกว่าปีก่อน ${diffFromBase.toFixed(2)}`
      : `ต่ำกว่าปีก่อน ${Math.abs(diffFromBase).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12 font-sans">
      {/* Header */}
      <div className="bg-[#E67E22] pt-12 pb-4 px-4 rounded-b-[30px] shadow-sm text-white text-center relative z-10">
        <h1 className="text-lg font-bold">ผลการคำนวณ</h1>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-2 space-y-5">
        
        {/* Title Section */}
        <div className="text-center pt-6 pb-2">
            <p className="text-gray-800 font-bold text-lg">มหาวิทยาลัย และคณะที่อยากเข้า</p>
        </div>

        {/* 2. Main Card ปรับเป็นสไตล์ daisyUI card */}
        <div className="card bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
          <div className="card-body p-5">
            <div className="flex justify-between items-start mb-6">
              <div className="w-[65%] pr-2">
              <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-0.1 h-0.1 rounded-full bg-white border-2 border-[#E3E7EC] flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                    {/* รูปโลโก้: วางไฟล์ไว้ที่ public/logos/<slug>.png เช่น จุฬาฯ -> chulalongkorn-university.png */}
                    <img
                      src={getUniversityLogo(university)}
                      alt={university}
                      className="w-[5%] h-[5%] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none"; // ซ่อนรูปถ้าไม่พบไฟล์
                        const fallback = target.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                    <span className="hidden absolute inset-0 items-center justify-center pointer-events-none">
                      {getUniversityInitials(university)}
                    </span>
                  </div>
                  <h2 className="card-title text-[#E67E22] text-lg leading-tight line-clamp-2">
                    {university}
                  </h2>
                </div>
                <h3 className="text-gray-600 font-medium text-sm leading-snug">{faculty}</h3>
                <p className="text-gray-500 text-xs mt-1">{major}</p>
              </div>

              {/* Score Badge */}
              <div className={`${diffColor} p-3 rounded-2xl text-center min-w-[120px] shadow-sm transform rotate-1`}>
                <p className="text-[10px] opacity-90">คะแนนของคุณ</p>
                <p className="text-3xl font-black tracking-tighter">{total.toFixed(2)}</p>
                <div className="h-[1px] bg-white/40 my-1"></div>
                <p className="text-[10px] opacity-90">เต็ม 100</p>
                {diffFromBase !== null && (
                  <p className="mt-1 text-[11px] opacity-90">{diffLabel}</p>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <table className="w-full text-xs text-gray-700 border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-tl-3xl border-r border-b border-gray-200">ปี</th>
                    <th className="px-4 py-3 text-left border-r border-b border-gray-200">ประมวลผล</th>
                    <th className="px-4 py-3 text-left border-r border-b border-gray-200">ต่ำสุด</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {[69, 68, 67, 66].map((year, idx, arr) => {
                    const isLast = idx === arr.length - 1;
                    return (
                      <tr key={year} className="hover:bg-gray-50">
                        <td className={`px-4 py-3 font-semibold text-gray-800 border-r border-b border-gray-200 ${isLast ? "rounded-bl-3xl" : ""}`}>{year}</td>
                        <td className="px-4 py-3 text-[#E67E22] text-[10px] leading-tight border-r border-b border-gray-200">
                          {year === 69 ? "รอ" : (
                            <>
                              ครั้งที่ 2<br />ครั้งที่ 1
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800 text-sm border-r border-b border-gray-200">
                          {year === 69 ? "รอ" : getMinScoreByYear(year)?.toFixed(2) || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* รูปประกอบแบบ card figure */}
        </div>

        {/* 3. Subjects Section (ใช้ usedSubjects ที่กรองแล้ว) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_24px_rgba(0,0,0,0.05)] space-y-4 border border-[#E6E8EB]">
          <div className="flex justify-between items-end mb-2">
            <h4 className="text-[#2F3D4A] font-bold text-lg">สูตรการคิดคะแนน</h4>
            <span className="text-xs text-gray-500 mb-1">(เต็ม 100 คะแนน)</span>
          </div>

          {/* Grid inline (no outer cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {usedSubjects.map(([key, weight], index) => {
              const colors = ['#E67E22', '#3498DB', '#E74C3C', '#9B59B6'];
              const scoreValue = Number(scores[key] || 0);
              const calculated = (scoreValue * Number(weight)) / 100;
              const weightValue = Number(weight);

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-[#E3E7EC] bg-white shadow-[0_6px_14px_rgba(0,0,0,0.04)] p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % 4] }}
                    />
                    <span className="text-sm font-semibold text-[#1F2937] line-clamp-2">{key}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-gray-600">
                    <span>น้ำหนัก</span>
                    <span className="font-semibold" style={{ color: colors[index % 4] }}>
                      {weightValue}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-gray-600">
                    <span>ได้ (คำนวณ)</span>
                    <span className="font-semibold text-[#111827]">{calculated.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${weightValue}%`, backgroundColor: colors[index % 4] }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Button */}
        <div className="pt-4 pb-8">
            <Button
            radius="full"
            onPress={() => router.push("/")}
            className="w-full h-14 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-500 font-bold text-lg shadow-sm"
            >
            &lt; กลับหน้าหลัก
            </Button>
        </div>

      </div>
    </div>
  );
}
