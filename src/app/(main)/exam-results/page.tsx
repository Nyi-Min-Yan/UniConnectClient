"use client";

import { useState, useRef } from "react";
import { STUDENTS, extractRollNoFromFilename, findStudentByRollNo, extractNamesFromFilename, findStudentByName, getStudentsByYear, getYearBySemester, YEAR_LABELS, getLibraryStatus } from "@/lib/data";
import BackButton from "@/components/BackButton";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type UploadedFile = {
  id: number;
  fileName: string;
  fileSize: number;
  rollNo: string | null;
  matchedStudent: { id: number; name: string; semester: number } | null;
  matchMethod: "roll" | "name" | null;
  status: "pending" | "matched" | "unmatched" | "sent";
};

type Tab = "upload" | "students";

type ResultStatus = "received" | "pending" | "unavailable";

export default function ExamResultsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [yearFilter, setYearFilter] = useState<number>(1);
  const [uploadYearFilter, setUploadYearFilter] = useState<number>(0);
  const [libraryFilter, setLibraryFilter] = useState<"all" | "clear" | "hold">("all");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [confirmSend, setConfirmSend] = useState(false);
  const [tab, setTab] = useState<Tab>("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const unmatched = files.filter((f) => f.status === "unmatched");
  const matchedCount = files.filter((f) => f.status === "matched").length;
  const sentCount = files.filter((f) => f.status === "sent").length;
  const totalFiles = files.length;

  const processFiles = (fileList: FileList) => {
    let replaceCount = 0;
    let addCount = 0;
    const yearPool = uploadYearFilter === 0 ? STUDENTS : getStudentsByYear(uploadYearFilter);
    setFiles((prev) => {
      const working = [...prev];
      Array.from(fileList).forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".pdf")) return;
        const rollNo = extractRollNoFromFilename(file.name);
        let matchedStudent: UploadedFile["matchedStudent"] = null;
        let matchMethod: UploadedFile["matchMethod"] = null;
        let status: UploadedFile["status"] = "unmatched";
        if (rollNo) {
          const s = yearPool.find((st) => st.rollNo === rollNo);
          if (s) { matchedStudent = { id: s.id, name: s.name, semester: s.semester }; matchMethod = "roll"; status = "matched"; }
        }
        if (!matchedStudent) {
          const names = extractNamesFromFilename(file.name);
          if (names.length > 0) {
            const byName = yearPool.filter(
              (st) => st.name.toLowerCase().includes(names[0].toLowerCase()) || names[0].toLowerCase().includes(st.name.toLowerCase().split(" ")[0])
            );
            if (byName.length > 0) {
              const s = byName[0];
              matchedStudent = { id: s.id, name: s.name, semester: s.semester };
              matchMethod = "name";
              status = "matched";
            }
          }
        }
        const newFile: UploadedFile = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          fileName: file.name, fileSize: file.size, rollNo: rollNo || null,
          matchedStudent, matchMethod, status,
        };
        const dupIdx = working.findIndex((f) => f.rollNo === newFile.rollNo && f.fileSize === newFile.fileSize);
        if (dupIdx !== -1) { working[dupIdx] = { ...newFile, id: working[dupIdx].id, status: working[dupIdx].status === "sent" ? "sent" : newFile.status }; replaceCount++; }
        else { working.push(newFile); addCount++; }
      });
      return working;
    });
    setTimeout(() => {
      if (replaceCount > 0 || addCount > 0) setToast({ visible: true, message: replaceCount > 0 ? `${replaceCount} replaced, ${addCount} new` : `${addCount} added`, type: "success" });
    }, 100);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.length) { processFiles(e.target.files); e.target.value = ""; } };
  const removeFile = (id: number) => setFiles((p) => p.filter((f) => f.id !== id));

  const getResultStatus = (rollNo: string): ResultStatus => {
    const match = files.find((f) => f.rollNo === rollNo);
    if (!match) return "unavailable";
    if (match.status === "sent") return "received";
    return "pending";
  };

  const canSendTo = (rollNo: string): { ok: boolean; reason?: string } => {
    const lib = getLibraryStatus(rollNo);
    if (lib.hasOverdueBooks) return { ok: false, reason: `${lib.overdueCount} overdue book${lib.overdueCount > 1 ? "s" : ""}` };
    return { ok: true };
  };

  const sendSingle = (fileId: number) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.rollNo) {
      const check = canSendTo(file.rollNo);
      if (!check.ok) { setToast({ visible: true, message: `Cannot send — ${file.matchedStudent?.name} has ${check.reason}`, type: "error" }); return; }
    }
    setFiles((p) => p.map((f) => f.id === fileId && f.status === "matched" ? { ...f, status: "sent" as const } : f));
    setToast({ visible: true, message: "Exam result sent!", type: "success" });
  };

  const sendAll = async () => {
    const blocked: string[] = [];
    for (const f of files) {
      if (f.status === "matched" && f.rollNo) {
        const check = canSendTo(f.rollNo);
        if (!check.ok) blocked.push(f.matchedStudent?.name || f.rollNo);
      }
    }
    if (blocked.length > 0) {
      setToast({ visible: true, message: `${blocked.length} student${blocked.length > 1 ? "s" : ""} blocked by library hold`, type: "error" });
      setConfirmSend(false); setSending(false); return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setFiles((p) => p.map((f) => f.status === "matched" ? { ...f, status: "sent" as const } : f));
    setSending(false); setConfirmSend(false);
    setToast({ visible: true, message: `${matchedCount} sent to students!`, type: "success" });
  };

  const progressPct = totalFiles > 0 ? Math.round((sentCount / totalFiles) * 100) : 0;
  const matchedPct = totalFiles > 0 ? Math.round(((matchedCount + sentCount) / totalFiles) * 100) : 0;

  const yearStudents = getStudentsByYear(yearFilter).filter((s) => {
    if (libraryFilter === "clear") return !getLibraryStatus(s.rollNo).hasOverdueBooks;
    if (libraryFilter === "hold") return getLibraryStatus(s.rollNo).hasOverdueBooks;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-xl sm:text-2xl font-bold">Exam Results</h1>
            </div>
            <p className="text-white/70 text-sm mt-0.5">Upload, match &amp; deliver to students</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
            <p className="text-2xl font-bold">{sentCount}</p>
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Sent</p>
          </div>
        </div>
        {totalFiles > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-bold">{totalFiles}</p>
              <p className="text-[10px] text-white/60 uppercase">Total</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-bold text-green-200">{matchedCount}</p>
              <p className="text-[10px] text-white/60 uppercase">Matched</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-bold text-red-200">{unmatched.length}</p>
              <p className="text-[10px] text-white/60 uppercase">Unmatched</p>
            </div>
          </div>
        )}
        {totalFiles > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span>Delivery progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("upload")} className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${tab === "upload" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Upload
          </span>
        </button>
        <button onClick={() => setTab("students")} className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${tab === "students" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
            Students
          </span>
        </button>
      </div>

      {tab === "upload" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="text-sm font-bold text-base-content flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  Upload PDFs
                </h2>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setUploadYearFilter(0); }} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${uploadYearFilter === 0 ? "bg-primary text-white shadow-sm" : "bg-base-200 text-base-content/50 hover:bg-base-300"}`}>All</button>
                  {[1, 2, 3, 4].map((y) => (
                    <button key={y} onClick={(e) => { e.stopPropagation(); setUploadYearFilter(y); }} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${uploadYearFilter === y ? "bg-primary text-white shadow-sm" : "bg-base-200 text-base-content/50 hover:bg-base-300"}`}>{YEAR_LABELS[y].replace(" Year", "")}</button>
                  ))}
                </div>
              </div>
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all overflow-hidden ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-base-200 hover:border-primary/50 hover:bg-base-200/30"}`}>
                <input ref={fileRef} type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" />
                {dragOver && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
                <div className={`transition-transform duration-200 ${dragOver ? "scale-110" : ""}`}>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-base-content">Drop PDFs here or <span className="text-primary">browse</span></p>
                  <p className="text-xs text-base-content/40 mt-1">Name files with roll number (xxxx) or student name</p>
                  {uploadYearFilter > 0 && <p className="text-[10px] text-primary font-medium mt-2">Matching against {YEAR_LABELS[uploadYearFilter]} students only</p>}
                </div>
              </div>
            </div>

            {totalFiles > 0 && (
              <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between bg-base-200/20">
                  <h2 className="text-sm font-bold text-base-content flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Files <span className="text-xs font-normal text-base-content/40 ml-1">({totalFiles})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-base-200 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${matchedPct}%` }} />
                    </div>
                    <span className="text-xs text-green-600 font-semibold">{matchedCount + sentCount}/{totalFiles} matched</span>
                  </div>
                </div>
                <div className="divide-y divide-base-200 max-h-80 overflow-y-auto">
                  {[...files].reverse().map((file) => (
                    <div key={file.id} className={`flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-base-200/30 ${file.status === "sent" ? "opacity-60" : ""}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${file.status === "sent" ? "bg-green-100 text-green-600" : file.status === "matched" ? "bg-primary/10 text-primary" : "bg-red-50 text-red-400"}`}>
                        {file.status === "sent" ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-base-content truncate">{file.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {file.rollNo ? <span className="text-[10px] font-mono bg-base-200 px-1.5 py-0.5 rounded text-base-content/60">{file.rollNo}</span> : <span className="text-[10px] text-red-400 font-medium">No roll#</span>}
                          {file.matchedStudent ? <><span className={`text-[10px] font-medium ${file.matchMethod === "roll" ? "text-green-600" : "text-blue-600"}`}>{file.matchedStudent.name}</span><span className="text-[8px] text-base-content/30 uppercase">({file.matchMethod})</span></> : file.rollNo ? <span className="text-[10px] text-red-400">Not found</span> : <span className="text-[10px] text-red-400">No match</span>}
                          {file.fileSize > 0 && <span className="text-[9px] text-base-content/30">{formatSize(file.fileSize)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.status === "matched" && (() => {
                          const check = file.rollNo ? canSendTo(file.rollNo) : { ok: true };
                          return (
                            <button onClick={() => sendSingle(file.id)} disabled={sending || !check.ok} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all shadow-sm flex items-center gap-1 ${check.ok ? "bg-primary text-white hover:bg-primary/90" : "bg-red-100 text-red-500 cursor-not-allowed"}`} title={!check.ok ? `Library hold: ${check.reason}` : ""}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
                              {check.ok ? "Send" : "Blocked"}
                            </button>
                          );
                        })()}
                        {file.status === "sent" && <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-green-100 text-green-700 flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Sent</span>}
                        {file.status !== "sent" && <button onClick={() => removeFile(file.id)} className="p-1.5 rounded-lg text-base-content/20 hover:text-red-500 hover:bg-red-50 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>}
                      </div>
                    </div>
                  ))}
                </div>
                {matchedCount > 0 && (
                  <div className="p-4 border-t border-base-200 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-base-content/50 hidden sm:block"><span className="font-semibold text-base-content">{matchedCount}</span> result{matchedCount > 1 ? "s" : ""} ready</p>
                      <button onClick={() => {
                        const blocked = files.filter((f) => f.status === "matched" && f.rollNo && !canSendTo(f.rollNo).ok);
                        if (blocked.length > 0) { setToast({ visible: true, message: `${blocked.length} student${blocked.length > 1 ? "s" : ""} blocked by library hold — remove or resolve`, type: "error" }); return; }
                        setConfirmSend(true);
                      }} disabled={sending} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 flex items-center justify-center gap-2">
                        {sending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>Send All ({matchedCount})</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-base-content mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Academic Year</label>
                  <div className="relative">
                    <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm font-medium text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
                      {["2024-2025", "2025-2026", "2026-2027"].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((y) => (
                  <button key={y} onClick={() => setYearFilter(y)} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${yearFilter === y ? "bg-primary text-white shadow-sm" : "bg-base-200 text-base-content/60 hover:bg-base-300"}`}>
                    {YEAR_LABELS[y]}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(["all", "clear", "hold"] as const).map((f) => (
                  <button key={f} onClick={() => setLibraryFilter(f)} className={`px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all ${libraryFilter === f ? "bg-base-content text-base-100" : "bg-base-200 text-base-content/50 hover:bg-base-300"}`}>
                    {f === "all" ? "All" : f === "clear" ? "Library Clear" : "Library Hold"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-base-content">{YEAR_LABELS[yearFilter]} &middot; {yearStudents.length} students</h2>
              <span className="text-xs text-base-content/40">
                {yearStudents.filter((s) => getResultStatus(s.rollNo) === "received").length} received &middot; {yearStudents.filter((s) => getLibraryStatus(s.rollNo).hasOverdueBooks).length} library hold
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3 text-center">Sem</th>
                    <th className="px-4 py-3 text-center">Result</th>
                    <th className="px-4 py-3 text-center">Library</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {yearStudents.map((s) => {
                    const lib = getLibraryStatus(s.rollNo);
                    const rStatus = getResultStatus(s.rollNo);
                    return (
                      <tr key={s.id} className={`hover:bg-base-200/30 transition-colors ${lib.hasOverdueBooks ? "bg-red-50/40" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base-content font-bold text-[10px]">
                              {s.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="font-semibold text-base-content text-sm">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-base-content/60">{s.rollNo}</td>
                        <td className="px-4 py-3 text-center text-xs text-base-content/50">{s.semester}</td>
                        <td className="px-4 py-3 text-center">
                          {rStatus === "received" && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Received</span>}
                          {rStatus === "pending" && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Pending</span>}
                          {rStatus === "unavailable" && <span className="text-[10px] font-medium bg-base-200 text-base-content/40 px-2.5 py-1 rounded-full">Unavailable</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lib.hasOverdueBooks ? (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full flex items-center gap-1 justify-center">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                              {lib.overdueCount} overdue
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-green-600 flex items-center gap-1 justify-center">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Clear
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <ConfirmModal title="Send Exam Results" message={`Send ${matchedCount} result${matchedCount > 1 ? "s" : ""} to matched students?`} confirmLabel="Send All" danger={false} visible={confirmSend} onConfirm={sendAll} onCancel={() => setConfirmSend(false)} />
    </div>
  );
}
