"use client";

import { useState, useMemo } from "react";
import BackButton from "@/components/ui/BackButton";
import { useStaff } from "@/hooks/useUsers";
import { useOrganizationalUnits, useTeachingAssignments, useActiveTerm, useCourses } from "@/hooks/useAcademic";

export default function LecturersPage() {
  const [department, setDepartment] = useState<string | "all">("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  const { staff, isLoading } = useStaff();
  const { units } = useOrganizationalUnits();
  const { activeTerm } = useActiveTerm();
  const { assignments } = useTeachingAssignments(activeTerm?.termId);
  const { courses } = useCourses();

  const lecturers = useMemo(
    () => staff.filter((s: any) => s.positions?.some((p: any) => p.positionName === "LECTURER")),
    [staff]
  );

  const departments = useMemo(
    () => [...new Set(lecturers.map((t) => t.unitName || t.unitId || "Unassigned"))].sort(),
    [lecturers]
  );

  const filtered = useMemo(() => {
    return department === "all"
      ? lecturers
      : lecturers.filter((t) => (t.unitName || t.unitId || "Unassigned") === department);
  }, [department, lecturers]);

  const teacher = selectedTeacher ? lecturers.find((t) => t.staffId === selectedTeacher) : null;

  const teacherCourses = useMemo(() => {
    if (!teacher) return [];
    return assignments.filter((a: any) => a.staffId === teacher.staffId);
  }, [teacher, assignments]);

  const getCourseInfo = (courseId: string) => courses.find((c: any) => c.courseId === courseId);

  const isHOD = (t: any) => t.positions?.some((p: any) => p.positionName === "HOD");

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Lecturers</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            {isLoading ? "Loading..." : `${lecturers.length} total &middot; ${departments.length} departments`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {departments.slice(0, 4).map((dept) => {
          const teacherCount = lecturers.filter((t) => (t.unitName || t.unitId || "Unassigned") === dept).length;
          return (
            <div
              key={dept}
              onClick={() => { setDepartment(dept); setSelectedTeacher(null); }}
              className={`bg-base-100 rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                department === dept ? "border-primary ring-2 ring-primary/20" : "border-base-200"
              }`}
            >
              <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider truncate">{dept}</p>
              <p className="text-2xl font-bold text-base-content mt-1">{teacherCount}</p>
              <div className="flex items-center gap-2 text-[10px] text-base-content/40 mt-0.5">
                <span>{teacherCount > 1 ? `${teacherCount} staff` : "1 staff"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
        <select
          value={department}
          onChange={(e) => { setDepartment(e.target.value); setSelectedTeacher(null); }}
          className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d} ({lecturers.filter((t) => (t.unitName || t.unitId || "Unassigned") === d).length})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-1">
          {filtered.map((t: any) => {
            const hod = isHOD(t);
            const courseCount = assignments.filter((a: any) => a.staffId === t.staffId).length;
            return (
              <button
                key={t.staffId}
                onClick={() => setSelectedTeacher(t.staffId)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                  selectedTeacher === t.staffId
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-base-100 border-base-200 hover:border-base-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                    hod ? "bg-accent" : "bg-primary/60"
                  }`}>
                    {getInitials(t.staffName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-base-content truncate">{t.staffName}</p>
                    <p className="text-[10px] text-base-content/50 truncate">
                      {t.unitName || t.staffNo}
                      {hod && <span className="ml-1.5 text-accent font-bold">· HOD</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-base-content">{courseCount}</p>
                    <p className="text-[9px] text-base-content/30">courses</p>
                  </div>
                </div>
              </button>
            );
          })}
          {!isLoading && filtered.length === 0 && (
            <div className="bg-base-100 rounded-2xl border border-base-200 p-6 text-center">
              <p className="text-sm text-base-content/50">No lecturers found</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {teacher ? (
            <>
              <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    isHOD(teacher) ? "bg-accent" : "bg-primary/60"
                  }`}>
                    {getInitials(teacher.staffName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-base-content">{teacher.staffName}</h2>
                      {isHOD(teacher) && (
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2.5 py-0.5 rounded-full">HOD</span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60">{teacher.unitName || "No department"}</p>
                    <p className="text-xs text-base-content/40 mt-0.5">{teacher.staffNo}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Faculty</p>
                  <p className="text-sm font-bold text-base-content mt-1">{teacher.unitName || "—"}</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Courses</p>
                  <p className="text-2xl font-bold text-base-content mt-1">{teacherCourses.length}</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Positions</p>
                  <p className="text-sm font-bold text-base-content mt-1">
                    {teacher.positions?.map((p: any) => p.positionName).join(", ") || "—"}
                  </p>
                </div>
              </div>

              <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
                  <h3 className="text-sm font-bold text-base-content">Assigned Courses ({teacherCourses.length})</h3>
                </div>
                <div className="divide-y divide-base-200">
                  {teacherCourses.map((a: any) => {
                    const course = getCourseInfo(a.courseId);
                    return (
                      <div key={a.assignmentId} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200/30 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {a.courseCode?.split("-")[1] || a.courseCode?.slice(0, 4) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-base-content">{a.courseName || course?.courseName || a.courseCode}</p>
                          <div className="flex items-center gap-2 text-[10px] text-base-content/40">
                            <span className="font-mono">{a.courseCode}</span>
                            <span className="w-1 h-1 rounded-full bg-base-content/20" />
                            <span>Section {a.sectionName}</span>
                            <span className="w-1 h-1 rounded-full bg-base-content/20" />
                            <span>{course?.creditUnit ?? "?"} credits</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-base-content/30 bg-base-200 px-2 py-0.5 rounded-full">
                          {a.assignmentStatus}
                        </span>
                      </div>
                    );
                  })}
                  {teacherCourses.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-base-content/40">
                      No course assignments for this term
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-sm font-medium text-base-content/60">Select a lecturer to view details</p>
              <p className="text-xs text-base-content/40 mt-1">Course assignments, department info, and stats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}