"use client";

import { useState, useRef } from "react";
import { useSWRConfig } from "swr";
import { apiClient } from "@/lib/axios";
import {
  useAcademicTerms,
  useActiveTerm,
  useExamTypes,
  useSemesters,
  useResultBatches,
  useResultDocuments,
} from "@/hooks/useAcademic";
import BackButton from "@/components/ui/BackButton";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

type UploadSummary = {
  batchId: string;
  totalFiles: number;
  matchedFiles: number;
  unmatchedFiles: number;
  insertedDocuments: number;
  updatedDocuments: number;
  failedFiles: number;
  skippedFiles: number;
  unmatchedFileNames: string[];
  failedFileNames: string[];
  skippedFileNames: string[];
};

type ToastState = { visible: boolean; message: string; type: "success" | "error" };

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
    if (res) {
      const status = res.status;
      if (status === 400) return res.data?.message || "Bad request — check the selected term, exam type and semester.";
      if (status === 401) return "Session expired — please log in again.";
      if (status === 403) return "Permission denied — only staff with exam access can do this.";
      if (status === 404) return "Resource not found.";
      if (status === 409) return "Conflict — the resource already exists.";
      if (status === 413) return "File too large (max 20MB per file, 200MB per upload).";
      if (status !== undefined && status >= 500) return "Server error — please try again later.";
      return res.data?.message || `Request failed (${status}).`;
    }
  }
  return "Network error — backend unavailable.";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function ExamResultsPage() {
  const { mutate } = useSWRConfig();
  const { terms } = useAcademicTerms();
  const { activeTerm } = useActiveTerm();
  const { examTypes } = useExamTypes();
  const { semesters } = useSemesters();

  const [termId, setTermId] = useState<string>("");
  const [examTypeId, setExamTypeId] = useState<string>("");
  const [semesterId, setSemesterId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "success" });
  const fileRef = useRef<HTMLInputElement>(null);

  const effectiveTermId = termId || activeTerm?.termId || terms?.[0]?.termId || "";
  const effectiveExamTypeId = examTypeId || examTypes?.[0]?.examTypeId || "";
  const effectiveSemesterId = semesterId || semesters?.[0]?.semesterId || "";

  const { batches, isLoading: batchesLoading } = useResultBatches(
    effectiveTermId || undefined,
    effectiveSemesterId || undefined,
    effectiveExamTypeId || undefined
  );
  const batchId = selectedBatchId || batches?.[0]?.batchId || "";
  const { documents, isLoading: documentsLoading } = useResultDocuments(batchId || null);
  const selectedBatch = batches?.find((b: any) => b.batchId === batchId) || null;

  const refresh = () => {
    mutate((key) => typeof key === "string" && key.startsWith("/api/result-batches"));
    mutate((key) => typeof key === "string" && key.startsWith("/api/result-documents"));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const pdfs = Array.from(e.target.files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
      setFiles((prev) => {
        const seen = new Set(prev.map((f) => f.name));
        return [...prev, ...pdfs.filter((f) => !seen.has(f.name))];
      });
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const pdfs = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
      setFiles((prev) => {
        const seen = new Set(prev.map((f) => f.name));
        return [...prev, ...pdfs.filter((f) => !seen.has(f.name))];
      });
    }
  };

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const upload = async () => {
    if (files.length === 0) return;
    if (!effectiveTermId || !effectiveExamTypeId || !effectiveSemesterId) {
      setError("Select an academic term, exam type and semester before uploading.");
      return;
    }
    setError(null);
    setSummary(null);
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("termId", effectiveTermId);
      formData.append("examTypeId", effectiveExamTypeId);
      formData.append("semesterId", effectiveSemesterId);
      files.forEach((f) => formData.append("files", f, f.name));
      const { data } = await apiClient.post("/api/result-batches", formData, {
        headers: { "Content-Type": undefined },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setSummary(data as UploadSummary);
      setSelectedBatchId(data.batchId);
      setFiles([]);
      refresh();
      setToast({ visible: true, message: "Upload complete — batch updated", type: "success" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const publish = async () => {
    if (!batchId) return;
    setPublishing(true);
    setError(null);
    try {
      await apiClient.post(`/api/result-batches/${batchId}/publish`);
      setConfirmPublish(false);
      refresh();
      setToast({ visible: true, message: "Batch published to students", type: "success" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const termLabel = (id: string) => {
    const t = terms?.find((x: any) => x.termId === id);
    return t ? `${t.academicYear}` : "Term";
  };

  const ready = Boolean(effectiveTermId && effectiveExamTypeId && effectiveSemesterId);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-xl sm:text-2xl font-bold">Exam Results</h1>
            </div>
            <p className="text-white/70 text-sm mt-0.5">
              Upload PDFs matched by roll number &middot; re-upload to the same batch &middot; publish
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
            <p className="text-2xl font-bold">{batches?.length ?? 0}</p>
            <p className="text-[10px] text-white/70 uppercase tracking-wider">Batches</p>
          </div>
        </div>
        {summary && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold">{summary.totalFiles}</p>
              <p className="text-[10px] text-white/60 uppercase">Files</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-green-200">{summary.matchedFiles}</p>
              <p className="text-[10px] text-white/60 uppercase">Matched</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-red-200">{summary.unmatchedFiles + summary.failedFiles}</p>
              <p className="text-[10px] text-white/60 uppercase">Unmatched</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-200">{summary.insertedDocuments}</p>
              <p className="text-[10px] text-white/60 uppercase">Inserted</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-bold text-amber-200">{summary.updatedDocuments}</p>
              <p className="text-[10px] text-white/60 uppercase">Updated</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-2xl px-4 py-3 text-sm text-error font-medium">
          {error}
        </div>
      )}

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Academic Term</label>
            <select
              value={effectiveTermId}
              onChange={(e) => { setTermId(e.target.value); setSelectedBatchId(""); setSummary(null); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {!terms?.length && <option value="">Loading terms...</option>}
              {terms?.map((t: any) => (
                <option key={t.termId} value={t.termId}>
                  {t.academicYear} {t.status === "ACTIVE" ? "(active)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Exam Type</label>
            <select
              value={effectiveExamTypeId}
              onChange={(e) => { setExamTypeId(e.target.value); setSelectedBatchId(""); setSummary(null); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {!examTypes?.length && <option value="">Loading exam types...</option>}
              {examTypes?.map((t: any) => (
                <option key={t.examTypeId} value={t.examTypeId}>{t.examTypeName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Semester</label>
            <select
              value={effectiveSemesterId}
              onChange={(e) => { setSemesterId(e.target.value); setSelectedBatchId(""); setSummary(null); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {!semesters?.length && <option value="">Loading semesters...</option>}
              {semesters?.map((s: any) => (
                <option key={s.semesterId} value={s.semesterId}>Semester {s.semesterNo}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-base-content/40">
          Files are matched by roll number (UCSTGO-XXXX.pdf or XXXX.pdf). Re-uploading to the same{" "}
          {termLabel(effectiveTermId)} / exam / semester continues the existing batch — existing students are updated, new ones inserted.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-base-content mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload PDFs
            </h2>
            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-base-200 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary/50 hover:bg-base-200/30"
            >
              <input ref={fileRef} type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" />
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-base-content">Drop PDFs here or <span className="text-primary">browse</span></p>
              <p className="text-xs text-base-content/40 mt-1">Name files with the roll number, e.g. UCSTGO-1001.pdf or 1001.pdf</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 divide-y divide-base-200 border border-base-200 rounded-xl max-h-64 overflow-y-auto">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span className="flex-1 font-medium text-base-content truncate">{f.name}</span>
                    <span className="text-[10px] text-base-content/40">{formatSize(f.size)}</span>
                    <button onClick={() => removeFile(f.name)} className="p-1.5 rounded-lg text-base-content/20 hover:text-red-500 hover:bg-red-50 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <button
                onClick={upload}
                disabled={uploading || !ready}
                className="mt-4 w-full px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading {uploadProgress}%...
                  </>
                ) : (
                  `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
                )}
              </button>
            )}
            {uploading && (
              <div className="mt-3 h-2 bg-base-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>

          {summary && (
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
                <h2 className="text-sm font-bold text-base-content">Upload Summary</h2>
                <span className="text-xs text-base-content/40">
                  {summary.matchedFiles} matched &middot; {summary.insertedDocuments} inserted &middot; {summary.updatedDocuments} updated
                </span>
              </div>
              <div className="divide-y divide-base-200">
                {summary.unmatchedFileNames.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-error mb-1.5">Unmatched files ({summary.unmatchedFileNames.length}) — no student with that roll number</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.unmatchedFileNames.map((n) => (
                        <span key={n} className="text-[10px] font-mono bg-error/10 text-error px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
                {summary.failedFileNames.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-error mb-1.5">Failed files ({summary.failedFileNames.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.failedFileNames.map((n) => (
                        <span key={n} className="text-[10px] font-mono bg-error/10 text-error px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
                {summary.skippedFileNames.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-base-content/50 mb-1.5">Skipped ({summary.skippedFileNames.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.skippedFileNames.map((n) => (
                        <span key={n} className="text-[10px] font-mono bg-base-200 text-base-content/50 px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                    </div>
                  </div>
                )}
                {summary.unmatchedFileNames.length === 0 && summary.failedFileNames.length === 0 && summary.skippedFileNames.length === 0 && (
                  <div className="px-4 py-3 text-xs text-success font-medium">All uploaded files were matched successfully.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-base-content mb-3">Batches</h2>
            {batchesLoading && <p className="text-xs text-base-content/40 py-2">Loading batches...</p>}
            {!batchesLoading && batches?.length === 0 && (
              <p className="text-xs text-base-content/40 py-2">
                No batches for {termLabel(effectiveTermId)} / this exam type / semester yet. Upload to create one.
              </p>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batches?.map((b: any) => (
                <button
                  key={b.batchId}
                  onClick={() => { setSelectedBatchId(b.batchId); setSummary(null); }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all ${
                    batchId === b.batchId ? "bg-primary/5 border-primary" : "bg-base-100 border-base-200 hover:border-base-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-base-content">
                      {b.examTypeName} &middot; Sem {b.semesterNo}
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      b.status === "PUBLISHED" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-base-content/40 mt-1">
                    {b.totalFiles} files &middot; {b.matchedFiles} matched &middot; uploaded by {b.uploadedByStaffNo || "—"}
                  </p>
                  {b.publishedAt && (
                    <p className="text-[10px] text-base-content/30 mt-0.5">Published {new Date(b.publishedAt).toLocaleString()}</p>
                  )}
                </button>
              ))}
            </div>
            {selectedBatch && selectedBatch.status !== "PUBLISHED" && (
              <button
                onClick={() => setConfirmPublish(true)}
                disabled={publishing}
                className="mt-3 w-full px-4 py-2.5 text-sm font-bold rounded-xl bg-success text-white hover:bg-success/90 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {publishing ? "Publishing..." : `Publish ${selectedBatch.examTypeName} results`}
              </button>
            )}
            {selectedBatch?.status === "PUBLISHED" && (
              <p className="mt-3 text-[10px] text-success font-bold text-center">Published — visible to students</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
          <h2 className="text-sm font-bold text-base-content">
            Result Documents {batchId ? `— ${batches?.find((b: any) => b.batchId === batchId)?.examTypeName || ""} Sem ${batches?.find((b: any) => b.batchId === batchId)?.semesterNo || ""}` : ""}
          </h2>
          <span className="text-xs text-base-content/40">
            {documentsLoading ? "Loading..." : `${documents?.length ?? 0} documents`}
          </span>
        </div>
        {documentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents?.length === 0 ? (
          <div className="p-8 text-center text-sm text-base-content/40">
            No documents yet. Upload PDFs above to create them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Storage Path</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {documents?.map((d: any) => (
                  <tr key={d.resultDocumentId} className="hover:bg-base-200/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{d.rollNo}</td>
                    <td className="px-4 py-2.5 font-medium text-base-content">{d.studentName}</td>
                    <td className="px-4 py-2.5 text-xs text-base-content/70">{d.pdfFileName}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-base-content/40">{d.storageObjectPath}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.releaseStatus === "RELEASED" ? "bg-success/15 text-success"
                        : d.releaseStatus === "BLOCKED" ? "bg-error/10 text-error"
                        : "bg-base-200 text-base-content/50"
                      }`}>
                        {d.releaseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
      <ConfirmModal
        title="Publish Exam Results"
        message={`Publish ${selectedBatch ? `${selectedBatch.examTypeName} (Semester ${selectedBatch.semesterNo})` : "this batch"} to students? This makes the documents visible to them.`}
        confirmLabel="Publish"
        danger={false}
        visible={confirmPublish}
        onConfirm={publish}
        onCancel={() => setConfirmPublish(false)}
      />
    </div>
  );
}
