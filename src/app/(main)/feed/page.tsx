"use client";

import { useState, useEffect, useRef } from "react";

const ScanStyles = () => (
  <style>{`
    /* ===== IMAGE SCANNER - GPU Accelerated ===== */
    @keyframes scan-move-right {
      0% { transform: translateX(-120%); }
      100% { transform: translateX(120%); }
    }

    @keyframes scan-move-left {
      0% { transform: translateX(120%); }
      100% { transform: translateX(-120%); }
    }

    @keyframes grid-shift {
      0% { background-position: 0 0; }
      100% { background-position: 6px 6px; }
    }

    @keyframes grid-shift-reverse {
      0% { background-position: 6px 6px; }
      100% { background-position: 0 0; }
    }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.4; }
    }

    @keyframes noise-shift {
      0% { background-position: 0 0; }
      100% { background-position: 12px 12px; }
    }

    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }

    @keyframes suspicious-pulse {
      0% { opacity: 0; transform: scaleX(0.8); }
      20% { opacity: 1; transform: scaleX(1); }
      80% { opacity: 1; transform: scaleX(1); }
      100% { opacity: 0; transform: scaleX(1.1); }
    }

    @keyframes check-pop {
      0% { transform: scale(0.5); opacity: 0; }
      60% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes success-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
      50% { box-shadow: 0 0 20px 8px rgba(34,197,94,0); }
    }

    @keyframes fail-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }

    @keyframes particle-float {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      10% { opacity: 0.4; }
      90% { opacity: 0.4; }
      100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
    }

    /* ===== IMAGE SCANNER ===== */
    .scan-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
      z-index: 5;
    }

    /* Single scanner wrapper - moves together */
    .scan-container .scanner {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      will-change: transform;
      transform: translateX(-120%);
      animation: scan-move-right 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    .scan-container .scanner-reverse {
      animation: scan-move-left 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    /* Beam - sharp center line */
    .scan-container .beam {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 3px;
      z-index: 4;
      background: linear-gradient(180deg,
        transparent 0%,
        rgba(59,130,246,0.05) 15%,
        rgba(59,130,246,0.2) 30%,
        rgba(59,130,246,0.7) 45%,
        rgba(255,255,255,0.95) 50%,
        rgba(59,130,246,0.7) 55%,
        rgba(59,130,246,0.2) 70%,
        rgba(59,130,246,0.05) 85%,
        transparent 100%
      );
      box-shadow:
        0 0 8px rgba(59,130,246,0.3),
        0 0 20px rgba(59,130,246,0.15);
    }

    /* Beam glow - wider soft glow */
    .scan-container .beam-glow {
      position: absolute;
      top: 0;
      bottom: 0;
      right: -40px;
      width: 80px;
      z-index: 3;
      background: linear-gradient(90deg,
        rgba(59,130,246,0.00) 0%,
        rgba(59,130,246,0.03) 30%,
        rgba(59,130,246,0.06) 50%,
        rgba(59,130,246,0.03) 70%,
        rgba(59,130,246,0.00) 100%
      );
      pointer-events: none;
    }

    /* Trail - attached behind beam using scaleX */
    .scan-container .trail-container {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 200%;
      z-index: 2;
      transform-origin: right center;
      transform: scaleX(1);
      pointer-events: none;
    }

    .scan-container .trail {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      background: linear-gradient(90deg,
        rgba(59,130,246,0.00) 0%,
        rgba(59,130,246,0.02) 20%,
        rgba(59,130,246,0.04) 40%,
        rgba(59,130,246,0.06) 60%,
        rgba(59,130,246,0.03) 80%,
        rgba(59,130,246,0.00) 100%
      );
      pointer-events: none;
    }

    .scan-container .scanned-grid {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 200%;
      z-index: 2;
      background-image:
        linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px),
        linear-gradient(0deg, rgba(59,130,246,0.04) 1px, transparent 1px);
      background-size: 6px 6px;
      animation: grid-shift 3s linear infinite;
      pointer-events: none;
      transform-origin: right center;
      transform: scaleX(1);
    }

    .scan-container .scanned-grid-reverse {
      animation: grid-shift-reverse 3s linear infinite;
    }

    .scan-container .scanned-edges {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 200%;
      z-index: 1;
      background:
        radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.03) 0%, transparent 50%);
      pointer-events: none;
      transform-origin: right center;
      transform: scaleX(1);
    }

    .scan-container .pixel-reconstruct {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 200%;
      z-index: 1;
      background-image:
        repeating-linear-gradient(90deg,
          rgba(59,130,246,0.015) 0px,
          rgba(59,130,246,0.015) 2px,
          transparent 2px,
          transparent 4px
        ),
        repeating-linear-gradient(0deg,
          rgba(59,130,246,0.015) 0px,
          rgba(59,130,246,0.015) 2px,
          transparent 2px,
          transparent 4px
        );
      background-size: 4px 4px;
      animation: grid-shift 2s linear infinite;
      pointer-events: none;
      transform-origin: right center;
      transform: scaleX(1);
    }

    .scan-container .pixel-reconstruct-reverse {
      animation: grid-shift-reverse 2s linear infinite;
    }

    .scan-container .scan-noise {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0.15;
      background-image:
        repeating-linear-gradient(0deg,
          rgba(255,255,255,0.01) 0px,
          transparent 2px,
          transparent 4px
        ),
        repeating-linear-gradient(90deg,
          rgba(255,255,255,0.005) 0px,
          transparent 3px,
          transparent 6px
        );
      background-size: 6px 6px;
      animation: noise-shift 8s linear infinite;
    }

    .scan-container .particles {
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      overflow: hidden;
    }

    .scan-container .particle {
      position: absolute;
      font-size: 7px;
      font-family: 'Courier New', monospace;
      color: rgba(59,130,246,0.25);
      opacity: 0;
      animation: particle-float 4.5s ease-out infinite;
      pointer-events: none;
    }

    .scan-container .particle:nth-child(1) { left: 20%; top: 60%; animation-delay: 0s; }
    .scan-container .particle:nth-child(2) { left: 35%; top: 40%; animation-delay: 0.8s; }
    .scan-container .particle:nth-child(3) { left: 50%; top: 70%; animation-delay: 1.6s; }
    .scan-container .particle:nth-child(4) { left: 65%; top: 30%; animation-delay: 2.4s; }
    .scan-container .particle:nth-child(5) { left: 80%; top: 55%; animation-delay: 3.2s; }

    .scan-container .suspicious-pulse {
      position: absolute;
      left: 42%;
      top: 0;
      bottom: 0;
      width: 18%;
      z-index: 3;
      background: rgba(239,68,68,0.06);
      border-left: 1px solid rgba(239,68,68,0.2);
      border-right: 1px solid rgba(239,68,68,0.2);
      animation: suspicious-pulse 0.9s ease-out infinite;
      pointer-events: none;
    }

    /* ===== TEXT SCANNER - GPU Accelerated ===== */
    .scan-text-wrapper {
      position: relative;
      display: block;
      width: 100%;
    }

    .scan-text-wrapper .scan-text-content {
      position: relative;
      display: block;
      width: 100%;
      min-height: 40px;
      overflow: hidden;
    }

    /* Single text layer with mask */
    .scan-text-wrapper .text-layer {
      position: relative;
      z-index: 1;
      color: rgba(15, 23, 42, 0.6);
    }

    /* Scanned highlight overlay - uses mask instead of duplicate text */
    .scan-text-wrapper .text-highlight {
      position: absolute;
      inset: 0;
      z-index: 2;
      color: #dbeafe;
      filter: brightness(1.06);
      text-shadow: 0 0 2px rgba(59,130,246,0.06);
      pointer-events: none;
      -webkit-mask-image: linear-gradient(90deg, 
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,1) 20%,
        rgba(0,0,0,1) 100%
      );
      -webkit-mask-size: 200% 100%;
      -webkit-mask-position: 0% 0%;
      mask-image: linear-gradient(90deg, 
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,1) 20%,
        rgba(0,0,0,1) 100%
      );
      mask-size: 200% 100%;
      mask-position: 0% 0%;
      animation: text-reveal 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    .scan-text-wrapper .text-highlight-reverse {
      -webkit-mask-image: linear-gradient(270deg, 
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,1) 20%,
        rgba(0,0,0,1) 100%
      );
      mask-image: linear-gradient(270deg, 
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,1) 20%,
        rgba(0,0,0,1) 100%
      );
      animation: text-reveal-reverse 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    @keyframes text-reveal {
      0% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; }
      100% { mask-position: 100% 0%; -webkit-mask-position: 100% 0%; }
    }

    @keyframes text-reveal-reverse {
      0% { mask-position: 100% 0%; -webkit-mask-position: 100% 0%; }
      100% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; }
    }

    /* Text scanner - single moving unit */
    .scan-text-wrapper .text-scanner {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      pointer-events: none;
      z-index: 3;
      will-change: transform;
      transform: translateX(-120%);
      animation: scan-move-right 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    .scan-text-wrapper .text-scanner-reverse {
      animation: scan-move-left 1.8s cubic-bezier(.4,0,.2,1) infinite;
    }

    /* Text beam */
    .scan-text-wrapper .text-beam {
      position: absolute;
      top: -4px;
      bottom: -4px;
      right: 0;
      width: 3px;
      z-index: 4;
      background: linear-gradient(180deg,
        transparent 0%,
        rgba(59,130,246,0.1) 20%,
        rgba(59,130,246,0.5) 40%,
        rgba(255,255,255,0.85) 50%,
        rgba(59,130,246,0.5) 60%,
        rgba(59,130,246,0.1) 80%,
        transparent 100%
      );
      box-shadow:
        0 0 8px rgba(59,130,246,0.2),
        0 0 20px rgba(59,130,246,0.1);
    }

    /* Text glow */
    .scan-text-wrapper .text-glow {
      position: absolute;
      top: -4px;
      bottom: -4px;
      right: -25px;
      width: 50px;
      z-index: 3;
      background: linear-gradient(90deg,
        rgba(59,130,246,0.00) 0%,
        rgba(59,130,246,0.03) 30%,
        rgba(59,130,246,0.06) 50%,
        rgba(59,130,246,0.03) 70%,
        rgba(59,130,246,0.00) 100%
      );
      pointer-events: none;
    }

    /* Text trail */
    .scan-text-wrapper .text-trail {
      position: absolute;
      top: -4px;
      bottom: -4px;
      right: 0;
      width: 200%;
      z-index: 2;
      background: linear-gradient(90deg,
        rgba(59,130,246,0.00) 0%,
        rgba(59,130,246,0.015) 20%,
        rgba(59,130,246,0.03) 40%,
        rgba(59,130,246,0.04) 60%,
        rgba(59,130,246,0.02) 80%,
        rgba(59,130,246,0.00) 100%
      );
      pointer-events: none;
      transform-origin: right center;
      transform: scaleX(1);
    }

    /* OCR Cursor */
    .scan-text-wrapper .ocr-cursor {
      position: absolute;
      top: -4px;
      bottom: -4px;
      right: 0;
      width: 2px;
      z-index: 5;
      background: rgba(59,130,246,0.7);
      box-shadow: 0 0 6px rgba(59,130,246,0.3);
      animation: cursor-blink 1s ease-in-out infinite;
    }

    /* Text particles */
    .scan-text-wrapper .text-particles {
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      overflow: hidden;
      opacity: 0.2;
    }

    .scan-text-wrapper .text-particle {
      position: absolute;
      font-size: 6px;
      font-family: 'Courier New', monospace;
      color: rgba(59,130,246,0.2);
      opacity: 0;
      animation: particle-float 3s ease-out infinite;
      pointer-events: none;
    }

    .scan-text-wrapper .text-particle:nth-child(1) { left: 15%; top: 40%; animation-delay: 0s; }
    .scan-text-wrapper .text-particle:nth-child(2) { left: 30%; top: 60%; animation-delay: 0.5s; }
    .scan-text-wrapper .text-particle:nth-child(3) { left: 55%; top: 30%; animation-delay: 1s; }
    .scan-text-wrapper .text-particle:nth-child(4) { left: 70%; top: 70%; animation-delay: 1.5s; }
    .scan-text-wrapper .text-particle:nth-child(5) { left: 85%; top: 45%; animation-delay: 2s; }

    /* Suspicious region */
    .scan-text-wrapper .text-suspicious {
      position: absolute;
      left: 42%;
      top: -4px;
      bottom: -4px;
      width: 18%;
      z-index: 2;
      background: rgba(239,68,68,0.04);
      border-left: 1px solid rgba(239,68,68,0.12);
      border-right: 1px solid rgba(239,68,68,0.12);
      animation: suspicious-pulse 0.9s ease-out infinite;
      pointer-events: none;
    }

    /* ===== STATUS STAGES ===== */
    .scan-status {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 15;
      pointer-events: none;
    }

    .scan-status .status-container {
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(59,130,246,0.1);
      box-shadow: 0 2px 16px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 160px;
    }

    .scan-status .spinner {
      width: 14px;
      height: 14px;
      border: 1.5px solid rgba(59,130,246,0.15);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .scan-status .status-text {
      font-size: 10px;
      font-weight: 600;
      color: #1e293b;
      letter-spacing: 0.3px;
      flex: 1;
    }

    .scan-status .status-pass {
      font-size: 8px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.5px;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .scan-status .status-dots {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
    }

    .scan-status .status-dots span {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #3b82f6;
      animation: pulse-dot 1.5s ease-in-out infinite;
    }

    .scan-status .status-dots span:nth-child(2) { animation-delay: 0.3s; }
    .scan-status .status-dots span:nth-child(3) { animation-delay: 0.6s; }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.2; transform: scale(0.6); }
    }

    /* ===== RESULTS ===== */
    .result-overlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: inherit;
      animation: result-fade 0.3s ease-out;
    }

    @keyframes result-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    .result-overlay.success {
      background: rgba(34,197,94,0.12);
      backdrop-filter: blur(4px);
    }

    .result-overlay.fail {
      background: rgba(239,68,68,0.12);
      backdrop-filter: blur(4px);
    }

    .result-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 24px;
      border-radius: 16px;
      background: rgba(255,255,255,0.95);
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      animation: check-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .result-content .icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .result-content .icon.success {
      background: rgba(34,197,94,0.15);
      animation: success-pulse 2s ease-in-out infinite;
    }

    .result-content .icon.fail {
      background: rgba(239,68,68,0.15);
      animation: fail-shake 0.5s ease-in-out;
    }

    .result-content .icon svg {
      width: 18px;
      height: 18px;
    }

    .result-content .icon.success svg { color: #22c55e; }
    .result-content .icon.fail svg { color: #ef4444; }

    .result-content .label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .result-content .label.success { color: #16a34a; }
    .result-content .label.fail { color: #dc2626; }

    .result-content .sub {
      font-size: 9px;
      color: #64748b;
      font-weight: 500;
    }
  `}</style>
);

