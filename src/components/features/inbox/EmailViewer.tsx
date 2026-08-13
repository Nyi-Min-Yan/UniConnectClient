"use client";

import type { Email } from "./types";

type EmailViewerProps = {
  email: Email;
  onBack: () => void;
  onReply: (email: Email) => void;
  onReplyAll: (email: Email) => void;
  onForward: (email: Email) => void;
  onDelete: (id: number) => void;
};

export default function EmailViewer({ email, onBack, onReply, onReplyAll, onForward, onDelete }: EmailViewerProps) {
  return (
    <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm animate-fade-in-up flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => onReply(email)} className="p-2 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors" title="Reply">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={() => onReplyAll(email)} className="p-2 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors" title="Reply All">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6m5 0l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={() => onForward(email)} className="p-2 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-base-content transition-colors" title="Forward">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <span className="w-px h-5 bg-base-200 mx-1" />
          <button onClick={() => onDelete(email.id)} className="p-2 rounded-lg hover:bg-base-200 text-base-content/50 hover:text-error transition-colors" title="Delete">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {email.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-base-content">{email.from}</p>
                {email.to && <p className="text-xs text-base-content/40 mt-0.5">to {email.to}</p>}
              </div>
              <span className="text-[10px] text-base-content/40 shrink-0">{email.time}</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-base-content">{email.subject}</h2>

        {/* Cc / Bcc */}
        {email.cc && email.cc.length > 0 && (
          <p className="text-xs text-base-content/40">Cc: {email.cc.join(", ")}</p>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((a) => (
              <div key={a.name} className="flex items-center gap-2 px-3 py-2 bg-base-200/50 rounded-xl text-xs">
                <svg className="w-4 h-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-base-content/70">{a.name}</span>
                <span className="text-base-content/30">({a.size})</span>
                <button className="ml-1 text-base-content/20 hover:text-primary transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
          {email.body}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-4 py-3 border-t border-base-200 flex items-center gap-2 shrink-0">
        <button onClick={() => onReply(email)} className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          Reply
        </button>
        <button onClick={() => onReplyAll(email)} className="px-4 py-2 text-sm font-medium rounded-xl bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">
          Reply All
        </button>
        <button onClick={() => onForward(email)} className="px-4 py-2 text-sm font-medium rounded-xl bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">
          Forward
        </button>
        <div className="flex-1" />
        <button onClick={() => onDelete(email.id)} className="px-4 py-2 text-sm font-medium rounded-xl text-error hover:bg-error/5 transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete
        </button>
      </div>
    </div>
  );
}
