"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import BackButton from "@/components/ui/BackButton";
import * as XLSX from "xlsx";
import {
  type SubjectRollCall,
  type RollCallRecord,
  type StudentHitSummary,
  type WarningStudent,
  perSubjectHits,
  overallSummaries,
  warningList,
  calcAttendance,
  remainingAbsencesBeforeHit,
  recoveryNeeded,
  isHit,
} from "@/utils/rollcall";
import { useStudents } from "@/hooks/useUsers";
import Toast from "@/components/ui/Toast";

type LiveRecord = {
  rollNo: string;
  studentName: string;
  status: "present" | "absent";
};

type LiveSession = {
  date: string;
  subject: string;
  records: LiveRecord[];
};

const PRESET_SUBJECTS = [
  "Data Structures", "Algorithms", "Database Systems", "Computer Networks",
  "Operating Systems", "Software Engineering", "Machine Learning", "Web Development",
  "Calculus", "Linear Algebra", "Physics", "Chemistry",
];

const getYearOf = (semester: number) => Math.ceil(semester / 2);

function buildMockRollCall(pool: { rollNo: string; studentName: string; semester: number }[]): SubjectRollCall[] {
  const subjects = ["Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Software Engineering"];
  const seeded = (seed: number) => {
    let x = seed;
    return () => {
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };
  };
  return subjects.map((subjectName, si) => {
    const totalClasses = 5 + (si % 3);
    const rand = seeded(si + 7);
    const records: RollCallRecord[] = pool.map((s, i) => {
      const absent = Math.floor(rand() * (i % 4 === 0 ? 5 : 3));
      const present = Math.max(0, totalClasses - absent);
      return { rollNo: s.rollNo, studentName: s.studentName, present, absent, total: totalClasses };
    });
    return { subjectName, totalClasses, records };
  });
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function RollCallPage() {
  const { students } = useStudents();
  const ALL_STUDENTS = useMemo(
    () => students.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, semester: s.semesterNo ?? 0 })),
    [students]
  );
  const [subjects, setSubjects] = useState<SubjectRollCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [tab, setTab] = useState<"subjects" | "hits" | "warning" | "rector" | "live" | "myattendance">("subjects");

  const [liveYearFilter, setLiveYearFilter] = useState(0);
  const [liveSubject, setLiveSubject] = useState(PRESET_SUBJECTS[0]);
  const [liveDate, setLiveDate] = useState(todayStr());
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [liveRecords, setLiveRecords] = useState<LiveRecord[]>([]);

  const currentSession = liveSessions.find((s) => s.date === liveDate && s.subject === liveSubject);
  const livePool = liveYearFilter === 0 ? ALL_STUDENTS : ALL_STUDENTS.filter((s) => getYearOf(s.semester) === liveYearFilter);

  useEffect(() => {
    if (liveRecords.length === 0 && livePool.length > 0) {
      setLiveRecords(livePool.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, status: "present" as const })));
    }
  }, [liveYearFilter]);

  const switchLiveSubjectDate = (subject: string, date: string) => {
    setLiveSubject(subject);
    setLiveDate(date);
    const existing = liveSessions.find((s) => s.date === date && s.subject === subject);
    if (existing) {
      setLiveRecords(existing.records);
    } else {
      setLiveRecords(livePool.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, status: "present" as const })));
    }
  };

  const toggleLiveStatus = (rollNo: string) => {
    setLiveRecords((prev) => prev.map((r) => r.rollNo === rollNo ? { ...r, status: r.status === "present" ? "absent" : "present" } : r));
  };

  const saveLiveSession = () => {
    setLiveSessions((prev) => {
      const filtered = prev.filter((s) => !(s.date === liveDate && s.subject === liveSubject));
      return [...filtered, { date: liveDate, subject: liveSubject, records: [...liveRecords] }];
    });
    setToast({ visible: true, message: `Attendance saved for ${liveSubject} on ${liveDate}`, type: "success" });
  };

  const consolidateLiveData = (): SubjectRollCall[] => {
    const groups = new Map<string, LiveRecord[]>();
    for (const session of liveSessions) {
      const key = session.subject;
      if (!groups.has(key)) groups.set(key, []);
      const existing = groups.get(key)!;
      for (const r of session.records) {
        const found = existing.find((e) => e.rollNo === r.rollNo);
        if (found) {
          existing.push(r);
        } else {
          existing.push(r);
        }
      }
    }
    const result: SubjectRollCall[] = [];
    const uniqueSubjects = new Set(liveSessions.map((s) => s.subject));
    for (const subj of uniqueSubjects) {
      const sessionDays = liveSessions.filter((s) => s.subject === subj);
      const totalClasses = sessionDays.length;
      const studentMap = new Map<string, { name: string; present: number }>();
      for (const day of sessionDays) {
        for (const r of day.records) {
          if (!studentMap.has(r.rollNo)) studentMap.set(r.rollNo, { name: r.studentName, present: 0 });
          if (r.status === "present") studentMap.get(r.rollNo)!.present++;
        }
      }
      const records: RollCallRecord[] = [];
      for (const [rollNo, data] of studentMap) {
        records.push({
          rollNo, studentName: data.name, present: data.present, absent: totalClasses - data.present, total: totalClasses,
        });
      }
      result.push({ subjectName: subj, totalClasses, records });
    }
    return result;
  };

  const allLiveSubjects = [...new Set(liveSessions.map((s) => s.subject))];

  const summaries = overallSummaries(subjects.length > 0 ? subjects : consolidateLiveData());
  const warnings = warningList(subjects.length > 0 ? subjects : consolidateLiveData());
  const rectorCases = summaries.filter((s) => s.isRectorCase);
  const multiHitStudents = summaries.filter((s) => s.subjectsHit > 0);
  const hitCount = summaries.reduce((acc, s) => acc + s.subjectsHit, 0);
  const uniqueHitStudents = multiHitStudents.length;
  const totalStudents = summaries.length;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const parsed: SubjectRollCall[] = [];

      for (const sheetName of wb.SheetNames) {
        const sheet = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

        if (json.length < 2) continue;

        const headers = Object.keys(json[0]);
        const dateCols = headers.slice(2);

        const records: RollCallRecord[] = json.map((row) => {
          let absent = 0;
          for (const col of dateCols) {
            const val = String(row[col] || "").trim().toUpperCase();
            if (val === "A") absent++;
          }
          const total = dateCols.length;
          return {
            rollNo: String(row[headers[0]] || "").trim(),
            studentName: String(row[headers[1]] || "").trim(),
            present: Math.max(0, total - absent),
            absent,
            total,
          };
        }).filter((r) => r.rollNo && r.studentName);

        if (records.length > 0) {
          parsed.push({ subjectName: sheetName, totalClasses: dateCols.length, records });
        }
      }

      if (parsed.length === 0) {
        setToast({ visible: true, message: "No valid attendance data found in Excel", type: "error" });
      } else {
        setSubjects(parsed);
        setActiveSubject(parsed[0].subjectName);
        setToast({ visible: true, message: `Loaded ${parsed.length} subjects from Excel`, type: "success" });
      }
    } catch {
      setToast({ visible: true, message: "Failed to parse Excel file", type: "error" });
    }
    setLoading(false);
    e.target.value = "";
  };

  const loadMock = () => {
    setLoading(true);
    setTimeout(() => {
      const data = buildMockRollCall(ALL_STUDENTS);
      setSubjects(data);
      setActiveSubject(data[0]?.subjectName || null);
      setLoading(false);
      setToast({ visible: true, message: `Loaded ${data.length} subjects from demo data`, type: "success" });
    }, 500);
  };

  const currentSubject = subjects.find((s) => s.subjectName === activeSubject);
  const activeDisplay = subjects.length > 0 ? subjects : consolidateLiveData();
  const currentDisplaySubject = activeDisplay.find((s) => s.subjectName === activeSubject) || activeDisplay[0];

  const livePresentCount = liveRecords.filter((r) => r.status === "present").length;
  const liveAbsentCount = liveRecords.filter((r) => r.status === "absent").length;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Roll Call</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">Upload Excel, live marking &amp; attendance tracking</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab("subjects")} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "subjects" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
          Dashboard
        </button>
        <button onClick={() => { setTab("live"); if (liveRecords.length === 0) setLiveRecords(livePool.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, status: "present" as const }))); }} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "live" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
          Live
        </button>
        <button onClick={() => setTab("myattendance")} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "myattendance" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
          My Attendance
        </button>
        {tab !== "live" && tab !== "myattendance" && (
          <>
            <button onClick={() => setTab("hits")} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "hits" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
              Hits ({multiHitStudents.length})
            </button>
            <button onClick={() => setTab("warning")} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "warning" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
              Warnings ({warnings.length})
            </button>
            <button onClick={() => setTab("rector")} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === "rector" ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
              Rector ({rectorCases.length})
            </button>
          </>
        )}
      </div>

      {tab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm space-y-3">
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Subject</label>
                <select value={liveSubject} onChange={(e) => switchLiveSubjectDate(e.target.value, liveDate)} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
                  {PRESET_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Date</label>
                <input type="date" value={liveDate} onChange={(e) => switchLiveSubjectDate(liveSubject, e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Year</label>
                <div className="flex gap-1 flex-wrap">
                  <button onClick={() => { setLiveYearFilter(0); setLiveRecords(ALL_STUDENTS.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, status: "present" as const }))); }} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${liveYearFilter === 0 ? "bg-primary text-white" : "bg-base-200 text-base-content/50"}`}>All</button>
                  {[1, 2, 3, 4].map((y) => (
                    <button key={y} onClick={() => { setLiveYearFilter(y); const pool = ALL_STUDENTS.filter((s) => getYearOf(s.semester) === y); setLiveRecords(pool.map((s) => ({ rollNo: s.rollNo, studentName: s.studentName, status: "present" as const }))); }} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${liveYearFilter === y ? "bg-primary text-white" : "bg-base-200 text-base-content/50"}`}>Year {y}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-base-200">
                <div className="text-center">
                  <p className="text-lg font-bold text-base-content">{liveRecords.length}</p>
                  <p className="text-[9px] text-base-content/40 uppercase">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">{livePresentCount}</p>
                  <p className="text-[9px] text-base-content/40 uppercase">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-error">{liveAbsentCount}</p>
                  <p className="text-[9px] text-base-content/40 uppercase">Absent</p>
                </div>
              </div>
              {livePresentCount > 0 && (
                <p className="text-center text-xs text-base-content/40">{Math.round((livePresentCount / liveRecords.length) * 100)}% attendance</p>
              )}
              <button onClick={saveLiveSession} className="w-full py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
                Save Attendance
              </button>
              {liveSessions.filter((s) => s.date === liveDate && s.subject === liveSubject).length > 0 && (
                <p className="text-center text-[10px] text-success font-medium">Already saved for today</p>
              )}
            </div>
            {allLiveSubjects.length > 0 && (
              <div className="bg-base-100 rounded-2xl border border-base-200 p-3 shadow-sm">
                <p className="text-xs font-bold text-base-content/60 uppercase mb-2">Saved Sessions</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {[...liveSessions].reverse().map((s, i) => (
                    <button key={`${s.date}-${s.subject}-${i}`} onClick={() => switchLiveSubjectDate(s.subject, s.date)} className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${liveDate === s.date && liveSubject === s.subject ? "bg-primary/10 text-primary font-semibold" : "text-base-content/60 hover:bg-base-200"}`}>
                      <span className="font-medium">{s.subject}</span> — {s.date}
                      <span className="ml-1 text-[10px] text-base-content/30">({s.records.filter((r) => r.status === "present").length}/{s.records.length})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-base-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-base-content">Mark Attendance — {liveSubject}</h2>
              <span className="text-xs text-base-content/40">{liveDate} &middot; {liveRecords.length} students</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-base-200/50 text-left text-xs font-semibold text-base-content/60 uppercase sticky top-0">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 text-center">Year</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {liveRecords.map((r, idx) => (
                    <tr key={r.rollNo} onClick={() => toggleLiveStatus(r.rollNo)} className={`cursor-pointer transition-colors hover:bg-base-200/50 ${r.status === "absent" ? "bg-error/5" : ""}`}>
                      <td className="px-4 py-2.5 text-xs text-base-content/30">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{r.rollNo}</td>
                      <td className="px-4 py-2.5 font-medium text-base-content">{r.studentName}</td>
                      <td className="px-4 py-2.5 text-center text-xs text-base-content/40">
                        {`Year ${getYearOf(ALL_STUDENTS.find((s) => s.rollNo === r.rollNo)?.semester || 1)}`}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button onClick={(e) => { e.stopPropagation(); toggleLiveStatus(r.rollNo); }} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all shadow-sm ${r.status === "present" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}>
                          {r.status === "present" ? (
                            <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Present</span>
                          ) : (
                            <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Absent</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "myattendance" && (
        <MyAttendanceView sessions={liveSessions} consolidated={consolidateLiveData()} subjects={subjects} />
      )}

      {(tab === "subjects" || tab === "hits" || tab === "warning" || tab === "rector") && (
        <>
          {subjects.length === 0 && liveSessions.length === 0 && (
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="file-input file-input-bordered w-full max-w-xs text-sm" />
                <button onClick={loadMock} disabled={loading} className="px-4 py-2 text-sm font-semibold rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-colors disabled:opacity-50">
                  Use Mock Data
                </button>
                {loading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
            </div>
          )}

          {subjects.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Subjects</p>
                <p className="text-2xl font-bold text-base-content mt-1">{subjects.length}</p>
              </div>
              <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Students</p>
                <p className="text-2xl font-bold text-base-content mt-1">{totalStudents}</p>
              </div>
              <div className="bg-base-100 rounded-2xl border border-error/20 p-4 shadow-sm">
                <p className="text-xs font-medium text-error uppercase tracking-wider">Hit Students</p>
                <p className="text-2xl font-bold text-error mt-1">{uniqueHitStudents}</p>
                <p className="text-[10px] text-error/60">{hitCount} total hits</p>
              </div>
              <div className="bg-base-100 rounded-2xl border border-warning/20 p-4 shadow-sm">
                <p className="text-xs font-medium text-warning uppercase tracking-wider">Rector Cases</p>
                <p className="text-2xl font-bold text-warning mt-1">{rectorCases.length}</p>
                <p className="text-[10px] text-warning/60">Overall &lt; 75%</p>
              </div>
            </div>
          )}

          {subjects.length === 0 && liveSessions.length === 0 && (
            <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-base-content/60">Upload an Excel file or use Live marking</p>
              <p className="text-xs text-base-content/40 mt-1">Each sheet = subject, columns: Roll No, Student Name, then date columns with P/A</p>
            </div>
          )}

          {subjects.length > 0 && (
            <>
              <div className="flex gap-2 flex-wrap">
                {(["subjects", "hits", "warning", "rector"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === t ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
                    {t === "subjects" && "Per Subject"}
                    {t === "hits" && `Overall Hits (${multiHitStudents.length})`}
                    {t === "warning" && `Warnings (${warnings.length})`}
                    {t === "rector" && `Rector (${rectorCases.length})`}
                  </button>
                ))}
              </div>

              {tab === "subjects" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden lg:col-span-1">
                    <div className="p-3 border-b border-base-200 text-xs font-bold text-base-content/60 uppercase tracking-wider">Subjects</div>
                    <div className="divide-y divide-base-200 max-h-96 overflow-y-auto">
                      {subjects.map((subj) => (
                        <button key={subj.subjectName} onClick={() => setActiveSubject(subj.subjectName)} className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-base-200 ${activeSubject === subj.subjectName ? "bg-primary/10 border-l-2 border-primary" : ""}`}>
                          <p className="font-medium text-base-content">{subj.subjectName}</p>
                          <p className="text-[10px] text-base-content/40">{subj.totalClasses} classes &middot; {subj.records.length} students</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-4">
                    {currentSubject && (
                      <>
                        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-base-200 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-base-content">{currentSubject.subjectName}</h2>
                            <span className="text-xs text-base-content/40">{currentSubject.totalClasses} classes</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-base-200/50 text-left text-xs font-semibold text-base-content/60 uppercase">
                                  <th className="px-4 py-3">Roll No</th>
                                  <th className="px-4 py-3">Name</th>
                                  <th className="px-4 py-3 text-center">Present</th>
                                  <th className="px-4 py-3 text-center">Absent</th>
                                  <th className="px-4 py-3 text-center">Total</th>
                                  <th className="px-4 py-3 text-center">%</th>
                                  <th className="px-4 py-3 text-center">Status</th>
                                  <th className="px-4 py-3 text-center">Absences Left</th>
                                  <th className="px-4 py-3 text-center">Recover</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-base-200">
                                {currentSubject.records.map((r) => {
                                  const pct = calcAttendance(r.present, r.total);
                                  const hit = isHit(r.present, r.total);
                                  return (
                                    <tr key={r.rollNo} className={`${hit ? "bg-error/5" : ""} hover:bg-base-200/50 transition-colors`}>
                                      <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{r.rollNo}</td>
                                      <td className="px-4 py-2.5 font-medium text-base-content">{r.studentName}</td>
                                      <td className="px-4 py-2.5 text-center text-success font-semibold">{r.present}</td>
                                      <td className="px-4 py-2.5 text-center text-error font-semibold">{r.absent}</td>
                                      <td className="px-4 py-2.5 text-center text-base-content/60">{r.total}</td>
                                      <td className={`px-4 py-2.5 text-center font-bold ${hit ? "text-error" : "text-success"}`}>{pct}%</td>
                                      <td className="px-4 py-2.5 text-center">
                                        {hit ? <span className="text-[10px] font-semibold bg-error/10 text-error px-2 py-0.5 rounded-full">HIT</span> : <span className="text-[10px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded-full">OK</span>}
                                      </td>
                                      <td className="px-4 py-2.5 text-center text-xs text-base-content/60">{remainingAbsencesBeforeHit(r.present, r.total)}</td>
                                      <td className="px-4 py-2.5 text-center text-xs text-base-content/60">{hit ? recoveryNeeded(r.present, r.total) : 0}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {(() => {
                          const hits = perSubjectHits(currentSubject);
                          if (hits.length === 0) return null;
                          return (
                            <div className="bg-error/5 rounded-2xl border border-error/20 shadow-sm overflow-hidden">
                              <div className="p-4 border-b border-error/20 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-error">Hit List — {currentSubject.subjectName}</h2>
                                <span className="text-xs text-error font-semibold">{hits.length} student{hits.length > 1 ? "s" : ""}</span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-error/5 text-left text-xs font-semibold text-error uppercase">
                                      <th className="px-4 py-2.5">Roll No</th>
                                      <th className="px-4 py-2.5">Name</th>
                                      <th className="px-4 py-2.5 text-center">Present</th>
                                      <th className="px-4 py-2.5 text-center">Absent</th>
                                      <th className="px-4 py-2.5 text-center">%</th>
                                      <th className="px-4 py-2.5 text-center">To Recover</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-error/10">
                                    {hits.map((r) => (
                                      <tr key={r.rollNo} className="hover:bg-error/5 transition-colors">
                                        <td className="px-4 py-2 font-mono text-xs text-error">{r.rollNo}</td>
                                        <td className="px-4 py-2 font-medium text-error">{r.studentName}</td>
                                        <td className="px-4 py-2 text-center text-error">{r.present}</td>
                                        <td className="px-4 py-2 text-center text-error">{r.absent}</td>
                                        <td className="px-4 py-2 text-center font-bold text-error">{calcAttendance(r.present, r.total)}%</td>
                                        <td className="px-4 py-2 text-center font-semibold text-error">{recoveryNeeded(r.present, r.total)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              )}

              {tab === "hits" && (
                <>
                  <div className="bg-error/5 rounded-2xl border border-error/20 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-error/20 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-error">Overall Hit Summary</h2>
                      <span className="text-xs text-error font-semibold">{multiHitStudents.length} student{multiHitStudents.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-error/5 text-left text-xs font-semibold text-error uppercase">
                            <th className="px-4 py-2.5">Roll No</th>
                            <th className="px-4 py-2.5">Name</th>
                            <th className="px-4 py-2.5 text-center">Subjects Hit</th>
                            <th className="px-4 py-2.5">Subject Names</th>
                            <th className="px-4 py-2.5 text-center">Overall %</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-error/10">
                          {summaries.map((s) => (
                            <tr key={s.rollNo} className={`${s.isRectorCase ? "bg-warning/5" : ""} hover:bg-error/5 transition-colors`}>
                              <td className="px-4 py-2 font-mono text-xs text-base-content/60">{s.rollNo}</td>
                              <td className="px-4 py-2 font-medium text-base-content">{s.studentName}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`text-xs font-bold ${s.subjectsHit > 0 ? "text-error" : "text-success"}`}>{s.subjectsHit}/{s.totalSubjects}</span>
                              </td>
                              <td className="px-4 py-2 text-xs text-base-content/60 max-w-[200px] truncate">{s.subjectNames.join(", ") || "—"}</td>
                              <td className="px-4 py-2 text-center font-bold text-base-content">{s.overallPercent}%</td>
                              <td className="px-4 py-2 text-center">
                                {s.isRectorCase ? <span className="text-[10px] font-semibold bg-warning/15 text-warning px-2 py-0.5 rounded-full">RECTOR</span> : s.subjectsHit > 0 ? <span className="text-[10px] font-semibold bg-error/10 text-error px-2 py-0.5 rounded-full">HIT</span> : <span className="text-[10px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded-full">OK</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {rectorCases.length > 0 && (
                    <div className="bg-warning/5 rounded-2xl border border-warning/20 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-warning/20 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-warning">Rector Office Referrals</h2>
                        <span className="text-xs text-warning font-semibold">{rectorCases.length} student{rectorCases.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-warning/5 text-left text-xs font-semibold text-warning uppercase">
                              <th className="px-4 py-2.5">Roll No</th>
                              <th className="px-4 py-2.5">Name</th>
                              <th className="px-4 py-2.5 text-center">Subjects Hit</th>
                              <th className="px-4 py-2.5 text-center">Overall %</th>
                              <th className="px-4 py-2.5 text-center">Present Needed to Recover</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-warning/10">
                            {rectorCases.map((s) => (
                              <tr key={s.rollNo} className="hover:bg-warning/5 transition-colors">
                                <td className="px-4 py-2 font-mono text-xs text-warning">{s.rollNo}</td>
                                <td className="px-4 py-2 font-medium text-warning">{s.studentName}</td>
                                <td className="px-4 py-2 text-center font-bold text-warning">{s.subjectsHit}/{s.totalSubjects}</td>
                                <td className="px-4 py-2 text-center font-bold text-warning">{s.overallPercent}%</td>
                                <td className="px-4 py-2 text-center font-semibold text-warning">{s.recoveryNeeded}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === "warning" && (
                <div className="bg-warning/5 rounded-2xl border border-warning/20 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-warning/20 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-warning">Warning List — Close to Hitting 75%</h2>
                    <span className="text-xs text-warning font-semibold">{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>
                  </div>
                  {warnings.length === 0 ? (
                    <div className="p-6 text-center"><p className="text-sm text-warning font-medium">No students close to the threshold</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-warning/5 text-left text-xs font-semibold text-warning uppercase">
                            <th className="px-4 py-2.5">Roll No</th>
                            <th className="px-4 py-2.5">Name</th>
                            <th className="px-4 py-2.5">Subject</th>
                            <th className="px-4 py-2.5 text-center">Attendance %</th>
                            <th className="px-4 py-2.5 text-center">Absences Left</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-warning/10">
                          {warnings.map((w, i) => (
                            <tr key={`${w.rollNo}-${w.subjectName}-${i}`} className="hover:bg-warning/5 transition-colors">
                              <td className="px-4 py-2 font-mono text-xs text-warning">{w.rollNo}</td>
                              <td className="px-4 py-2 font-medium text-warning">{w.studentName}</td>
                              <td className="px-4 py-2 text-sm text-warning">{w.subjectName}</td>
                              <td className="px-4 py-2 text-center font-bold text-warning">{w.attendancePercent}%</td>
                              <td className="px-4 py-2 text-center font-semibold text-warning">{w.remainingAbsences}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "rector" && (
                <div className="space-y-4">
                  <div className="bg-warning/5 rounded-2xl border border-warning/20 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-warning/20 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-warning">Rector Office — Overall Below 75%</h2>
                      <span className="text-xs text-warning font-semibold">{rectorCases.length} student{rectorCases.length !== 1 ? "s" : ""}</span>
                    </div>
                    {rectorCases.length === 0 ? (
                      <div className="p-6 text-center"><p className="text-sm text-success font-medium">No students need rector referral</p></div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-warning/5 text-left text-xs font-semibold text-warning uppercase">
                              <th className="px-4 py-2.5">Roll No</th>
                              <th className="px-4 py-2.5">Name</th>
                              <th className="px-4 py-2.5 text-center">Total Present</th>
                              <th className="px-4 py-2.5 text-center">Total Classes</th>
                              <th className="px-4 py-2.5 text-center">Overall %</th>
                              <th className="px-4 py-2.5 text-center">Subjects Hit</th>
                              <th className="px-4 py-2.5 text-center">Need Present to Recover</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-warning/10">
                            {rectorCases.map((s) => (
                              <tr key={s.rollNo} className="hover:bg-warning/5 transition-colors">
                                <td className="px-4 py-2 font-mono text-xs text-warning">{s.rollNo}</td>
                                <td className="px-4 py-2 font-medium text-warning">{s.studentName}</td>
                                <td className="px-4 py-2 text-center text-warning font-semibold">{s.totalPresent}</td>
                                <td className="px-4 py-2 text-center text-warning">{s.totalClasses}</td>
                                <td className="px-4 py-2 text-center font-bold text-warning">{s.overallPercent}%</td>
                                <td className="px-4 py-2 text-center font-semibold text-warning">{s.subjectsHit}/{s.totalSubjects}</td>
                                <td className="px-4 py-2 text-center font-bold text-warning">{s.recoveryNeeded}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
    </div>
  );
}

function MyAttendanceView({ sessions, consolidated, subjects }: { sessions: LiveSession[]; consolidated: SubjectRollCall[]; subjects: SubjectRollCall[] }) {
  const allData = subjects.length > 0 ? subjects : consolidated;
  const [selectedStudent, setSelectedStudent] = useState("");
  const allStudents = [...new Map(
    [...allData.flatMap((s) => s.records)].map((r) => [r.rollNo, r])
  ).values()];

  useEffect(() => {
    if (!selectedStudent && allStudents.length > 0) setSelectedStudent(allStudents[0].rollNo);
  }, [allStudents]);

  const studentName = allStudents.find((s) => s.rollNo === selectedStudent)?.studentName || "";
  const studentSubjects = allData.map((subj) => {
    const rec = subj.records.find((r) => r.rollNo === selectedStudent);
    if (!rec) return null;
    const pct = calcAttendance(rec.present, rec.total);
    const hit = isHit(rec.present, rec.total);
    const remain = remainingAbsencesBeforeHit(rec.present, rec.total);
    const recover = hit ? recoveryNeeded(rec.present, rec.total) : 0;
    const canSkip = Math.max(0, remain);
    return { subject: subj.subjectName, ...rec, pct, hit, remain, recover, canSkip };
  }).filter(Boolean);

  const totalPresent = studentSubjects.reduce((a, b) => a + b!.present, 0);
  const totalAbsent = studentSubjects.reduce((a, b) => a + b!.absent, 0);
  const totalClasses = studentSubjects.reduce((a, b) => a + b!.total, 0);
  const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 1000) / 10 : 100;

  if (allData.length === 0) {
    return (
      <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
        <p className="text-sm text-base-content/60">No attendance data yet. Upload Excel or use Live marking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Select Student</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full max-w-xs px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
              {allStudents.map((s) => <option key={s.rollNo} value={s.rollNo}>{s.rollNo} — {s.studentName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-4 gap-2 flex-1 text-center">
            <div className="bg-base-200/40 rounded-xl px-3 py-2">
              <p className="text-lg font-bold text-base-content">{totalClasses}</p>
              <p className="text-[9px] text-base-content/40 uppercase">Classes</p>
            </div>
            <div className="bg-base-200/40 rounded-xl px-3 py-2">
              <p className="text-lg font-bold text-success">{totalPresent}</p>
              <p className="text-[9px] text-base-content/40 uppercase">Attended</p>
            </div>
            <div className="bg-base-200/40 rounded-xl px-3 py-2">
              <p className="text-lg font-bold text-error">{totalAbsent}</p>
              <p className="text-[9px] text-base-content/40 uppercase">Missed</p>
            </div>
            <div className={`rounded-xl px-3 py-2 ${overallPct < 75 ? "bg-error/10" : "bg-success/15"}`}>
              <p className={`text-lg font-bold ${overallPct < 75 ? "text-error" : "text-success"}`}>{overallPct}%</p>
              <p className={`text-[9px] uppercase ${overallPct < 75 ? "text-error/60" : "text-success"}`}>Overall</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {studentSubjects.map((item) => {
          if (!item) return null;
          return (
            <div key={item.subject} className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-base-content">{item.subject}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.hit ? "bg-error/15 text-error" : "bg-success/15 text-success"}`}>{item.pct}%</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-base-200/30 rounded-xl px-3 py-2 text-center">
                    <p className="text-lg font-bold text-success">{item.present}</p>
                    <p className="text-[9px] text-base-content/40">Attended</p>
                  </div>
                  <div className="bg-base-200/30 rounded-xl px-3 py-2 text-center">
                    <p className="text-lg font-bold text-error">{item.absent}</p>
                    <p className="text-[9px] text-base-content/40">Skipped</p>
                  </div>
                  <div className="bg-base-200/30 rounded-xl px-3 py-2 text-center">
                    <p className={`text-lg font-bold ${item.canSkip > 0 ? "text-warning" : "text-error"}`}>{item.canSkip}</p>
                    <p className="text-[9px] text-base-content/40">Can Skip</p>
                  </div>
                  <div className="bg-base-200/30 rounded-xl px-3 py-2 text-center">
                    <p className={`text-lg font-bold ${item.recover > 0 ? "text-error" : "text-success"}`}>{item.recover}</p>
                    <p className="text-[9px] text-base-content/40">Need Attend</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-base-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${item.hit ? "bg-error" : "bg-success"}`} style={{ width: `${item.pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-base-content/40">
                  <span>{item.present}/{item.total} classes attended</span>
                  <span>75% threshold {item.hit ? "(below)" : "(above)"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
