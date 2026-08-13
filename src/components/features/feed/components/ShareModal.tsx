"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/ui/Toast";

const SUGGESTED_USERS = [
  { name: "Sarah Chen", avatar: "SC", mutual: 12 },
  { name: "Marcus Johnson", avatar: "MJ", mutual: 8 },
  { name: "Emily Rodriguez", avatar: "ER", mutual: 15 },
  { name: "David Kim", avatar: "DK", mutual: 5 },
  { name: "Lisa Thompson", avatar: "LT", mutual: 3 },
  { name: "Alex Wong", avatar: "AW", mutual: 9 },
  { name: "Jessica Patel", avatar: "JP", mutual: 7 },
  { name: "Kevin Martinez", avatar: "KM", mutual: 4 },
  { name: "Amanda Wilson", avatar: "AW", mutual: 6 },
  { name: "Brandon Brown", avatar: "BB", mutual: 2 },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onShare?: () => void;
};

export default function ShareModal({ visible, onClose, onShare }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [shared, setShared] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (visible && dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [visible]);

  if (!visible) return null;

  const filtered = SUGGESTED_USERS.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = (name: string) => {
    setShared((prev) => new Set(prev).add(name));
    setToast({ visible: true, message: `Shared with ${name}` });
    onShare?.();
  };

  return (
    <>
      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
        <div className="modal-box p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 shrink-0">
            <h2 className="text-sm font-bold text-base-content">Share with</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="px-4 py-2 border-b border-base-200 shrink-0">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-2 py-2 min-h-0">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-base-content/30 py-8">No users found</p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((user) => (
                  <div key={user.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-base-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-base-content">{user.name}</p>
                      <p className="text-[10px] text-base-content/40">{user.mutual} mutual friends</p>
                    </div>
                    <button
                      onClick={() => handleShare(user.name)}
                      disabled={shared.has(user.name)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                        shared.has(user.name)
                          ? "bg-green-100 text-green-700"
                          : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      }`}
                    >
                      {shared.has(user.name) ? "Shared" : "Share"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <Toast visible={toast.visible} message={toast.message} type="success" onClose={() => setToast({ visible: false, message: "" })} />
    </>
  );
}
