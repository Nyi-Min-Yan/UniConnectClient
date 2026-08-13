"use client";

import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/useUsers";
import { useMajors } from "@/hooks/useAcademic";
import BackButton from "@/components/ui/BackButton";

type ViewMode = "grouped" | "department" | "compact";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<number | "all">("all");
  const [major, setMajor] = useState<string | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [view, setView] = useState<ViewMode>("grouped");

  const { students, isLoading, isError } = useStudents();
  const { majors } = useMajors();

  const majorLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of majors) map[m.majorCode] = m.majorName;
    return map;
  }, [majors]);

  const majorCodes = useMemo(
    () => [...new Set(students.map((s) => s.majorCode))].sort(),
    [students]
  );

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (semester !== "all" && s.semesterNo !== null && s.semesterNo !== semester) return false;
      if (major !== "all" && s.majorCode !== major) return false;
      const sYear = s.semesterNo ? Math.ceil(s.semesterNo / 2) : null;
      if (year !== "all" && sYear !== year) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.majorCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, semester, major, year, students]);

  const grouped = useMemo(() => {
    if (view === "department") {
      const g: Record<string, typeof students> = {};
      for (const s of filtered) {
        if (!g[s.majorCode]) g[s.majorCode] = [];
        g[s.majorCode].push(s);
      }
      return g;
    }
    const g: Record<number, typeof students> = {};
    for (const s of filtered) {
      const key = s.semesterNo ?? 0;
      if (!g[key]) g[key] = [];
      g[key].push(s);
    }
    return g;
  }, [filtered, view]);

  const sortedKeys = useMemo(
    () =>
      Object.keys(grouped)
        .map((k) => (view === "department" ? k : Number(k)))
        .sort((a, b) => (typeof a === "string" && typeof b === "string" ? a.localeCompare(b) : (a as number) - (b as number))),
    [grouped, view]
  );

  const majorColors: Record<string, string> = {
    CS: "bg-blue-100 text-blue-700",
    CT: "bg-purple-100 text-purple-700",
    CST: "bg-emerald-100 text-emerald-700",
  };

  const colorFor = (code: string) => majorColors[code] || "bg-base-200 text-base-content/60";

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Students</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            {isLoading ? "Loading..." : `${students.length} total &middot; ${majorCodes.length} majors`}
          </p>
        </div>
        <div className="flex gap-1 bg-base-100 border border-base-200 rounded-xl p-0.5">
          {(["grouped", "department", "compact"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                view === v ? "bg-primary text-white shadow-sm" : "text-base-content/50 hover:text-base-content"
              }`}
            >
              {v === "grouped" ? "By Semester" : v === "department" ? "By Major" : "Compact"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {majorCodes.map((m) => {
          const count = students.filter((s) => s.majorCode === m).length;
          return (
            <div
              key={m}
              onClick={() => setMajor(major === m ? "all" : m)}
              className={`bg-base-100 rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                major === m ? "border-primary ring-2 ring-primary/20" : "border-base-200"
              }`}
            >
              <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider truncate">{majorLabels[m] || m}</p>
              <p className="text-2xl font-bold text-base-content mt-1">{count}</p>
              <p className="text-[10px] text-base-content/40 mt-0.5">{students.length > 0 ? Math.round((count / students.length) * 100) : 0}% of total</p>
            </div>
          );
        })}
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, or major..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Semesters</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
            ))}
          </select>
          <select
            value={year !== "all" ? year : "all"}
            onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Years</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Majors</option>
            {majorCodes.map((m) => (
              <option key={m} value={m}>{majorLabels[m] || m}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-base-content/40">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
          {view !== "compact" && filtered.length > 0 && (
            <p className="text-[10px] text-base-content/30">{sortedKeys.length} {view === "department" ? "majors" : "groups"}</p>
          )}
        </div>
      </div>

      {isError && (
        <div className="bg-error/10 border border-error/30 rounded-2xl px-4 py-3 text-sm text-error font-medium">
          Failed to load students — is the backend running? Please try again later.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p className="text-sm font-medium text-base-content/60">No students found</p>
        </div>
      ) : view === "compact" ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-200/50 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Major</th>
                  <th className="px-4 py-3 text-center">Sem</th>
                  <th className="px-4 py-3 text-center">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filtered.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-base-200/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-base-content/30">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{student.rollNo}</td>
                    <td className="px-4 py-2.5 font-medium text-base-content">{student.studentName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorFor(student.majorCode)}`}>{majorLabels[student.majorCode] || student.majorCode}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-base-content/50">{student.semesterNo ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[10px] bg-base-200 px-2 py-0.5 rounded-full text-base-content/50">
                        {student.semesterNo ? `Year ${Math.ceil(student.semesterNo / 2)}` : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        sortedKeys.map((key) => {
          const group = grouped[key as keyof typeof grouped];
          const isDeptView = view === "department";
          const headerLabel = isDeptView ? `Major ${key}` : `Semester ${key}`;
          const subInfo = isDeptView
            ? `${group.length} students`
            : `${group.length} students &middot; ${[...new Set(group.map((s) => majorLabels[s.majorCode] || s.majorCode))].join(", ")}`;

          return (
            <div key={String(key)} className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-base-200/50 border-b border-base-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-base-content">{headerLabel}</h2>
                <span className="text-[10px] text-base-content/40">{subInfo}</span>
              </div>
              <div className="divide-y divide-base-200">
                {group.map((student) => (
                  <div key={student.studentId} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                      {student.studentName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-base-content">{student.studentName}</p>
                      <div className="flex items-center gap-2 text-xs text-base-content/50">
                        <span className="font-mono">{student.rollNo}</span>
                        <span className="w-1 h-1 rounded-full bg-base-content/20" />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorFor(student.majorCode)}`}>{majorLabels[student.majorCode] || student.majorCode}</span>
                        <span className="w-1 h-1 rounded-full bg-base-content/20" />
                        <span className="text-[10px]">{student.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                        Sem {student.semesterNo ?? "—"}
                      </span>
                      {isDeptView && (
                        <span className="text-[10px] text-base-content/40 bg-primary/10 px-2 py-0.5 rounded-full">
                          {student.semesterNo ? `Yr ${Math.ceil(student.semesterNo / 2)}` : "—"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}