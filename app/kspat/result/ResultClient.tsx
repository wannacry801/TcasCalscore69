"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";

type HisRow = {
  track: string;
  university: string;
  min66?: number;
  min67?: number;
  min68?: number;
};

function parseCSV(text: string): HisRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const [t, u, s66, s67, s68] = line.split(",").map((x) => x.trim());
    return {
      track: t,
      university: u,
      min66: s66 ? Number(s66) : undefined,
      min67: s67 ? Number(s67) : undefined,
      min68: s68 ? Number(s68) : undefined,
    };
  });
}

export default function KspatResultClient() {
  const params = useSearchParams();
  const router = useRouter();

  const dataString = params.get("data");
  if (!dataString) return <div className="p-10">ไม่พบข้อมูล</div>;

  const decoded = JSON.parse(decodeURIComponent(dataString));
  const totalScore: number = decoded.totalScore;
  const track: string = decoded.track;
  const university: string = decoded.university;

  const [hisRow, setHisRow] = useState<HisRow | null>(null);

  // โหลด HisScore_KSPAT.csv
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/HisScore_KSPAT.csv");
        const text = await res.text();
        const rows = parseCSV(text);

        const found = rows.find(
          (r) => r.track === track && r.university === university
        );

        setHisRow(found ?? null);
      } catch (e) {
        console.error("โหลด HisScore_KSPAT.csv ไม่ได้", e);
      }
    }
    load();
  }, [track, university]);

  // วิเคราะห์ผล
  let compareUI = (
    <div className="rounded-[20px] bg-[#EAF4F0] border border-[#CFE5DC] px-5 py-4 text-sm text-[#5F8F82]">
      ไม่มีข้อมูลคะแนนย้อนหลังของสถาบันนี้
    </div>
  );

  if (hisRow) {
    const base = hisRow.min68 ?? hisRow.min67 ?? hisRow.min66 ?? 0;

    const diff = totalScore - base;
    const diffAbs = Math.abs(diff).toFixed(2);

    let level = "";
    let msg = "";

    if (diff >= 5) {
      level = "🌿 โอกาสติดสูงมาก";
      msg = "คะแนนคุณสูงกว่าคะแนนต่ำสุดย้อนหลังมาก โอกาสติดสูง";
    } else if (diff >= 2) {
      level = "โอกาสติดดี";
      msg = "คะแนนสูงกว่าคะแนนย้อนหลังพอสมควร";
    } else if (diff >= 0) {
      level = "ลุ้นติด";
      msg = "คะแนนใกล้เคียงกับปีก่อน ต้องลุ้นจำนวนผู้สมัคร";
    } else if (diff >= -2) {
      level = "ลุ้นยาก";
      msg = "คะแนนต่ำกว่าปีก่อนเล็กน้อย";
    } else {
      level = "ความเสี่ยงสูง";
      msg = "คะแนนต่ำกว่าปีก่อนค่อนข้างมาก แนะนำมีแผนสำรอง";
    }

    const diffText =
      diff >= 0
        ? `สูงกว่าคะแนนต่ำสุดย้อนหลัง ${diffAbs} คะแนน`
        : `ต่ำกว่าคะแนนต่ำสุดย้อนหลัง ${diffAbs} คะแนน`;

    compareUI = (
      <div className="rounded-[22px] bg-[#EAF4F0] border border-[#CFE5DC] px-5 py-6 space-y-3">
        <h2 className="text-lg font-semibold text-[#2F7D6B]">วิเคราะห์โอกาสติด</h2>

        <table className="w-full text-sm">
          <tbody>
            {hisRow.min66 && (
              <tr>
                <td>TCAS66</td>
                <td className="text-right">{hisRow.min66.toFixed(2)}</td>
              </tr>
            )}
            {hisRow.min67 && (
              <tr>
                <td>TCAS67</td>
                <td className="text-right">{hisRow.min67.toFixed(2)}</td>
              </tr>
            )}
            {hisRow.min68 && (
              <tr>
                <td>TCAS68</td>
                <td className="text-right">{hisRow.min68.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="font-semibold text-[#5F8F82]">{diffText}</p>
        <p className="font-semibold text-[#2F7D6B]">{level}</p>
        <p className="text-sm text-[#6F8F86]">{msg}</p>
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen flex justify-center bg-[#F2F8F5] py-12 px-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white border border-[#DDEBE4] px-6 py-10 space-y-8">
        <h1 className="text-3xl font-bold text-center text-[#2F7D6B]">ผลการประเมิน กสพท</h1>

        <div className="rounded-[24px] bg-[#6BBF9C] px-6 py-8 text-center text-white">
          <div className="text-sm mb-1">
            {track} — {university}
          </div>
          <div className="text-6xl font-bold">{totalScore.toFixed(2)}</div>
          <div className="text-sm mt-2">คะแนนรวม (เต็ม 100)</div>
        </div>

        {compareUI}

        <Button
          onPress={() => router.push("/")}
          radius="full"
          size="lg"
          className="mx-auto block px-12 py-6 bg-[#A7D7C5] text-[#2F7D6B] text-xl font-semibold shadow-md hover:opacity-90"
        >
          กลับหน้าหลัก
        </Button>
      </div>
    </div>
  );
}
