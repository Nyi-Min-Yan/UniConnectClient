"use client";

import { useState, useRef } from "react";
import { STUDENTS, extractRollNoFromFilename, findStudentByRollNo, extractNamesFromFilename, findStudentByName } from "@/lib/data";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

type UploadedFile = {
  id: number;
  fileName: string;
  rollNo: string | null;
  matchedStudent: { id: number; name: string; semester: number } | null;
  matchMethod: "roll" | "name" | null;
  status: "pending" | "matched" | "unmatched" | "sent";
};

export default function ExamResultsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState("2025-2026");
  const [dragOver, setDragOver] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [confirmSend, setConfirmSend] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingFiles = files.filter((f) => f.status !== "sent");
  const matchedCount = files.filter((f) => f.status === "matched").length;
  const sentCount = files.filter((f) => f.status === "sent").length;

  const processFiles = (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    let nextId = files.length + 1;

    Array.from(fileList).forEach((file) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) return;
      const rollNo = extractRollNoFromFilename(file.name);
      let matchedStudent: UploadedFile["matchedStudent"] = null;
      let matchMethod: UploadedFile["matchMethod"] = null;
      let status: UploadedFile["status"] = "unmatched";

      if (rollNo) {
        const student = findStudentByRollNo(rollNo);
        if (student) {
          matchedStudent = { id: student.id, name: student.name, semester: student.semester };
          matchMethod = "roll";
          status = "matched";
        }
      }

      if (!matchedStudent) {
        const names = extractNamesFromFilename(file.name);
        if (names.length > 0) {
          const byName = findStudentByName(names[0]);
          if (byName.length > 0) {
            const s = byName[0];
            matchedStudent = { id: s.id, name: s.name, semester: s.semester };
            matchMethod = "name";
            status = "matched";
          }
        }
      }

      newFiles.push({
        id: nextId++,
        fileName: file.name,
        rollNo: rollNo || null,
        matchedStudent,
        matchMethod,
        status,
      });
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeFile = (id: number) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const sendAll = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "matched"
          ? { ...f, status: "sent" as const }
          : f
      )
    );
    setSending(false);
    setConfirmSend(false);
    setToast({ visible: true, message: `${matchedCount} exam results sent to students!`, type: "success" });
  };

  const sendSingle = async (fileId: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId && f.status === "matched"
          ? { ...f, status: "sent" as const }
          : f
      )
    );
    setToast({ visible: true, message: "Exam result sent!", type: "success" });
  };

  const studentsBySemester = STUDENTS.filter((s) => s.semester === semester);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Exam Results</h1>
          <p className="text-sm text-base-content/50 mt-0.5">Upload PDFs, auto-match by roll number, send to students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-base-content mb-3">Upload Exam Result PDFs</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-base-200 hover:border-primary/50 hover:bg-base-200/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg className="w-10 h-10 mx-auto mb-2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-base-content/60">
                Drop PDF files here or click to browse
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                Name files with roll number (<span className="font-mono">xxxx</span>) or student name
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-base-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-base-content">
                  Uploaded Files ({files.length})
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 font-medium">{matchedCount} matched</span>
                  <span className="text-primary font-medium">{sentCount} sent</span>
                  {files.filter((f) => f.status === "unmatched").length > 0 && (
                    <span className="text-red-500 font-medium">
                      {files.filter((f) => f.status === "unmatched").length} unmatched
                    </span>
                  )}
                </div>
              </div>
              <div className="divide-y divide-base-200 max-h-80 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={file.id} className={`flex items-center gap-3 px-4 py-3 text-sm ${file.status === "sent" ? "opacity-60" : ""}`}>
                    <span className="text-base-content/30 w-5 text-right">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base-content font-medium truncate">{file.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {file.rollNo ? (
                          <span className="text-[10px] font-mono bg-base-200 px-1.5 py-0.5 rounded text-base-content/60">{file.rollNo}</span>
                        ) : (
                          <span className="text-[10px] text-red-400">No roll# in name</span>
                        )}
                        {file.matchedStudent ? (
                          <>
                            <span className={`text-[10px] ${file.matchMethod === "roll" ? "text-green-600" : "text-blue-600"}`}>
                              {file.matchedStudent.name}
                            </span>
                            <span className="text-[9px] text-base-content/30 uppercase">
                              ({file.matchMethod === "roll" ? "roll" : "name"})
                            </span>
                          </>
                        ) : file.rollNo ? (
                          <span className="text-[10px] text-red-400">Student not found</span>
                        ) : (
                          <span className="text-[10px] text-red-400">No match</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {file.status === "matched" && (
                        <button
                          onClick={() => sendSingle(file.id)}
                          disabled={sending}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          Send
                        </button>
                      )}
                      {file.status === "sent" && (
                        <span className="text-[10px] text-green-600 font-medium">Sent</span>
                      )}
                      {file.status !== "sent" && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-base-content/30 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {matchedCount > 0 && (
                <div className="p-4 border-t border-base-200 bg-base-200/30">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConfirmSend(true)}
                      disabled={sending}
                      className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                          </svg>
                          Send All ({matchedCount})
                        </>
                      )}
                    </button>
                    <p className="text-xs text-base-content/40">
                      Matched results will be sent to each student&apos;s inbox
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm font-bold text-base-content mb-3">Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {["2024-2025", "2025-2026", "2026-2027"].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
            <h2 className="text-sm font-bold text-base-content mb-3">Students in Sem {semester}</h2>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {studentsBySemester.map((s) => (
                <div key={s.id} className="flex items-center gap-2 py-1.5 text-xs">
                  <span className="font-mono text-base-content/50 w-24">{s.rollNo}</span>
                  <span className="text-base-content truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((p) => ({ ...p, visible: false }))}
      />
      <ConfirmModal
        title="Send Exam Results"
        message={`This will send ${matchedCount} exam result PDF${matchedCount > 1 ? "s" : ""} to the matched students. Continue?`}
        confirmLabel="Send All"
        danger={false}
        visible={confirmSend}
        onConfirm={sendAll}
        onCancel={() => setConfirmSend(false)}
      />
    </div>
  );
}
