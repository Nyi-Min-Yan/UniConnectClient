"use client";

import { useState, useMemo } from "react";
import { getLecturers, addLecturer, type NewLecturerInput } from "@/lib/store";
import { STUDENTS } from "@/lib/data";
import { getAllCourses } from "@/lib/courses";
import BackButton from "@/components/BackButton";
import ModalPortal from "@/components/ModalPortal";

const LECTURER_DEPARTMENTS = [
  "Faculty of Computer Science",
  "Faculty of Computer Systems & Technologies",
  "Faculty of Information Sciences",
  "Faculty of Computing",
  "Department of Language",
  "Department of Natural Science",
];

export default function LecturersPage() {
  const [department, setDepartment] = useState<string | "all">("all");
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rerender, setRerender] = useState(0);

  const lecturers = useMemo(() => getLecturers(), [rerender]);

  const departments = useMemo(
    () => [...new Set(lecturers.map((t) => t.department))].sort(),
    [lecturers]
  );

  const filtered = useMemo(() => {
    return department === "all"
      ? lecturers
      : lecturers.filter((t) => t.department === department);
  }, [department, lecturers]);

  const deptToFaculty = Object.fromEntries(
    lecturers.map((t) => [t.department, t.faculty])
  );

  const teacher = selectedTeacher
    ? lecturers.find((t) => t.id === selectedTeacher)
    : null;

  const studentCountByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STUDENTS) {
      counts[s.department] = (counts[s.department] || 0) + 1;
    }
    return counts;
  }, []);

  const [form, setForm] = useState<NewLecturerInput>({
    name: "", email: "", department: LECTURER_DEPARTMENTS[0], faculty: "", facultyId: "", assignedCourses: [],
  });
  const [courseInput, setCourseInput] = useState("");

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addLecturer(form);
    setShowModal(false);
    setForm({ name: "", email: "", department: LECTURER_DEPARTMENTS[0], faculty: "", facultyId: "", assignedCourses: [] });
    setCourseInput("");
    setRerender((n) => n + 1);
  };

  const addCourse = () => {
    const code = courseInput.trim().toUpperCase();
    if (code && !form.assignedCourses.includes(code)) {
      setForm({ ...form, assignedCourses: [...form.assignedCourses, code] });
    }
    setCourseInput("");
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Lecturers</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">{lecturers.length} total &middot; {departments.length} departments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Lecturer
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {departments.slice(0, 4).map((dept) => {
          const teacherCount = lecturers.filter((t) => t.department === dept).length;
          const studentCount = STUDENTS.filter((s) => s.department === dept).length;
          return (
            <div
              key={dept}
              onClick={() => { setDepartment(dept); setSelectedTeacher(null); }}
              className={`bg-base-100 rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                department === dept ? "border-primary ring-2 ring-primary/20" : "border-base-200"
              }`}
            >
              <p className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider truncate">{deptToFaculty[dept] || dept}</p>
              <p className="text-2xl font-bold text-base-content mt-1">{teacherCount}</p>
              <div className="flex items-center gap-2 text-[10px] text-base-content/40 mt-0.5">
                <span>{studentCount} students</span>
                <span className="w-1 h-1 rounded-full bg-base-content/20" />
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
              {deptToFaculty[d] || d} ({lecturers.filter((t) => t.department === d).length})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-1">
          {filtered.map((t) => {
            const isHOD = t.role === "hod";
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeacher(t.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                  selectedTeacher === t.id
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-base-100 border-base-200 hover:border-base-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                    isHOD ? "bg-accent" : "bg-primary/60"
                  }`}>
                    {t.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-base-content truncate">{t.name}</p>
                    <p className="text-[10px] text-base-content/50 truncate">
                      {t.faculty}
                      {isHOD && <span className="ml-1.5 text-accent font-bold">· HOD</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-base-content">{t.assignedCourses.length}</p>
                    <p className="text-[9px] text-base-content/30">courses</p>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
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
                    teacher.role === "hod" ? "bg-accent" : "bg-primary/60"
                  }`}>
                    {teacher.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-base-content">{teacher.name}</h2>
                      {teacher.role === "hod" && (
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2.5 py-0.5 rounded-full">HOD</span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60">{teacher.faculty}</p>
                    <p className="text-xs text-base-content/40 mt-0.5">{teacher.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Faculty</p>
                  <p className="text-sm font-bold text-base-content mt-1">{teacher.faculty}</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Courses</p>
                  <p className="text-2xl font-bold text-base-content mt-1">{teacher.assignedCourses.length}</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Department</p>
                  <p className="text-sm font-bold text-base-content mt-1">{teacher.faculty}</p>
                </div>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-base-content/40 uppercase">Students</p>
                  <p className="text-2xl font-bold text-base-content mt-1">{studentCountByDept[teacher.department] || 0}</p>
                </div>
              </div>

              <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
                  <h3 className="text-sm font-bold text-base-content">Assigned Courses ({teacher.assignedCourses.length})</h3>
                </div>
                <div className="divide-y divide-base-200">
                  {teacher.assignedCourses.map((code) => {
                    const course = getAllCourses(1, 1).concat(getAllCourses(1, 2), getAllCourses(2, 1), getAllCourses(2, 2), getAllCourses(3, 1), getAllCourses(3, 2), getAllCourses(4, 1), getAllCourses(4, 2)).find((c) => c.code === code);
                    return (
                      <div key={code} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200/30 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {code.split("-")[1] || code}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-base-content">{course?.name || code}</p>
                          <div className="flex items-center gap-2 text-[10px] text-base-content/40">
                            <span className="font-mono">{code}</span>
                            <span className="w-1 h-1 rounded-full bg-base-content/20" />
                            <span>{course?.credits || "?"} credits</span>
                            {course?.hasLab && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-base-content/20" />
                                <span className="text-accent font-semibold">Lab</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-base-content/30 bg-base-200 px-2 py-0.5 rounded-full">
                          {course?.hoursPerWeek || "?"}h/wk
                        </span>
                      </div>
                    );
                  })}
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

      {showModal && (
        <ModalPortal onClose={() => setShowModal(false)}>
          <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 p-5 w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-base-content">Add Lecturer</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-base-200 text-base-content/40 hover:text-base-content transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Mya Mya" className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. mya.mya@uni.edu" className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
                  {LECTURER_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Assigned Courses</label>
                <div className="flex gap-2">
                  <input type="text" value={courseInput} onChange={(e) => setCourseInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())} placeholder="e.g. CST-2112" className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
                  <button onClick={addCourse} className="px-3 py-2.5 text-xs font-bold rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-all">Add</button>
                </div>
                {form.assignedCourses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.assignedCourses.map((code) => (
                      <span key={code} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                        {code}
                        <button onClick={() => setForm({ ...form, assignedCourses: form.assignedCourses.filter((c) => c !== code) })} className="hover:text-red-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-all">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name || !form.email} className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Lecturer
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
