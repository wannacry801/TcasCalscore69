"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button
} from "@heroui/react";
import { Mail } from "lucide-react"; // ใช้ icon ซองจดหมายเพื่อให้คล้ายต้นฉบับ

export default function DevPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Modal
      isOpen={open}
      onOpenChange={setOpen}
      backdrop="blur"
      placement="center"
      hideCloseButton={true} // ปิดปุ่มกากบาทเพื่อให้ดูคลีนเหมือนในรูป
      className="max-w-[400px] mx-4"
    >
      <ModalContent className="rounded-none overflow-hidden border-none shadow-2xl">
        {(onClose) => (
          <ModalBody className="p-0">
            {/* ส่วนหัวสีแดงและรูปซองจดหมาย */}
            <div className="bg-[#FF4D4D] h-40 flex flex-col items-center justify-center relative overflow-hidden">
                {/* ตกแต่งลายเส้นพื้นหลังเล็กน้อย (Optional) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-2 left-4 rotate-45 text-white">✕</div>
                    <div className="absolute bottom-5 right-10 -rotate-12 text-white">✕</div>
                </div>
                
                {/* ไอคอนซองจดหมาย (ใช้ Lucide-react หรือใส่ <img> ของคุณเอง) */}
                <div className="bg-white p-4 rounded-lg shadow-lg rotate-[-5deg] border-2 border-slate-800">
                    <Mail size={48} className="text-slate-800" strokeWidth={1.5} />
                </div>
            </div>

            {/* ส่วนเนื้อหา */}
            <div className="bg-white p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                ชอบบทความที่อ่าน
              </h2>
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                และไม่อยากพลาดเรื่องใหม่ๆ?
              </h3>
              
              <p className="text-red-500 text-sm font-medium leading-tight mb-6">
                เว็บไซต์นี้กำลังอยู่ในช่วงพัฒนา <br />
                เราพร้อมมอบประสบการณ์ที่ดีที่สุดให้คุณเร็วๆ นี้
              </p>

              {/* ปุ่มเข้าสู่หน้าหลัก (แทนที่ปุ่มส่งอีเมล) */}
              <Button
                color="danger"
                radius="none"
                className="w-full bg-[#FF4D4D] text-white font-bold text-lg h-12 mb-4"
                onPress={onClose}
              >
                เข้าสู่หน้าหลัก
              </Button>

              <button 
                onClick={onClose}
                className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
              >
                คราวหน้าแล้วกัน
              </button>
            </div>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
