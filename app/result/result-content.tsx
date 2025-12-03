"use client";

import React, { JSX, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@heroui/react";

type HistRow = {
  university: string;
  faculty: string;
  major: string;
  min66: number | null;
  min67: number | null;
};

export default function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();

  const dataString = params.get("data");
  if (!dataString) return <div className="p-10">ไม่พบข้อมูล</div>;

  const decoded = JSON.parse(decodeURIComponent(dataString));

  const uni: string = decoded.university;
  const facultyName: string = decoded.faculty;
  const majorName: string = decoded.major;
  const weights = decoded.weights;
  const rawScores = decoded.scores;

  const [histRow, setHistRow] = useState<HistRow | null>(null);

  // ------------------------------------
  // คำนวณคะแนนรวม
  // ------------------------------------
  const total = Object.entries(rawScores).reduce((sum, [sub, raw]) => {
    const percent = Number(weights[sub] ?? 0);
    return sum + (Number(raw) * percent) / 100;
  }, 0);

  // ------------------------------------
  // โหลดคะแนนย้อนหลัง
  // ------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/HisScore.csv");
        const text = await res.text();
        const parsed = parseCSV(text);

        // แมตช์แบบ exact ชัดเจน
        const row = parsed.find(
          (r) =>
            r.university === uni &&
            r.faculty === facultyName &&
            r.major === majorName
        );

        setHistRow(row ?? null);
      } catch (e) {
        console.error("โหลด HisScore.csv ไม่ได้:", e);
      }
    }
    load();
  }, [uni, facultyName, majorName]);

  // parse CSV
  function parseCSV(text: string): HistRow[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1);
    return dataLines.map((line) => {
      const [u, f, m, s66, s67] = line.split(",").map((x) => x.trim());

      return {
        university: u,
        faculty: f,
        major: m,
        min66: s66 ? Number(s66) : null,
        min67: s67 ? Number(s67) : null,
      };
    });
  }

  // ------------------------------------
  // วิเคราะห์เทียบคะแนนย้อนหลัง
  // ------------------------------------
  let compareUI: JSX.Element | null = null;

  if (histRow) {
    const base = histRow.min67 ?? histRow.min66;
    const diff = total - (base ?? 0);
    const diffAbs = Math.abs(diff).toFixed(2);

    let level = "";
    let msg = "";

    if (diff >= 5) {
      level = "✨ โอกาสติดสูงมาก";
      msg = "คะแนนคุณสูงกว่าปีที่แล้วค่อนข้างมาก โอกาสติดดีมาก";
    } else if (diff >= 2) {
      level = "โอกาสติดค่อนข้างดี";
      msg = "คะแนนสูงกว่าปีที่ผ่านมาเล็กน้อย แต่มีโอกาสดี";
    } else if (diff >= 0) {
      level = "ลุ้นติด";
      msg = "คะแนนใกล้เคียงกับปีที่ผ่านมา อาจต้องลุ้นจำนวนผู้สมัคร";
    } else if (diff >= -2) {
      level = "ไม่ติดไอสัส";
      msg = "คะแนนต่ำกว่าปีที่แล้วเล็กน้อย แต่ถ้าปีนี้คะแนนตกอาจยังมีลุ้น";
    } else {
      level = "ไม่ติดหรอกไอเหี้ยโง่ยังอยากจะยื่น";
      msg = "คะแนนต่ำกว่าปีที่แล้วพอสมควร แนะนำมีแผนสำรอง";
    }

    const diffText =
      diff >= 0
        ? `สูงกว่าคะแนนต่ำสุดปีที่แล้ว ${diffAbs} คะแนน`
        : `ต่ำกว่าคะแนนต่ำสุดปีที่แล้ว ${diffAbs} คะแนน`;

    compareUI = (
      <div className="rounded-[20px] bg-[#F7EDE4] border border-[#E3E2E7] px-5 py-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#777777]">เปรียบเทียบคะแนนย้อนหลัง</h2>

        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="text-[#999] border-b border-[#E3E2E7]">
              <th className="p-2 text-left">ปี</th>
              <th className="p-2 text-right">คะแนนต่ำสุด</th>
            </tr>
          </thead>
          <tbody>
            {histRow.min66 && (
              <tr className="border-b border-[#E3E2E7]">
                <td className="p-2">TCAS66</td>
                <td className="p-2 text-right">{histRow.min66.toFixed(2)}</td>
              </tr>
            )}
            {histRow.min67 && (
              <tr>
                <td className="p-2">TCAS67</td>
                <td className="p-2 text-right">{histRow.min67.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="font-semibold text-[#555]">{diffText}</p>
        <p className="font-semibold text-[#C2855A]">{level}</p>
        <p className="text-sm text-[#777]">{msg}</p>
      </div>
    );
  }

  // ------------------------------------
  // UI หลัก (เหมือนเดิม 100%)
  // ------------------------------------

  return (
    <div className="min-h-screen flex justify-center bg-[#F7F3F5] py-12 px-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-sm border border-[#E2D8D0] px-6 py-10 space-y-8">

        <h1 className="text-3xl font-bold text-center text-[#C0CAC5]">ผลคะแนนรวม</h1>

        {/* CARD — SUMMARY */}
        <div className="rounded-[24px] bg-[#F7CDBA] shadow px-6 py-8 text-center">
          <div className="text-sm text-[#5F5F5F] mb-1">
            {uni} — {facultyName} — {majorName}
          </div>
          <div className="text-xs text-[#5F5F5F] mb-3">
            คะแนนรวมคำนวณจาก TGAT / TPAT / A-Level
          </div>
          <div className="text-6xl font-bold text-white">
            {total.toFixed(2)}
          </div>
        </div>

        {/* COMPARE CARD */}
        {compareUI ?? (
          <div className="rounded-[20px] bg-[#F7EDE4] border border-[#E3E2E7] px-5 py-4 text-sm text-[#777]">
            ไม่มีข้อมูลคะแนนย้อนหลังของสาขานี้
          </div>
        )}

        {/* SCORE TABLE */}
        <div className="rounded-[20px] border border-[#E3E2E7] bg-[#F7EDE4] px-4 py-6">
          <h2 className="text-xl font-semibold mb-4 text-[#777777]">
            คะแนนรายวิชา
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E3E2E7] text-[#9B9B9B]">
                <th className="p-2 text-left">วิชา</th>
                <th className="p-2 text-right">คะแนนที่ได้</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(rawScores).map((sub) => (
                <tr key={sub} className="border-b border-[#E3E2E7]">
                  <td className="p-2">{sub}</td>
                  <td className="p-2 text-right">
                    {((rawScores[sub] * (weights[sub] ?? 0)) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BACK BUTTON */}
        <Button
          onPress={() => router.push("/")}
          size="lg"
          radius="full"
          className="mx-auto block px-12 py-6 bg-[#F7CDBA] text-[#5F5F5F] 
                     text-2xl font-semibold shadow-md hover:opacity-90"
        >
          กลับไปหน้ากรอกคะแนน
        </Button>

      </div>
    </div>
  );
}