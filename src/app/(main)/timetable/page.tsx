"use client";

import { useState } from "react";
import { getAllCourses, COURSES_BY_YEAR, getYearLabel } from "@/lib/courses";
import { type GeneratedTimetable, generateAll, getTeacherTimetable } from "@/lib/timetable";
import { ALL_USERS, getTeachersByFaculty, getHODByFaculty, getTeachersByCourse, getAllFaculties } from "@/lib/users";
import BackButton from "@/components/BackButton";
import Toast from "@/components/Toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function getHourIndex(time: string): number { return HOURS.indexOf(time); }

type ViewTab = "timetable" | "teachers" | "hod" | "courses" | "lms";

export default function TimetablePage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [section, setSection] = useState("A");
  const [timetables, setTimetables] = useState<GeneratedTimetable[]>([]);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [generating, setGenerating] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>("timetable");
  const [selectedFaculty, setSelectedFaculty] = useState("fcs");
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  const currentTimetable = timetables.find((t) => t.section === section);
  const allConflicts = timetables.flatMap((t) => t.conflicts);
  const allTeachersInTimetable = [...new Set(currentTimetable?.entries.map((e) => e.teacherId) || [])];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateAll(year, semester);
      setTimetables(result);
      setGenerating(false);
      if (result.some((t) => t.conflicts.length > 0)) {
        const total = result.reduce((a, t) => a + t.conflicts.length, 0);
        setToast({ visible: true, message: `${total} scheduling conflict${total > 1 ? "s" : ""} detected`, type: "error" });
      } else {
        setToast({ visible: true, message: `Timetable generated for ${getYearLabel(year)}, Sem ${semester}`, type: "success" });
      }
    }, 600);
  };

  const totalHours = currentTimetable?.entries.reduce((a, e) => {
    const start = parseInt(e.slot.start.split(":")[0]);
    const end = parseInt(e.slot.end.split(":")[0]);
    return a + (end - start);
  }, 0) || 0;

  const lectureCount = currentTimetable?.entries.filter((e) => e.type === "lecture").length || 0;
  const labCount = currentTimetable?.entries.filter((e) => e.type === "lab").length || 0;
  const uniqueCourses = new Set(currentTimetable?.entries.map((e) => e.course.code)).size;
  const uniqueTeachers = new Set(currentTimetable?.entries.map((e) => e.teacherId)).size;

  const facultyName = getAllFaculties().find((f) => f.id === selectedFaculty)?.name || selectedFaculty;
  const facultyTeachers = getTeachersByFaculty(selectedFaculty);
  const hod = getHODByFaculty(selectedFaculty);

  const teacherTimetable = selectedTeacher ? getTeacherTimetable(timetables, selectedTeacher) : [];
  const selectedTeacherName = ALL_USERS.find((u) => u.id === selectedTeacher)?.name || "";

  return (
    <div className="space-y-4 animate-fade-in-up pb-8">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-xl sm:text-2xl font-bold">Timetable</h1>
            </div>
            <p className="text-white/70 text-sm mt-0.5">Auto-schedule — teacher conflict-free</p>
          </div>
          {allConflicts.length > 0 && (
            <div className="bg-red-400/30 backdrop-blur-sm rounded-xl px-3.5 py-2 text-center">
              <p className="text-lg font-bold">{allConflicts.length}</p>
              <p className="text-[9px] text-white/80 uppercase">Conflicts</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["timetable", "teachers", "hod", "courses", "lms"] as const).map((t) => (
          <button key={t} onClick={() => setViewTab(t)} className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${viewTab === t ? "bg-primary text-white shadow-sm" : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"}`}>
            {t === "timetable" && "Timetable"}
            {t === "teachers" && "Teachers"}
            {t === "hod" && "HOD Dashboard"}
            {t === "courses" && "Course Catalog"}
            {t === "lms" && "LMS & Assignments"}
          </button>
        ))}
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Year</label>
            <select value={year} onChange={(e) => { setYear(Number(e.target.value)); setTimetables([]); }} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
              {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{getYearLabel(y)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Semester</label>
            <select value={semester} onChange={(e) => { setSemester(Number(e.target.value) as 1 | 2); setTimetables([]); }} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
              {(year <= 2 ? ["A", "B"] : ["A"]).map((s) => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-1">
            <button onClick={handleGenerate} disabled={generating} className="flex-1 px-4 py-2 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></> : "Generate"}
            </button>
            {timetables.length > 0 && (
              <button onClick={handleGenerate} disabled={generating} className="px-3 py-2 text-sm font-bold rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-all disabled:opacity-50" title="Regenerate">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
          </div>
          {currentTimetable && (
            <div className="flex flex-wrap items-end gap-1">
              {(year <= 2 ? ["A", "B"] : ["A"]).map((s) => (
                <button key={s} onClick={() => setSection(s)} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${section === s ? "bg-primary text-white shadow-sm" : "bg-base-200 text-base-content/50 hover:bg-base-300"}`}>{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {allConflicts.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              Scheduling Conflicts
            </h2>
            <span className="text-xs text-red-500 font-semibold">{allConflicts.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-100/50 text-left text-xs font-semibold text-red-700 uppercase">
                  <th className="px-4 py-2.5">Teacher</th>
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Day</th>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {allConflicts.map((c, i) => (
                  <tr key={i} className="hover:bg-red-50/50">
                    <td className="px-4 py-2 font-medium text-red-800">{c.teacherName}</td>
                    <td className="px-4 py-2 text-sm text-red-700">{c.courseCode}</td>
                    <td className="px-4 py-2 text-sm text-red-700">{c.day}</td>
                    <td className="px-4 py-2 text-sm text-red-700">{c.time}</td>
                    <td className="px-4 py-2 text-xs text-red-600">{c.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewTab === "timetable" && currentTimetable && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm"><p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Courses</p><p className="text-2xl font-bold text-base-content mt-1">{uniqueCourses}</p></div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm"><p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Lectures</p><p className="text-2xl font-bold text-green-600 mt-1">{lectureCount}</p></div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm"><p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Labs</p><p className="text-2xl font-bold text-accent mt-1">{labCount}</p></div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm"><p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Teachers</p><p className="text-2xl font-bold text-primary mt-1">{uniqueTeachers}</p></div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm"><p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">Hours/Wk</p><p className="text-2xl font-bold text-accent mt-1">{totalHours}</p></div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-base-content">{getYearLabel(year)} &middot; Sem {semester} &middot; Section {section}</h2>
              <span className="text-xs text-base-content/40">{currentTimetable.entries.length} sessions</span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[80px_repeat(5,1fr)] text-xs">
                  <div className="bg-base-200/50 font-bold text-base-content/60 p-2 border-r border-b border-base-200 sticky left-0">Time</div>
                  {DAYS.map((day) => <div key={day} className="bg-base-200/50 font-bold text-base-content/60 p-2 text-center border-r border-b border-base-200">{day}</div>)}
                  {HOURS.slice(0, -1).map((hour, hi) => (
                    <div key={hour} className="contents">
                      <div className="p-1.5 text-base-content/40 border-r border-b border-base-200 font-mono text-[10px] flex items-center justify-center sticky left-0 bg-base-100">{hour}</div>
                      {DAYS.map((day) => {
                        const entries = currentTimetable.entries.filter((e) => e.slot.day === day && e.slot.start === hour);
                        return (
                          <div key={`${day}-${hour}`} className="relative border-r border-b border-base-200 min-h-[52px] p-0.5">
                            {entries.map((e, i) => (
                              <div key={`${e.course.code}-${i}`} className={`w-full rounded-md px-1 py-0.5 text-[8px] font-semibold leading-tight mb-0.5 ${e.type === "lab" ? "bg-accent/15 text-accent border border-accent/30" : "bg-primary/10 text-primary border border-primary/20"}`} title={`${e.course.code} ${e.course.name} (${e.teacherName})`}>
                                <p className="font-bold truncate">{e.course.code}</p>
                                <p className="truncate opacity-70">{e.room}</p>
                                <p className="truncate text-[7px] opacity-50">{e.teacherName}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-base-content">Session Details</h2>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider sticky top-0">
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {currentTimetable.entries.map((e, i) => (
                    <tr key={`${e.course.code}-${e.slot.day}-${e.slot.start}-${i}`} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-medium text-base-content">{e.slot.day}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{e.slot.start}–{e.slot.end}</td>
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{e.course.code}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content max-w-[200px] truncate">{e.course.name}</td>
                      <td className="px-4 py-2.5 text-xs font-medium text-base-content">{e.teacherName}</td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.type === "lab" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>{e.type}</span></td>
                      <td className="px-4 py-2.5 text-xs text-base-content/60">{e.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewTab === "teachers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <label className="text-xs font-medium text-base-content/60 mb-2 block">Faculty</label>
              <select value={selectedFaculty} onChange={(e) => { setSelectedFaculty(e.target.value); setSelectedTeacher(null); }} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary mb-3">
                {getAllFaculties().map((f) => <option key={f.id} value={f.id}>{f.shortName} — {f.name}</option>)}
              </select>
              <p className="text-xs font-bold text-base-content/60 uppercase mb-2">Teachers ({facultyTeachers.length})</p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {facultyTeachers.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTeacher(t.id)} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedTeacher === t.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-base-200"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${t.role === "hod" ? "bg-accent" : "bg-primary/60"}`}>{t.avatar}</div>
                      <div>
                        <p className="font-medium text-base-content text-xs">{t.name}</p>
                        <p className="text-[10px] text-base-content/40">{t.role === "hod" ? "Head of Dept" : "Lecturer"} &middot; {t.assignedCourses.length} courses</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {hod && (
              <div className="bg-accent/5 rounded-2xl border border-accent/20 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">{hod.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-base-content">{hod.name}</p>
                    <p className="text-[10px] text-accent font-semibold uppercase">Head of Department</p>
                  </div>
                </div>
                <p className="text-xs text-base-content/60">{facultyName}</p>
                <p className="text-xs text-base-content/40 mt-1">{hod.email}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedTeacher ? (
              <>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/60 flex items-center justify-center text-white font-bold text-sm">{ALL_USERS.find((u) => u.id === selectedTeacher)?.avatar}</div>
                    <div>
                      <p className="text-sm font-bold text-base-content">{selectedTeacherName}</p>
                      <p className="text-xs text-base-content/50">{facultyName} &middot; {ALL_USERS.find((u) => u.id === selectedTeacher)?.role === "hod" ? "Head of Department" : "Lecturer"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_USERS.find((u) => u.id === selectedTeacher)?.assignedCourses.map((code) => (
                      <span key={code} className="px-2.5 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-full">{code}</span>
                    ))}
                  </div>
                </div>

                {teacherTimetable.length > 0 ? (
                  teacherTimetable.map((tt) => (
                    <div key={tt.section} className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
                        <h3 className="text-sm font-bold text-base-content">Section {tt.section} — {tt.entries.length} sessions</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                              <th className="px-4 py-3">Day</th>
                              <th className="px-4 py-3">Time</th>
                              <th className="px-4 py-3">Course</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Room</th>
                              <th className="px-4 py-3">Section</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-200">
                            {tt.entries.sort((a, b) => DAYS.indexOf(a.slot.day) - DAYS.indexOf(b.slot.day) || a.slot.start.localeCompare(b.slot.start)).map((e, i) => (
                              <tr key={i} className="hover:bg-base-200/30">
                                <td className="px-4 py-2.5 text-xs">{e.slot.day}</td>
                                <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{e.slot.start}–{e.slot.end}</td>
                                <td className="px-4 py-2.5"><span className="font-bold text-primary text-xs">{e.course.code}</span><span className="text-xs ml-1.5 text-base-content/70">{e.course.name}</span></td>
                                <td className="px-4 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.type === "lab" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>{e.type}</span></td>
                                <td className="px-4 py-2.5 text-xs text-base-content/60">{e.room}</td>
                                <td className="px-4 py-2.5 text-xs font-medium">{e.section}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
                    <p className="text-sm text-base-content/50">No timetable generated yet. Generate one first.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
                <p className="text-sm text-base-content/50">Select a teacher from the list to view their schedule</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewTab === "hod" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <label className="text-xs font-medium text-base-content/60 mb-2 block">Faculty</label>
              <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
                {getAllFaculties().map((f) => <option key={f.id} value={f.id}>{f.shortName} — {f.name}</option>)}
              </select>
            </div>
            {hod && (
              <div className="bg-accent/5 rounded-2xl border border-accent/20 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">{hod.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-base-content">{hod.name}</p>
                    <p className="text-[10px] text-accent font-semibold uppercase">HOD</p>
                    <p className="text-xs text-base-content/50">{facultyName}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold text-base-content/60 uppercase">Department Stats</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-base-content/60">Teachers</span><span className="font-bold text-base-content">{facultyTeachers.length}</span></div>
                <div className="flex justify-between text-xs"><span className="text-base-content/60">Courses</span><span className="font-bold text-base-content">{new Set(facultyTeachers.flatMap((t) => t.assignedCourses)).size}</span></div>
                <div className="flex justify-between text-xs"><span className="text-base-content/60">Assigned Sessions</span><span className="font-bold text-base-content">{currentTimetable?.entries.filter((e) => facultyTeachers.some((t) => t.id === e.teacherId)).length || 0}</span></div>
                <div className="flex justify-between text-xs"><span className="text-base-content/60">Conflicts</span><span className={`font-bold ${allConflicts.length > 0 ? "text-red-500" : "text-green-600"}`}>{allConflicts.length > 0 ? `${allConflicts.length} ⚠` : "None ✓"}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
                <h2 className="text-sm font-bold text-base-content">{facultyTeachers[0]?.faculty} — Teacher Load</h2>
                <span className="text-xs text-base-content/40">{facultyTeachers.length} teachers</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Courses Assigned</th>
                      <th className="px-4 py-3 text-center">Weekly Sessions</th>
                      <th className="px-4 py-3 text-center">Hours/Wk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {facultyTeachers.map((t) => {
                      const sessions = currentTimetable?.entries.filter((e) => e.teacherId === t.id) || [];
                      const hours = sessions.reduce((a, s) => {
                        const start = parseInt(s.slot.start.split(":")[0]);
                        const end = parseInt(s.slot.end.split(":")[0]);
                        return a + (end - start);
                      }, 0);
                      return (
                        <tr key={t.id} className="hover:bg-base-200/30">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${t.role === "hod" ? "bg-accent" : "bg-primary/60"}`}>{t.avatar}</div>
                              <span className="text-sm font-medium text-base-content">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs">{t.role === "hod" ? <span className="text-accent font-bold">HOD</span> : "Lecturer"}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {t.assignedCourses.map((c) => <span key={c} className="text-[9px] bg-base-200 px-1.5 py-0.5 rounded font-mono">{c}</span>)}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center font-bold text-base-content">{sessions.length}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-base-content">{hours}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {allConflicts.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-red-200">
                  <h2 className="text-sm font-bold text-red-700">⚠ Conflicts Requiring HOD Attention</h2>
                </div>
                <div className="p-4 text-xs text-red-600 space-y-2">
                  {allConflicts.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span><strong>{c.teacherName}</strong> — {c.courseCode} on {c.day} at {c.time}: {c.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewTab === "courses" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
            <h2 className="text-sm font-bold text-base-content">Course Catalog — {getYearLabel(year)} &middot; Semester {semester}</h2>
            <span className="text-xs text-base-content/40">{getAllCourses(year, semester).length} courses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3 text-center">Credits</th>
                  <th className="px-4 py-3 text-center">Hours</th>
                  <th className="px-4 py-3 text-center">Lab</th>
                  <th className="px-4 py-3">Teachers</th>
                  <th className="px-4 py-3">Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {getAllCourses(year, semester).map((c) => {
                  const teachers = getTeachersByCourse(c.code);
                  return (
                    <tr key={c.code} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">{c.code}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content font-medium">{c.name}</td>
                      <td className="px-4 py-2.5 text-center text-xs text-base-content/60">{c.credits}</td>
                      <td className="px-4 py-2.5 text-center text-xs text-base-content/60">{c.hoursPerWeek}</td>
                      <td className="px-4 py-2.5 text-center">{c.hasLab ? <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">{c.labHours}h</span> : <span className="text-[10px] text-base-content/30">—</span>}</td>
                      <td className="px-4 py-2.5 text-xs text-base-content/60">
                        {teachers.map((t) => t.name).join(", ") || "Unassigned"}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold text-base-content/40">{c.faculty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewTab === "lms" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-base-content mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            LMS &amp; Assignments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(currentTimetable?.entries || []).filter((e, i, arr) => arr.findIndex((x) => x.course.code === e.course.code) === i).map((e) => (
              <div key={e.course.code} className="bg-base-200/30 rounded-xl p-4 border border-base-200 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-mono font-bold text-primary">{e.course.code}</p>
                    <p className="text-sm font-semibold text-base-content mt-0.5">{e.course.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${e.course.hasLab ? "bg-accent/10 text-accent" : "bg-base-200 text-base-content/50"}`}>{e.course.credits} cr</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-base-content/50">
                  <span>{e.teacherName}</span>
                  <span className="w-1 h-1 rounded-full bg-base-content/20" />
                  <span>{e.course.faculty}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">View LMS</button>
                  <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">Assignments</button>
                </div>
              </div>
            ))}
          </div>
          {(!currentTimetable || currentTimetable.entries.length === 0) && (
            <p className="text-xs text-base-content/40 text-center py-8">Generate a timetable to see LMS &amp; Assignment links</p>
          )}
        </div>
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, visible: false }))} />
    </div>
  );
}
