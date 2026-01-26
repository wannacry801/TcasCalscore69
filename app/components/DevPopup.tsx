"use client";

import React from "react";
import { X } from "lucide-react";

type DevPopupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function DevPopup({
  open,
  onClose,
  title = "Developer Popup",
  children,
}: DevPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[#F7F3F5] overflow-y-auto">

        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between 
                        px-6 py-4 bg-white border-b border-[#E2D8D0]">
          <h1 className="text-xl font-bold text-[#555]">{title}</h1>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F0E6DE]"
          >
            <X size={22} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-8 max-w-5xl mx-auto">
          {children}
        </div>

      </div>
    </div>
  );
}