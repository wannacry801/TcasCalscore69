import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-[#F7F3F5] text-[#5F5F5F]">
        {children}
      </body>
    </html>
  );
}