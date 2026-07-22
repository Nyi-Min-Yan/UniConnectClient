"use client";

import { useState } from "react";
import { STUDENTS, type Student } from "@/lib/data";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState<number | "all">("all");
  const [department, setDepartment] = useState<string | "all">("all");

  const departments = [...new Set(STUDENTS.map((s) => s.department))].sort();

  const filtered = STUDENTS.filter((s) => {
    if (semester !== "all" && s.semester !== semester) return false;
    if (department !== "all" && s.department !== department) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = filtered.reduce<Record<number, Student[]>>((acc, s) => {
    if (!acc[s.semester]) acc[s.semester] = [];
    acc[s.semester].push(s);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Students</h1>
        <p className="text-sm text-base-content/50 mt-0.5">{STUDENTS.length} total students</p>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or roll no..."
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
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-base-content/40">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {sortedSemesters.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p className="text-sm font-medium text-base-content/60">No students found</p>
        </div>
      ) : (
        sortedSemesters.map((sem) => (
          <div key={sem} className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-base-200/50 border-b border-base-200">
              <h2 className="text-sm font-bold text-base-content">Semester {sem}</h2>
            </div>
            <div className="divide-y divide-base-200">
              {grouped[sem].map((student) => (
                <div key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                    {student.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-base-content">{student.name}</p>
                    <div className="flex items-center gap-2 text-xs text-base-content/50">
                      <span className="font-mono">{student.rollNo}</span>
                      <span>&middot;</span>
                      <span>{student.department}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full">
                    Sem {student.semester}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
