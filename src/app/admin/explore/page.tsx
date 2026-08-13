"use client";

import { useState, useMemo } from "react";
import BackButton from "@/components/ui/BackButton";
import { useCourses } from "@/hooks/useAcademic";
import { useOrganizationalUnits } from "@/hooks/useAcademic";
import { useStudents } from "@/hooks/useUsers";
import { useStaff } from "@/hooks/useUsers";

type ExploreCategory = "all" | "courses" | "students" | "staff" | "departments";

type ExploreItem = {
  id: string;
  title: string;
  description: string;
  category: Exclude<ExploreCategory, "all">;
  meta?: string;
  tags: string[];
};

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExploreCategory>("all");

  const { courses, isLoading: coursesLoading } = useCourses();
  const { units, isLoading: unitsLoading } = useOrganizationalUnits();
  const { students, isLoading: studentsLoading } = useStudents();
  const { staff, isLoading: staffLoading } = useStaff();

  const loading = coursesLoading || unitsLoading || studentsLoading || staffLoading;

  const items = useMemo<ExploreItem[]>(() => {
    const unitName = (unitId: string | null) => units.find((u) => u.unitId === unitId)?.unitName || unitId || "—";
    return [
      ...courses.map((c: any) => ({
        id: `c-${c.courseId}`,
        title: c.courseName || c.courseCode,
        description: `${c.courseCode || "—"} · ${c.creditUnit ?? 0} credits`,
        category: "courses" as const,
        meta: unitName(c.unitId || null),
        tags: [c.courseCode || "Course", unitName(c.unitId || null)],
      })),
      ...students.map((s: any) => ({
        id: `s-${s.studentId}`,
        title: s.studentName,
        description: `${s.majorCode || "—"} · Semester ${s.semesterNo ?? "—"} · Section ${s.sectionName || "—"}`,
        category: "students" as const,
        meta: s.rollNo,
        tags: [s.rollNo, s.majorCode || "Student"],
      })),
      ...staff.map((s: any) => ({
        id: `st-${s.staffId}`,
        title: s.staffName,
        description: `${s.staffNo} · ${unitName(s.unitId || null)}`,
        category: "staff" as const,
        meta: s.positions?.[0]?.positionName || "Staff",
        tags: [s.staffNo, s.positions?.[0]?.positionName || "Staff"],
      })),
      ...units.map((u) => ({
        id: `u-${u.unitId}`,
        title: u.unitName,
        description: `${u.unitCode} · ${u.unitType || "Unit"}`,
        category: "departments" as const,
        meta: u.unitType || "Unit",
        tags: [u.unitCode, u.unitType || "Unit"],
      })),
    ];
  }, [courses, units, students, staff]);

  const filtered = items.filter((item) => {
    const matchCategory = category === "all" || item.category === category;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Explore</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses, students, staff, departments..."
          className="w-full px-4 py-3 pl-11 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/30"
        />
        <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["all", "courses", "students", "staff", "departments"] as ExploreCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-all ${
              category === cat
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-5 space-y-3">
              <div className="h-4 w-24 skeleton-loader" />
              <div className="h-3 w-full skeleton-loader" />
              <div className="h-3 w-3/4 skeleton-loader" />
              <div className="flex gap-2">
                <div className="h-5 w-16 skeleton-loader rounded-full" />
                <div className="h-5 w-20 skeleton-loader rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-sm font-medium text-base-content/60">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 rounded-2xl border border-base-200 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-sm font-bold text-base-content group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {item.meta && (
                  <span className="text-[10px] text-base-content/40 bg-base-200 px-2 py-0.5 rounded-full shrink-0">
                    {item.meta}
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/60 leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-base-200 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
