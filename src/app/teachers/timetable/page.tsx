// src/app/teachers/timetable/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  type GeneratedTimetable,
  generateAllFromAPI,
  getTeacherTimetable,
  getSectionTimetable,
  getCourseStats,
  sortTimetableEntries,
} from "@/utils/timetable";
import BackButton from "@/components/ui/BackButton";
import {
  useCourses,
  useTeachingAssignments,
  useTimeSlots,
  useActiveTerm,
  useSections,
  useSchedulesByGeneration,
  useTimetableGenerations,
} from "@/hooks/useAcademic";
import { useStaff } from "@/hooks/useUsers";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type ViewTab = "timetable" | "teachers" | "hod" | "courses" | "lms";

const getCourseCode = (course: any): string => {
  return course.courseCode || course.code || course.courseId?.substring(0, 8) || "";
};

const getCourseName = (course: any): string => {
  return course.courseName || course.name || "Unknown Course";
};

export default function TimetablePage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [section, setSection] = useState("");
  const [timetables, setTimetables] = useState<GeneratedTimetable[]>([]);
  const [viewTab, setViewTab] = useState<ViewTab>("timetable");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);

  const { activeTerm } = useActiveTerm();
  const { courses, isLoading: coursesLoading } = useCourses();
  const { assignments, isLoading: assignmentsLoading } = useTeachingAssignments(activeTerm?.termId);
  const { timeSlots, isLoading: timeSlotsLoading } = useTimeSlots();
  const { staff, isLoading: staffLoading } = useStaff();
  const { sections, isLoading: sectionsLoading } = useSections();
  const { generations, isLoading: generationsLoading } = useTimetableGenerations(activeTerm?.termId);
  const { schedules, isLoading: schedulesLoading } = useSchedulesByGeneration(selectedGenerationId);

  const isLoading =
    coursesLoading ||
    assignmentsLoading ||
    timeSlotsLoading ||
    staffLoading ||
    sectionsLoading ||
    generationsLoading ||
    schedulesLoading;

  const publishedGeneration = useMemo(() => {
    return generations?.find((g: any) => g.status === "PUBLISHED");
  }, [generations]);

  useEffect(() => {
    if (publishedGeneration) {
      setSelectedGenerationId(publishedGeneration.generationId);
    }
  }, [publishedGeneration]);

  useEffect(() => {
    if (sections && sections.length > 0 && !section) {
      setSection(sections[0].sectionName);
    }
  }, [sections, section]);

  useEffect(() => {
    if (
      schedules &&
      courses &&
      assignments &&
      staff &&
      timeSlots &&
      sections &&
      selectedGenerationId
    ) {
      const sectionList = sections.map((s: any) => ({
        id: s.sectionId,
        name: s.sectionName,
      }));

      const generated = generateAllFromAPI(
        schedules,
        courses,
        assignments,
        staff,
        timeSlots,
        year,
        semester,
        sectionList
      );

      setTimetables(generated);
    }
  }, [
    schedules,
    courses,
    assignments,
    staff,
    timeSlots,
    sections,
    selectedGenerationId,
    year,
    semester,
  ]);

  const currentTimetable = useMemo(() => {
    return getSectionTimetable(timetables, section);
  }, [timetables, section]);

  const allConflicts = useMemo(() => {
    return timetables.flatMap((t) => t.conflicts);
  }, [timetables]);

  const courseStats = useMemo(() => {
    return currentTimetable
      ? getCourseStats(currentTimetable.entries)
      : { lectures: 0, labs: 0, uniqueCourses: 0, uniqueTeachers: 0, totalHours: 0 };
  }, [currentTimetable]);

  const faculties = useMemo(() => {
    const facultyMap = new Map();
    staff?.forEach((s: any) => {
      if (s.unitId && !facultyMap.has(s.unitId)) {
        facultyMap.set(s.unitId, {
          id: s.unitId,
          name: s.unitName || s.unitId,
        });
      }
    });
    return Array.from(facultyMap.values());
  }, [staff]);

  const facultyStaff = useMemo(() => {
    return staff?.filter((s: any) => s.unitId === selectedFaculty) || [];
  }, [staff, selectedFaculty]);

  const hod = useMemo(() => {
    return facultyStaff.find(
      (s: any) => s.positions?.some((p: any) => p.positionName === "HOD")
    );
  }, [facultyStaff]);

  const teacherTimetable = useMemo(() => {
    return selectedTeacher ? getTeacherTimetable(timetables, selectedTeacher) : [];
  }, [timetables, selectedTeacher]);

  const selectedTeacherName = useMemo(() => {
    return staff?.find((s: any) => s.staffId === selectedTeacher)?.staffName || "";
  }, [staff, selectedTeacher]);

  return (
    <div className="space-y-4 animate-fade-in-up pb-8">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-xl sm:text-2xl font-bold">Timetable</h1>
            </div>
            <p className="text-white/70 text-sm mt-0.5">
              {publishedGeneration
                ? `Published: ${publishedGeneration.academicYear}`
                : "View published schedules — teacher conflict-free"}
            </p>
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
          <button
            key={t}
            onClick={() => setViewTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
              viewTab === t
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {t === "timetable" && "Timetable"}
            {t === "teachers" && "Teachers"}
            {t === "hod" && "HOD Dashboard"}
            {t === "courses" && "Course Catalog"}
            {t === "lms" && "LMS & Assignments"}
          </button>
        ))}
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>{`Year ${y}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(Number(e.target.value) as 1 | 2);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-base-content/60 mb-1.5 block">
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary"
            >
              {sections?.map((s: any) => (
                <option key={s.sectionId} value={s.sectionName}>
                  Section {s.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content/60">
              {isLoading ? "Loading..." : publishedGeneration ? `Term ${publishedGeneration.academicYear}` : "No published timetable"}
            </div>
          </div>
          {sections && sections.length > 0 && (
            <div className="flex flex-wrap items-end gap-1">
              {sections.map((s: any) => (
                <button
                  key={s.sectionId}
                  onClick={() => setSection(s.sectionName)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    section === s.sectionName
                      ? "bg-primary text-white shadow-sm"
                      : "bg-base-200 text-base-content/50 hover:bg-base-300"
                  }`}
                >
                  {s.sectionName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {allConflicts.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-red-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Scheduling Conflicts
            </h2>
            <span className="text-xs text-red-500 font-semibold">
              {allConflicts.length}
            </span>
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
                    <td className="px-4 py-2 font-medium text-red-800">
                      {c.teacherName}
                    </td>
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
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                Courses
              </p>
              <p className="text-2xl font-bold text-base-content mt-1">
                {courseStats.uniqueCourses}
              </p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                Lectures
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {courseStats.lectures}
              </p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                Labs
              </p>
              <p className="text-2xl font-bold text-accent mt-1">
                {courseStats.labs}
              </p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                Teachers
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                {courseStats.uniqueTeachers}
              </p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
                Hours/Wk
              </p>
              <p className="text-2xl font-bold text-accent mt-1">
                {courseStats.totalHours}
              </p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-base-content">
                Year {year} · Sem {semester} · Section {section}
              </h2>
              <span className="text-xs text-base-content/40">
                {currentTimetable.entries.length} sessions
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[80px_repeat(5,1fr)] text-xs">
                  <div className="bg-base-200/50 font-bold text-base-content/60 p-2 border-r border-b border-base-200 sticky left-0">
                    Time
                  </div>
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="bg-base-200/50 font-bold text-base-content/60 p-2 text-center border-r border-b border-base-200"
                    >
                      {day}
                    </div>
                  ))}
                  {HOURS.slice(0, -1).map((hour) => (
                    <div key={hour} className="contents">
                      <div className="p-1.5 text-base-content/40 border-r border-b border-base-200 font-mono text-[10px] flex items-center justify-center sticky left-0 bg-base-100">
                        {hour}
                      </div>
                      {DAYS.map((day) => {
                        const entries = currentTimetable.entries.filter(
                          (e) => e.slot.day === day && e.slot.start === hour
                        );
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className="relative border-r border-b border-base-200 min-h-[52px] p-0.5"
                          >
                            {entries.map((e, i) => (
                              <div
                                key={`${e.course.courseId}-${i}`}
                                className={`w-full rounded-md px-1 py-0.5 text-[8px] font-semibold leading-tight mb-0.5 ${
                                  e.type === "LAB"
                                    ? "bg-accent/15 text-accent border border-accent/30"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                                title={`${getCourseCode(e.course)} ${getCourseName(
                                  e.course
                                )} (${e.teacherName})`}
                              >
                                <p className="font-bold truncate">
                                  {getCourseCode(e.course)}
                                </p>
                                <p className="truncate opacity-70">{e.room}</p>
                                <p className="truncate text-[7px] opacity-50">
                                  {e.teacherName}
                                </p>
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
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
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
                  {sortTimetableEntries(currentTimetable.entries).map((e, i) => (
                    <tr
                      key={`${e.course.courseId}-${e.slot.day}-${e.slot.start}-${i}`}
                      className="hover:bg-base-200/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs font-medium text-base-content">
                        {e.slot.day}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">
                        {e.slot.start}–{e.slot.end}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">
                        {getCourseCode(e.course)}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-base-content max-w-[200px] truncate">
                        {getCourseName(e.course)}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-medium text-base-content">
                        {e.teacherName}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            e.type === "LAB"
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-base-content/60">
                        {e.room}
                      </td>
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
              <label className="text-xs font-medium text-base-content/60 mb-2 block">
                Faculty
              </label>
              <select
                value={selectedFaculty}
                onChange={(e) => {
                  setSelectedFaculty(e.target.value);
                  setSelectedTeacher(null);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary mb-3"
              >
                <option value="">Select Faculty</option>
                {faculties.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="text-xs font-bold text-base-content/60 uppercase mb-2">
                Teachers ({facultyStaff.length})
              </p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {facultyStaff.map((t: any) => (
                  <button
                    key={t.staffId}
                    onClick={() => setSelectedTeacher(t.staffId)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      selectedTeacher === t.staffId
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${
                          t.positions?.some((p: any) => p.positionName === "HOD")
                            ? "bg-accent"
                            : "bg-primary/60"
                        }`}
                      >
                        {t.staffName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="font-medium text-base-content text-xs">
                          {t.staffName}
                        </p>
                        <p className="text-[10px] text-base-content/40">
                          {t.positions?.some((p: any) => p.positionName === "HOD")
                            ? "Head of Dept"
                            : "Lecturer"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {hod && (
              <div className="bg-accent/5 rounded-2xl border border-accent/20 p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                    {hod.staffName?.charAt(0) || "H"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-base-content">{hod.staffName}</p>
                    <p className="text-[10px] text-accent font-semibold uppercase">
                      Head of Department
                    </p>
                  </div>
                </div>
                <p className="text-xs text-base-content/60">{selectedFaculty}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedTeacher ? (
              <>
                <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/60 flex items-center justify-center text-white font-bold text-sm">
                      {selectedTeacherName?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-base-content">
                        {selectedTeacherName}
                      </p>
                      <p className="text-xs text-base-content/50">
                        {faculties.find((f: any) => f.id === selectedFaculty)?.name ||
                          ""}
                      </p>
                    </div>
                  </div>
                </div>

                {teacherTimetable.length > 0 ? (
                  teacherTimetable.map((tt) => (
                    <div
                      key={tt.section}
                      className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
                        <h3 className="text-sm font-bold text-base-content">
                          Section {tt.section} — {tt.entries.length} sessions
                        </h3>
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
                            {sortTimetableEntries(tt.entries).map((e, i) => (
                              <tr key={i} className="hover:bg-base-200/30">
                                <td className="px-4 py-2.5 text-xs">{e.slot.day}</td>
                                <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">
                                  {e.slot.start}–{e.slot.end}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="font-bold text-primary text-xs">
                                    {getCourseCode(e.course)}
                                  </span>
                                  <span className="text-xs ml-1.5 text-base-content/70">
                                    {getCourseName(e.course)}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      e.type === "LAB"
                                        ? "bg-accent/10 text-accent"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {e.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-base-content/60">
                                  {e.room}
                                </td>
                                <td className="px-4 py-2.5 text-xs font-medium">
                                  {e.section}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
                    <p className="text-sm text-base-content/50">
                      No timetable generated yet.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
                <p className="text-sm text-base-content/50">
                  Select a teacher from the list to view their schedule
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewTab === "hod" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-base-content mb-4">HOD Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-200/30 rounded-xl p-4">
              <p className="text-xs text-base-content/60">Total Teachers</p>
              <p className="text-2xl font-bold">{facultyStaff.length}</p>
            </div>
            <div className="bg-base-200/30 rounded-xl p-4">
              <p className="text-xs text-base-content/60">Total Courses</p>
              <p className="text-2xl font-bold">{courseStats.uniqueCourses}</p>
            </div>
            <div className="bg-base-200/30 rounded-xl p-4">
              <p className="text-xs text-base-content/60">Conflicts</p>
              <p
                className={`text-2xl font-bold ${
                  allConflicts.length > 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {allConflicts.length}
              </p>
            </div>
          </div>
          {hod && (
            <div className="mt-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                  {hod.staffName?.charAt(0) || "H"}
                </div>
                <div>
                  <p className="text-sm font-bold text-base-content">{hod.staffName}</p>
                  <p className="text-xs text-base-content/50">{hod.unitName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewTab === "courses" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex items-center justify-between">
            <h2 className="text-sm font-bold text-base-content">Course Catalog</h2>
            <span className="text-xs text-base-content/40">{courses?.length || 0} courses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3 text-center">Credits</th>
                  <th className="px-4 py-3">Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {courses?.map((c: any) => (
                  <tr key={c.courseId} className="hover:bg-base-200/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs font-bold text-primary">
                      {getCourseCode(c)}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-base-content font-medium">
                      {getCourseName(c)}
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-base-content/60">
                      {c.creditUnit}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-bold text-base-content/40">
                      {c.unitId || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewTab === "lms" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-base-content mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            LMS & Assignments
          </h2>
          {currentTimetable && currentTimetable.entries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentTimetable.entries
                .filter(
                  (e, i, arr) =>
                    arr.findIndex((x) => x.course.courseId === e.course.courseId) === i
                )
                .map((e) => (
                  <div
                    key={e.course.courseId}
                    className="bg-base-200/30 rounded-xl p-4 border border-base-200 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-mono font-bold text-primary">
                          {getCourseCode(e.course)}
                        </p>
                        <p className="text-sm font-semibold text-base-content mt-0.5">
                          {getCourseName(e.course)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          e.type === "LAB"
                            ? "bg-accent/10 text-accent"
                            : "bg-base-200 text-base-content/50"
                        }`}
                      >
                        {e.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-base-content/50">
                      <span>{e.teacherName}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        View LMS
                      </button>
                      <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                        Assignments
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-base-content/40 text-center py-8">
              No published timetable available
            </p>
          )}
        </div>
      )}
    </div>
  );
}