"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm lg:left-64" onClick={onClose} />
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:left-64"
        style={{ pointerEvents: "none" }}
      >
        <div style={{ pointerEvents: "auto" }} className="w-full max-w-md">
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