// ... rest of imports and types remain the same ...
import ReactionButton, { type ReactionType } from "@/components/ReactionButton";
import ShareModal from "@/components/ShareModal";
import { moderateMedia, moderateText } from "@/lib/moderate";

type Comment = {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies?: { user: string; avatar: string; text: string; time: string }[];
};

type Post = {
  id: number;
  user: { name: string; avatar: string; role: string };
  content: string;
  media: { type: "image" | "video"; url: string } | null;
  reactions: Partial<Record<ReactionType, number>>;
  userReaction: ReactionType | null;
  comments: Comment[];
  shares: number;
  time: string;
};

type ScanStage = 
  | 'idle'
  | 'ocr'
  | 'extracting'
  | 'detecting'
  | 'checking'
  | 'finalizing'
  | 'approved'
  | 'failed';

const PASS_STAGES: ScanStage[] = [
  'ocr',
  'extracting',
  'detecting',
  'checking',
  'finalizing',
];

const STAGE_LABELS: Record<ScanStage, string> = {
  idle: 'Ready',
  ocr: 'OCR Analysis...',
  extracting: 'Extracting Text...',
  detecting: 'Detecting Sensitive Content...',
  checking: 'Checking Context...',
  finalizing: 'Final Decision...',
  approved: '✓ Approved',
  failed: '✕ Blocked'
};

