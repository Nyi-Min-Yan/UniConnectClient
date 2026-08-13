"use client";

import { useState, useRef, type DragEvent } from "react";

type Attachment = { name: string; size: string };

type ComposeModalProps = {
  visible: boolean;
  onClose: () => void;
  onSend: (data: { to: string; cc: string; bcc: string; subject: string; body: string; attachments: Attachment[] }) => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  mode?: "compose" | "reply" | "replyAll" | "forward";
};

export default function ComposeModal({ visible, onClose, onSend, initialTo, initialSubject, initialBody, mode = "compose" }: ComposeModalProps) {
  const [to, setTo] = useState(initialTo || "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initialSubject || "");
  const [body, setBody] = useState(initialBody || "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) return;
    onSend({ to, cc, bcc, subject, body, attachments });
    handleDiscard();
  };

  const handleDiscard = () => {
    setTo(initialTo || "");
    setCc("");
    setBcc("");
    setSubject(initialSubject || "");
    setBody(initialBody || "");
    setAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    onClose();
  };

  const addFiles = (files: FileList) => {
    const newFiles: Attachment[] = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const removeAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  };

  const charCount = body.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDiscard} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
          <h2 className="text-sm font-bold text-base-content">
            {mode === "reply" ? "Reply" : mode === "replyAll" ? "Reply All" : mode === "forward" ? "Forward" : "New Message"}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-3 py-1.5 text-xs font-medium rounded-lg text-base-content/60 hover:bg-base-200 transition-colors">
              Save Draft
            </button>
            <button onClick={handleDiscard} className="w-8 h-8 rounded-full hover:bg-base-200 flex items-center justify-center text-base-content/40 hover:text-base-content transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To *" className="w-full px-0 py-2 text-sm border-b border-base-200 bg-transparent text-base-content outline-none focus:border-primary placeholder:text-base-content/30" />
          </div>
          {showCc && (
            <div>
              <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Cc" className="w-full px-0 py-2 text-sm border-b border-base-200 bg-transparent text-base-content outline-none focus:border-primary placeholder:text-base-content/30" />
            </div>
          )}
          {showBcc && (
            <div>
              <input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Bcc" className="w-full px-0 py-2 text-sm border-b border-base-200 bg-transparent text-base-content outline-none focus:border-primary placeholder:text-base-content/30" />
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-base-content/40">
            {!showCc && <button onClick={() => setShowCc(true)} className="hover:text-primary transition-colors">Add Cc</button>}
            {!showBcc && <button onClick={() => setShowBcc(true)} className="hover:text-primary transition-colors">Add Bcc</button>}
          </div>
          <div>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject *" className="w-full px-0 py-2 text-sm border-b border-base-200 bg-transparent text-base-content outline-none focus:border-primary placeholder:text-base-content/30" />
          </div>
          <div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={8} className="w-full px-0 py-2 text-sm bg-transparent text-base-content outline-none resize-none placeholder:text-base-content/30 min-h-[120px]" />
            <div className="text-right text-[10px] text-base-content/30">{charCount} characters</div>
          </div>

          {/* Attachments */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-base-200 hover:border-base-300"}`}
          >
            <svg className="w-6 h-6 mx-auto mb-1 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <p className="text-xs text-base-content/40">Drag & drop files or click to browse</p>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((a) => (
                <div key={a.name} className="flex items-center justify-between px-3 py-2 bg-base-200/50 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 shrink-0 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-xs text-base-content/70 truncate">{a.name}</span>
                    <span className="text-[10px] text-base-content/30">{a.size}</span>
                  </div>
                  <button onClick={() => removeAttachment(a.name)} className="text-base-content/20 hover:text-error transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-base-200 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="text-base-content/30 hover:text-primary transition-colors" title="Attach files">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-4 py-2 text-xs font-medium rounded-xl text-base-content/60 hover:bg-base-200 transition-colors">
              Discard
            </button>
            <button onClick={handleSend} disabled={!to.trim() || !subject.trim()} className="px-6 py-2 text-xs font-bold rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
