"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";

export default function DevPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // ให้ popup เด้งทันทีเมื่อเข้าเว็บ
    setOpen(true);
  }, []);

  return (
    <Modal
      isOpen={open}
      onOpenChange={setOpen}
      backdrop="blur"
      placement="center"
      className="rounded-3xl"
    >
      <ModalContent className="rounded-3xl bg-[#F7EDE4] border border-[#E3E2E7] shadow-2xl">
        {(onClose) => (
          <>
            <ModalHeader className="text-xl font-bold text-[#333] text-center">
              ⚠️ เว็บไซต์กำลังอยู่ในขั้นตอนการพัฒนา
            </ModalHeader>

            <ModalBody className="text-center text-[#555] text-md">
              ฟีเจอร์บางส่วนอาจยังทำงานไม่สมบูรณ์  
              ขอบคุณที่เข้ามาใช้งานเวอร์ชันทดลองค่ะ 💛
            </ModalBody>

            <ModalFooter className="flex justify-center">
              <Button
                color="primary"
                radius="full"
                className="px-10 py-2 bg-[#F7CDBA] text-[#5F5F5F]"
                onPress={onClose}
              >
                รับทราบ
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}