const MOCK_USERS = [
  "Sarah Chen", "Marcus Johnson", "Emily Rodriguez", "David Kim",
  "Lisa Thompson", "Alex Wong", "Jessica Patel", "Kevin Martinez",
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

let commentIdCounter = 100;
function nextCommentId(): number { return ++commentIdCounter; }

function genComment(): Comment {
  const name = pick(MOCK_USERS);
  return {
    id: nextCommentId(),
    user: name,
    avatar: name.split(" ").map((n) => n[0]).join(""),
    text: pick(["Great post!", "Totally agree!", "Thanks for sharing!", "This is awesome!", "Love this!", "So true!"]),
    time: pick(["1m ago", "5m ago", "12m ago", "30m ago", "1h ago", "2h ago"]),
    likes: Math.floor(Math.random() * 15),
    liked: false,
    replies: Math.random() > 0.7
      ? [{ user: pick(MOCK_USERS), avatar: "U", text: pick(["True!", "Same!", "Exactly!"]), time: "Just now" }]
      : undefined,
  };
}

function genComments(count: number): Comment[] {
  return Array.from({ length: count }, () => genComment());
}

const PICS = [
  "https://picsum.photos/seed/project/800/400",
  "https://picsum.photos/seed/drone/800/400",
  "https://picsum.photos/seed/campus/800/400",
];

const INITIAL_POSTS: Post[] = [
  { id: 1, user: { name: "Sarah Chen", avatar: "SC", role: "Computer Science" }, content: "Just finished my final year project! 3 months of hard work finally paid off. Anyone else presenting this week?", media: { type: "image", url: PICS[0] }, reactions: { like: 28, love: 10, haha: 4 }, userReaction: null, comments: genComments(5), shares: 7, time: "2m ago" },
  { id: 2, user: { name: "Marcus Johnson", avatar: "MJ", role: "Business Admin" }, content: "Career fair next Thursday! Make sure to bring updated resumes and dress professionally. I heard Google and Microsoft will be there!", media: null, reactions: { like: 18, wow: 6, care: 4 }, userReaction: null, comments: genComments(3), shares: 15, time: "15m ago" },
  { id: 3, user: { name: "Emily Rodriguez", avatar: "ER", role: "Psychology" }, content: "Study group for tomorrow's exam in the library 3rd floor at 2pm. Bring your notes and questions!", media: null, reactions: { like: 25, love: 8, sad: 2 }, userReaction: null, comments: genComments(6), shares: 3, time: "1h ago" },
  { id: 4, user: { name: "David Kim", avatar: "DK", role: "Engineering" }, content: "The robotics club showcase was incredible today! Our autonomous drone project successfully completed its first outdoor flight test. So proud of the team!", media: { type: "image", url: PICS[1] }, reactions: { like: 40, love: 12, wow: 8, haha: 3, care: 2 }, userReaction: null, comments: genComments(8), shares: 22, time: "2h ago" },
  { id: 5, user: { name: "Lisa Thompson", avatar: "LT", role: "Design" }, content: "New design workshop starting next week! Learn UI/UX fundamentals with Figma. Limited spots available!", media: null, reactions: { like: 20, love: 7, wow: 4 }, userReaction: null, comments: genComments(2), shares: 9, time: "3h ago" },
];

// Text scanner - single layer with mask, no per-character spans
function TextScanner({ 
  text, 
  isScanning,
  direction,
  stage,
  showSuspicious
}: { 
  text: string; 
  isScanning: boolean;
  direction: number;
  stage: ScanStage;
  showSuspicious: boolean;
}) {
  return (
    <div className="scan-text-wrapper">
      <div className="scan-text-content">
        {/* Single text layer */}
        <div className="text-layer">
          {text.trim()}
        </div>

        {/* Highlight overlay with mask */}
        {isScanning && (
          <>
            <div className={`text-highlight ${direction === -1 ? 'text-highlight-reverse' : ''}`}>
              {text.trim()}
            </div>

            {/* Moving scanner unit */}
            <div className={`text-scanner ${direction === -1 ? 'text-scanner-reverse' : ''}`}>
              <div className="text-trail" />
              <div className="text-glow" />
              <div className="text-beam" />
              <div className="ocr-cursor" />
            </div>

            {/* Particles */}
            <div className="text-particles">
              <span className="text-particle">010</span>
              <span className="text-particle">101</span>
              <span className="text-particle">011</span>
              <span className="text-particle">110</span>
              <span className="text-particle">001</span>
            </div>

            {/* Suspicious region */}
            {showSuspicious && <div className="text-suspicious" />}
          </>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [postMedia, setPostMedia] = useState<{ type: "image" | "video"; url: string } | null>(null);
  const [moderating, setModerating] = useState(false);
  const [moderationResult, setModerationResult] = useState<{ safe: boolean; reason: string } | null>(null);
  const [textModerating, setTextModerating] = useState(false);
  const [textModerationResult, setTextModerationResult] = useState<{ safe: boolean; reason: string } | null>(null);
  const [sharePostId, setSharePostId] = useState<number | null>(null);
  const [scanDirection, setScanDirection] = useState(1);
  const [scanPass, setScanPass] = useState(0);
  const [textScanStage, setTextScanStage] = useState<ScanStage>('idle');
  const [mediaScanStage, setMediaScanStage] = useState<ScanStage>('idle');
  const [showSuspicious, setShowSuspicious] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suspiciousTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setPosts(INITIAL_POSTS); setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle text scanning pass changes
  useEffect(() => {
    if (!textModerating) {
      setScanPass(0);
      setScanDirection(1);
      setTextScanStage('idle');
      setShowSuspicious(false);
      if (textTimerRef.current) clearInterval(textTimerRef.current);
      return;
    }

    textTimerRef.current = setInterval(() => {
      setScanPass(prev => {
        const newPass = prev + 1;
        const stageIndex = newPass % PASS_STAGES.length;
        setTextScanStage(PASS_STAGES[stageIndex]);
        
        if (PASS_STAGES[stageIndex] === 'detecting') {
          setShowSuspicious(true);
          if (suspiciousTimerRef.current) clearTimeout(suspiciousTimerRef.current);
          suspiciousTimerRef.current = setTimeout(() => {
            setShowSuspicious(false);
          }, 900);
        }
        
        return newPass;
      });
      setScanDirection(prev => prev * -1);
    }, 1800);

    return () => {
      if (textTimerRef.current) clearInterval(textTimerRef.current);
      if (suspiciousTimerRef.current) clearTimeout(suspiciousTimerRef.current);
    };
  }, [textModerating]);

  // Handle media scanning pass changes
  useEffect(() => {
    if (!moderating) {
      setMediaScanStage('idle');
      if (mediaTimerRef.current) clearInterval(mediaTimerRef.current);
      return;
    }

    let pass = 0;
    mediaTimerRef.current = setInterval(() => {
      pass++;
      const stageIndex = pass % PASS_STAGES.length;
      setMediaScanStage(PASS_STAGES[stageIndex]);
      setScanDirection(prev => prev * -1);
    }, 1800);

    return () => {
      if (mediaTimerRef.current) clearInterval(mediaTimerRef.current);
    };
  }, [moderating]);

  const handleTextModeration = async (text: string): Promise<{ safe: boolean; reason: string }> => {
    const MIN_SCAN_TIME = 3600;

    setTextModerating(true);
    setScanPass(0);
    setScanDirection(1);
    setTextScanStage('ocr');
    setShowSuspicious(false);
    
    const start = performance.now();
    const moderationPromise = moderateText(text);
    
    const result = await moderationPromise;
    const elapsed = performance.now() - start;
    
    if (elapsed < MIN_SCAN_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_SCAN_TIME - elapsed));
    }
    
    setTextScanStage(result.safe ? 'approved' : 'failed');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setTextModerating(false);
    setTextScanStage('idle');
    setShowSuspicious(false);
    
    return result;
  };

  const handleMediaModeration = async (file: File, type: 'image' | 'video') => {
    const MIN_SCAN_TIME = 3600;

    setModerating(true);
    setModerationResult(null);
    setMediaScanStage('ocr');
    
    const start = performance.now();
    const moderationPromise = moderateMedia(file, type);
    
    const result = await moderationPromise;
    const elapsed = performance.now() - start;
    
    if (elapsed < MIN_SCAN_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_SCAN_TIME - elapsed));
    }
    
    setMediaScanStage(result.safe ? 'approved' : 'failed');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setModerationResult({ safe: result.safe, reason: result.reason });
    setModerating(false);
    setMediaScanStage('idle');
    
    return result;
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video");
    const mediaType = isVideo ? "video" : "image";
    setPostMedia({ type: mediaType, url: URL.createObjectURL(file) });
    await handleMediaModeration(file, mediaType);
    e.target.value = "";
  };

  const handlePost = async () => {
    if (!postText.trim() && !postMedia) return;
    if (moderating || (moderationResult && !moderationResult.safe)) return;
    
    if (postText.trim()) {
      const result = await handleTextModeration(postText);
      if (!result.safe) {
        setTextModerationResult({ safe: false, reason: result.reason });
        return;
      }
      setTextModerationResult({ safe: true, reason: "" });
      await new Promise(r => setTimeout(r, 800));
    }
    
    setPosts([{
      id: Date.now(),
      user: { name: "You", avatar: "U", role: "Student" },
      content: postText,
      media: postMedia,
      reactions: {},
      userReaction: null,
      comments: [],
      shares: 0,
      time: "Just now",
    }, ...posts]);
    setPostText("");
    setPostMedia(null);
    setModerationResult(null);
    setTextModerationResult(null);
  };

  const upsert = (id: number, fn: (p: Post) => Post) => setPosts((prev) => prev.map((p) => p.id === id ? fn(p) : p));

  const getStatusText = (stage: ScanStage): string => {
    return STAGE_LABELS[stage] || 'Processing...';
  };

  const getMediaStatusText = (stage: ScanStage): string => {
    return STAGE_LABELS[stage] || 'Processing...';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ScanStyles />
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight">Feed</h1>
        <div className="flex gap-1.5">
          <button className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-primary text-white shadow-sm">Latest</button>
          <button className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">Trending</button>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">U</div>
          <div className="flex-1 space-y-3">
            <div className="relative">
              {textModerating ? (
                <div className="text-sm text-base-content/80 leading-relaxed py-1 min-h-[60px]">
                  <TextScanner 
                    text={postText || "Hello World"} 
                    isScanning={true}
                    direction={scanDirection}
                    stage={textScanStage}
                    showSuspicious={showSuspicious}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-primary/10 flex items-center gap-3">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-base-content/70">
                        {getStatusText(textScanStage)}
                      </span>
                      <span className="text-[10px] font-mono text-primary/50 bg-primary/5 px-2 py-0.5 rounded">
                        Pass {scanPass + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={postText}
                  onChange={(e) => { setPostText(e.target.value); if (textModerationResult) setTextModerationResult(null); }}
                  placeholder="What's on your mind?"
                  rows={2}
                  className="w-full resize-none px-0 py-1 text-sm bg-transparent text-base-content outline-none placeholder:text-base-content/30 border-none"
                />
              )}
            </div>
            {postMedia && (
              <div className="relative rounded-xl overflow-hidden border border-base-200 max-h-48">
                {postMedia.type === "image" ? <img src={postMedia.url} alt="" className="w-full h-40 object-cover" /> : <video src={postMedia.url} className="w-full h-40 object-cover" controls />}
                <button onClick={() => { setPostMedia(null); setModerationResult(null); if (fileRef.current) fileRef.current.value = ""; }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {moderating && (
                  <div className="scan-container">
                    <div className="scan-noise" />
                    
                    {/* Single scanner unit */}
                    <div className={`scanner ${scanDirection === -1 ? 'scanner-reverse' : ''}`}>
                      <div className="trail-container">
                        <div className="trail" />
                        <div className={`scanned-grid ${scanDirection === -1 ? 'scanned-grid-reverse' : ''}`} />
                        <div className="scanned-edges" />
                        <div className={`pixel-reconstruct ${scanDirection === -1 ? 'pixel-reconstruct-reverse' : ''}`} />
                      </div>
                      <div className="beam-glow" />
                      <div className="beam" />
                    </div>

                    {mediaScanStage === 'detecting' && <div className="suspicious-pulse" />}
                    
                    <div className="particles">
                      <span className="particle">101</span>
                      <span className="particle">010</span>
                      <span className="particle">001</span>
                      <span className="particle">110</span>
                      <span className="particle">011</span>
                    </div>
                    
                    <div className="scan-status">
                      <div className="status-container">
                        <div className="spinner" />
                        <span className="status-text">{getMediaStatusText(mediaScanStage)}</span>
                        <span className="status-pass">Pass {Math.floor(scanPass / 2) + 1}</span>
                      </div>
                    </div>
                  </div>
                )}

                {!moderating && moderationResult && (
                  <div className={`result-overlay ${moderationResult.safe ? 'success' : 'fail'}`}>
                    <div className="result-content">
                      <div className={`icon ${moderationResult.safe ? 'success' : 'fail'}`}>
                        {moderationResult.safe ? (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className={`label ${moderationResult.safe ? 'success' : 'fail'}`}>
                        {moderationResult.safe ? 'APPROVED' : 'BLOCKED'}
                      </div>
                      <div className="sub">{moderationResult.reason}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!textModerating && textModerationResult && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium ${
                textModerationResult.safe 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {textModerationResult.safe ? (
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {textModerationResult.safe ? 'Approved' : `Failed — ${textModerationResult.reason || 'Sensitive text detected'}`}
              </div>
            )}
            <div className="flex items-center justify-between pt-2.5 border-t border-base-200">
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-base-200 text-base-content/60 hover:bg-base-300 transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Media
              </button>
              <button onClick={handlePost}
                disabled={(!postText.trim() && !postMedia) || moderating || textModerating || (moderationResult !== null && !moderationResult.safe)}
                className="px-5 py-1.5 text-sm font-bold rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-all shadow-sm"
              >
                {moderating || textModerating ? "Checking..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-loader" />
                <div className="space-y-2 flex-1"><div className="h-3 w-24 skeleton-loader" /><div className="h-2.5 w-16 skeleton-loader" /></div>
              </div>
              <div className="space-y-2"><div className="h-3 w-full skeleton-loader" /><div className="h-3 w-3/4 skeleton-loader" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={(t) => upsert(post.id, (p) => {
                const prev = p.userReaction;
                const r = { ...p.reactions };
                if (prev && r[prev]) { r[prev] = Math.max(0, (r[prev] || 1) - 1); if (r[prev] === 0) delete r[prev]; }
                if (t !== prev) r[t] = (r[t] || 0) + 1;
                return { ...p, reactions: r, userReaction: t === prev ? null : t };
              })}
              onAddComment={(text) => upsert(post.id, (p) => ({ ...p, comments: [...p.comments, { id: nextCommentId(), user: "You", avatar: "U", text, time: "Just now", likes: 0, liked: false }] }))}
              onLikeComment={(cid) => upsert(post.id, (p) => ({ ...p, comments: p.comments.map((c) => c.id === cid ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c) }))}
              onLoadMore={() => upsert(post.id, (p) => ({ ...p, comments: [...genComments(3), ...p.comments] }))}
              onShare={() => { setSharePostId(post.id); }}
            />
          ))}
        </div>
      )}

      <ShareModal visible={sharePostId !== null} onClose={() => setSharePostId(null)} onShare={() => { if (sharePostId) upsert(sharePostId, (p) => ({ ...p, shares: p.shares + 1 })); }} />
    </div>
  );
}

function PostCard({ post, onReact, onAddComment, onLikeComment, onLoadMore, onShare }: {
  post: Post;
  onReact: (t: ReactionType) => void;
  onAddComment: (text: string) => void;
  onLikeComment: (id: number) => void;
  onLoadMore: () => void;
  onShare: () => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + (b || 0), 0);

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
  };

  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base-content font-bold text-sm">{post.user.avatar}</div>
            <div>
              <p className="text-sm font-bold text-base-content">{post.user.name}</p>
              <p className="text-[11px] text-base-content/40">{post.user.role} &middot; {post.time}</p>
            </div>
          </div>
          <button className="text-base-content/20 hover:text-base-content/50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <p className="text-sm text-base-content/80 leading-relaxed mb-3">{post.content}</p>

        {post.media && (
          <div className="rounded-xl overflow-hidden border border-base-200 mb-3 -mx-1">
            {post.media.type === "image" ? (
              <img src={post.media.url} alt="" className="w-full max-h-96 object-cover" />
            ) : (
              <video src={post.media.url} className="w-full max-h-96" controls />
            )}
          </div>
        )}

        {(totalReactions > 0 || post.shares > 0 || post.comments.length > 0) && (
          <div className="flex items-center justify-between text-xs text-base-content/40 mb-2 px-0.5">
            <span>{totalReactions > 0 && `${totalReactions} reaction${totalReactions > 1 ? "s" : ""}`}</span>
            <div className="flex items-center gap-3">
              {post.comments.length > 0 && <span>{post.comments.length} comment{post.comments.length > 1 ? "s" : ""}</span>}
              {post.shares > 0 && <span>{post.shares} share{post.shares > 1 ? "s" : ""}</span>}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-base-200">
          <div className="flex items-center gap-4 sm:gap-6">
            <ReactionButton currentUserReaction={post.userReaction} reactionCounts={post.reactions} onReact={onReact} />
            <button onClick={() => setCommentsOpen(!commentsOpen)} className={`flex items-center gap-1.5 text-sm font-medium transition-all ${commentsOpen ? "text-accent" : "text-base-content/40 hover:text-accent"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </button>
            <button onClick={onShare} className="flex items-center gap-1.5 text-sm font-medium text-base-content/40 hover:text-accent transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </div>

      {commentsOpen && (
        <div className="border-t border-base-200 bg-base-200/20">
          {post.comments.length > 5 && (
            <button onClick={onLoadMore} className="w-full px-5 py-2 text-xs font-semibold text-primary hover:bg-base-200/50 transition-colors">
              Load more comments
            </button>
          )}

          <div ref={scrollRef} className="overflow-y-auto max-h-72 px-4 sm:px-5 py-3 space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-xs text-base-content/30 text-center py-4">No comments yet</p>
            ) : (
              post.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base-content font-bold text-[10px] shrink-0 mt-0.5">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-base-100 rounded-2xl px-3.5 py-2.5 border border-base-200">
                      <p className="text-xs font-bold text-base-content">{c.user}</p>
                      <p className="text-xs text-base-content/70 mt-0.5 leading-relaxed">{c.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1.5">
                      <span className="text-[10px] text-base-content/30">{c.time}</span>
                      <button onClick={() => onLikeComment(c.id)} className={`text-[10px] font-semibold transition-colors ${c.liked ? "text-primary" : "text-base-content/30 hover:text-base-content/50"}`}>
                        {c.likes > 0 ? `${c.likes} like${c.likes > 1 ? "s" : ""}` : "Like"}
                      </button>
                    </div>
                    {c.replies && c.replies.length > 0 && (
                      <div className="ml-3 mt-2 space-y-2 border-l-2 border-base-200 pl-3">
                        {c.replies.map((r, i) => (
                          <div key={i} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-base-200 flex items-center justify-center text-base-content/50 font-bold text-[8px] shrink-0">{r.avatar}</div>
                            <div>
                              <div className="bg-base-100 rounded-xl px-2.5 py-1.5 border border-base-200">
                                <p className="text-[11px] font-bold text-base-content">{r.user}</p>
                                <p className="text-[11px] text-base-content/70">{r.text}</p>
                              </div>
                              <p className="text-[9px] text-base-content/30 mt-0.5 ml-1">{r.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 sm:px-5 py-3 border-t border-base-200 bg-base-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">U</div>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                className="flex-1 px-4 py-2 text-sm rounded-full border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
              />
              <button onClick={submitComment} disabled={!commentText.trim()} className="w-9 h-9 rounded-full bg-primary text-white disabled:opacity-30 hover:bg-primary/90 transition-all flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}