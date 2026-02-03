import type { Metadata } from "next";
import "./globals.css";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TCAS Calculator",
  description: "เว็บไซต์ช่วยคำนวณคะแนน TCAS เพื่อการตัดสินใจเท่านั้น",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={prompt.className + " bg-[#F7F3F5] text-[#5F5F5F]"}>
        {children}
      </body>
    </html>
  );
}
