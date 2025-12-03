"use client";

import "./globals.css";
import { Kanit } from "next/font/google";
import { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import DevPopup from "./components/DevPopup";

const kanit = Kanit({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={kanit.variable}>
      <body className="font-kanit">
        <HeroUIProvider>   {/* ← สำคัญมาก ต้องมี */}
          {children}
          <DevPopup />    {/* ต้องอยู่ใน Provider ด้วย */}
        </HeroUIProvider>
      </body>
    </html>
  );
}