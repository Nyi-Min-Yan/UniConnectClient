"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function ModalPortal({ children, visible, onClose }: { children: ReactNode; visible: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (visible && dialog && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      if (dialog?.open) dialog.close();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box">
        {children}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
