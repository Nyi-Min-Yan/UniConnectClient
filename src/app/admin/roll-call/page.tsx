"use client";

import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/axios";
import {
  useAcademicTerms,
  useActiveTerm,
  useSections,
  useSchedules,
} from "@/hooks/useAcademic";
import { useStudentsByFilters } from "@/hooks/useUsers";
import BackButton from "@/components/ui/BackButton";
import Toast from "@/components/ui/Toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type AttendanceRecord = {
  attendanceId: string;
  sessionId: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  attendanceStatus: "PRESENT" | "ABSENT";
  remark: string | null;
  markedAt: string | null;
  markedByStaffId: string | null;
};

type ToastState = { visible: boolean; message: string; type: "success" | "error" };

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
    if (res) {
      const s = res.status;
      if (s === 400) return res.data?.message || "Bad request.";
      if (s === 401) return "Session expired — please log in again.";
      if (s === 403) return "Permission denied.";
      if (s === 404) return "Resource not found.";
      if (s === 409) return "Conflict.";
      if (s !== undefined && s >= 500) return "Server error — please try again later.";
      return res.data?.message || `Request failed (${s}).`;
    }
  }
  return "Network error — backend unavailable.";
}

export default function RollCallPage() {
  const { terms } = useAcademicTerms();
  const { activeTerm } = useActiveTerm();
  const { sections } = useSections();
  const [termId, setTermId] = useState<string>("");
  const [sectionId, setSectionId] = useState<string>("");
  const [scheduleId, setScheduleId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<Record<string, "PRESENT" | "ABSENT">>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", type: "success" });

  const effectiveTermId = termId || activeTerm?.termId || terms?.[0]?.termId || "";
  const effectiveSectionId = sectionId || sections?.[0]?.sectionId || "";

  const { schedules, isLoading: schedulesLoading } = useSchedules(
    effectiveTermId || undefined,
    effectiveSectionId || undefined
  );

  const selectedSession = sessions.find((s: any) => s.sessionId === sessionId) || null;
  const students = useStudentsByFilters(
    undefined,
    undefined,
    selectedSession?.sectionId || undefined,
    effectiveTermId || undefined
  );

  useEffect(() => {
    if (!scheduleId) {
      setSessions([]);
      setSessionId("");
      return;
    }
    let cancelled = false;
    apiClient
      .get(`/api/schedules/${scheduleId}/sessions`)
      .then((res) => {
        if (cancelled) return;
        setSessions(res.data || []);
        const first = res.data?.[0];
        setSessionId(first?.sessionId || "");
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => { cancelled = true; };
  }, [scheduleId]);

  useEffect(() => {
    if (!sessionId) {
      setAttendance([]);
      setMarks({});
      return;
    }
    let cancelled = false;
    apiClient
      .get(`/api/attendance?sessionId=${sessionId}`)
      .then((res) => {
        if (cancelled) return;
        const list: AttendanceRecord[] = res.data || [];
        setAttendance(list);
        const map: Record<string, "PRESENT" | "ABSENT"> = {};
        for (const a of list) map[a.studentId] = a.attendanceStatus;
        setMarks(map);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => { cancelled = true; };
  }, [sessionId]);

  const studentList = useMemo(() => students.students ?? [], [students.students]);

  const toggleMark = (studentId: string, status: "PRESENT" | "ABSENT") => {
    setMarks((prev) => {
      const next = { ...prev };
      if (next[studentId] === status) delete next[studentId];
      else next[studentId] = status;
      return next;
    });
  };

  const isDirty = useMemo(() => {
    const current = new Map(attendance.map((a) => [a.studentId, a.attendanceStatus]));
    const entries = Object.entries(marks);
    if (entries.length !== current.size) return true;
    for (const [sid, status] of entries) {
      if (current.get(sid) !== status) return true;
    }
    return false;
  }, [attendance, marks]);

  const saveAttendance = async () => {
    if (!sessionId) return;
    setError(null);
    setSaving(true);
    try {
      const entries = Object.entries(marks).map(([studentId, attendanceStatus]) => ({
        studentId,
        attendanceStatus,
      }));
      if (entries.length === 0) {
        setToast({ visible: true, message: "No marks to save", type: "error" });
        return;
      }
      await apiClient.post(`/api/attendance/${sessionId}/mark`, { entries });
      const res = await apiClient.get(`/api/attendance?sessionId=${sessionId}`);
      setAttendance(res.data || []);
      const map: Record<string, "PRESENT" | "ABSENT"> = {};
      for (const a of res.data || []) map[a.studentId] = a.attendanceStatus;
      setMarks(map);
      setToast({ visible: true, message: `Attendance saved (${entries.length} students)`, type: "success" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = studentList.filter((s: any) => marks[s.studentId] === "PRESENT").length;
  const absentCount = studentList.filter((s: any) => marks[s.studentId] === "ABSENT").length;
  const unmaskedCount = studentList.filter((s: any) => !marks[s.studentId]).length;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Roll Call</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            Mark attendance against real class sessions from the timetable
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-2xl px-4 py-3 text-sm text-error font-medium">
          {error}
        </div>
      )}

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Academic Term</label>
            <select
              value={effectiveTermId}
              onChange={(e) => { setTermId(e.target.value); setScheduleId(""); setSessionId(""); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {terms?.map((t: any) => (
                <option key={t.termId} value={t.termId}>
                  {t.academicYear} {t.status === "ACTIVE" ? "(active)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Section</label>
            <select
              value={effectiveSectionId}
              onChange={(e) => { setSectionId(e.target.value); setScheduleId(""); setSessionId(""); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {sections?.map((s: any) => (
                <option key={s.sectionId} value={s.sectionId}>Section {s.sectionName}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Schedule (course / activity)</label>
            <select
              value={scheduleId}
              onChange={(e) => { setScheduleId(e.target.value); setSessionId(""); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              <option value="">{schedulesLoading ? "Loading schedules..." : "Select a schedule..."}</option>
              {schedules?.map((s: any) => (
                <option key={s.scheduleId} value={s.scheduleId}>
                  {s.courseCode || s.scheduleType} &middot; {DAYS[s.dayOfWeek - 1] || "?"} &middot; {s.staffName || "—"} &middot; {s.scheduleType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {scheduleId && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm">
          <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Class Session</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sessions.length === 0 && <p className="text-xs text-base-content/40 py-2">No sessions created for this schedule yet.</p>}
            {sessions.map((s: any) => (
              <button
                key={s.sessionId}
                onClick={() => setSessionId(s.sessionId)}
                className={`text-left px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  sessionId === s.sessionId ? "bg-primary/5 border-primary font-semibold" : "border-base-200 hover:border-base-300"
                }`}
              >
                <p className="text-xs font-bold text-base-content">{s.sessionDate}</p>
                <p className="text-[10px] text-base-content/40 mt-0.5">{s.courseCode || "Session"} &middot; {s.sectionName || ""} &middot; {s.sessionStatus}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {sessionId && (
        <>
          {(students.isLoading || students.students.length === 0) && (
            <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
              {students.isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-base-content/50">Loading students...</p>
                </div>
              ) : (
                <p className="text-sm text-base-content/50">No students assigned to this section yet.</p>
              )}
            </div>
          )}

          {students.students.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-base-content">{studentList.length}</p>
                  <p className="text-[10px] text-base-content/40 uppercase">Students</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-success/20 p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-success">{presentCount}</p>
                  <p className="text-[10px] text-success/60 uppercase">Present</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-error/20 p-4 shadow-sm text-center">
                  <p className="text-2xl font-bold text-error">{absentCount}</p>
                  <p className="text-[10px] text-error/60 uppercase">Absent</p>
                </div>
              </div>

              <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-base-content">
                    Mark Attendance — {selectedSession?.courseCode || "Session"} &middot; {selectedSession?.sessionDate}
                  </h2>
                  <span className="text-xs text-base-content/40">
                    {presentCount} present &middot; {absentCount} absent
                    {unmaskedCount > 0 ? ` · ${unmaskedCount} unmarked` : ""}
                  </span>
                </div>
                <div className="max-h-[480px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-base-200/50 text-left text-xs font-semibold text-base-content/60 uppercase sticky top-0">
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-200">
                      {studentList.map((s: any) => {
                        const status = marks[s.studentId];
                        return (
                          <tr key={s.studentId} className={`hover:bg-base-200/30 transition-colors ${status === "ABSENT" ? "bg-error/5" : status === "PRESENT" ? "bg-success/5" : ""}`}>
                            <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{s.rollNo}</td>
                            <td className="px-4 py-2.5 font-medium text-base-content">{s.studentName}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => toggleMark(s.studentId, "PRESENT")}
                                  className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                    status === "PRESENT" ? "bg-success text-white shadow-sm" : "bg-success/10 text-success hover:bg-success/20"
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => toggleMark(s.studentId, "ABSENT")}
                                  className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                    status === "ABSENT" ? "bg-error text-white shadow-sm" : "bg-error/10 text-error hover:bg-error/20"
                                  }`}
                                >
                                  Absent
                                </button>
                                {status === undefined && <span className="text-[9px] text-base-content/30 uppercase ml-1">unmarked</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-base-200">
                  <button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      `Save Attendance${isDirty ? " (unsaved changes)" : ""}`
                    )}
                  </button>
                </div>
              </div>

              {attendance.length > 0 && (
                <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
                    <h2 className="text-sm font-bold text-base-content">Saved Records ({attendance.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                          <th className="px-4 py-3">Roll No</th>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Marked At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-200">
                        {attendance.map((a) => (
                          <tr key={a.attendanceId} className="hover:bg-base-200/30 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{a.rollNo}</td>
                            <td className="px-4 py-2.5 font-medium text-base-content">{a.studentName}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.attendanceStatus === "PRESENT" ? "bg-success/15 text-success" : "bg-error/10 text-error"}`}>
                                {a.attendanceStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center text-[10px] text-base-content/40">
                              {a.markedAt ? new Date(a.markedAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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