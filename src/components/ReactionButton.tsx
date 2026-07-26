"use client";

import { useState, useRef, useEffect } from "react";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry" | "care";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "\uD83D\uDC4D", label: "Like" },
  { type: "love", emoji: "\u2764\uFE0F", label: "Love" },
  { type: "haha", emoji: "\uD83D\uDE02", label: "HaHa" },
  { type: "wow", emoji: "\uD83D\uDE2E", label: "Wow" },
  { type: "sad", emoji: "\uD83D\uDE22", label: "Sad" },
  { type: "angry", emoji: "\uD83D\uDE21", label: "Angry" },
  { type: "care", emoji: "\uD83E\uDD70", label: "Care" },
];

type Props = {
  currentUserReaction: ReactionType | null;
  reactionCounts: Partial<Record<ReactionType, number>>;
  onReact: (type: ReactionType) => void;
};

export default function ReactionButton({ currentUserReaction, reactionCounts, onReact }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + (b || 0), 0);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
          currentUserReaction ? "text-primary" : "text-base-content/40 hover:text-primary"
        }`}
      >
        {currentUserReaction ? (
          <span className="text-lg">{REACTIONS.find((r) => r.type === currentUserReaction)?.emoji}</span>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
        <span>{totalReactions || ""}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-base-100 border border-base-200 rounded-2xl shadow-xl px-2 py-1.5 z-50 animate-fade-in-up">
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => { onReact(r.type); setOpen(false); }}
              className={`relative group flex items-center justify-center w-9 h-9 rounded-full hover:scale-125 transition-transform ${
                currentUserReaction === r.type ? "bg-primary/10 scale-110" : ""
              }`}
              title={r.label}
            >
              <span className="text-xl">{r.emoji}</span>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-base-content text-base-100 text-[10px] font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {r.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
