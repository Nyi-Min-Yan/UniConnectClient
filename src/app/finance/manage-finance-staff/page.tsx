"use client";

import { useState, useMemo } from "react";
import { useStaff } from "@/hooks/useUsers";
import { useOrganizationalUnits } from "@/hooks/useAcademic";
import BackButton from "@/components/ui/BackButton";

type StaffTab = "overview" | "departments";

const POSITION_LABELS: Record<string, string> = {
  LECTURER: "Lecturer",
  HOD: "Head of Dept",
  STUDENT_AFFAIRS_OFFICER: "Student Affairs",
  FINANCE_OFFICER: "Finance",
  ADMINISTRATIVE_OFFICER: "Administration",
  SENIOR_CLERK: "Senior Clerk",
  JUNIOR_CLERK: "Junior Clerk",
};

export default function StaffPage() {
  const [tab, setTab] = useState<StaffTab>("overview");

  const { staff, isLoading } = useStaff();
  const { units } = useOrganizationalUnits();

  const departments = useMemo(
    () => [...new Set(staff.map((s) => s.unitName || s.unitId || "Unassigned"))].sort(),
    [staff]
  );

  const departmentStaffCount = (dept: string) =>
    staff.filter((s) => (s.unitName || s.unitId || "Unassigned") === dept).length;

  const roleColors: Record<string, string> = {
    LECTURER: "bg-blue-100 text-blue-700",
    HOD: "bg-accent/15 text-accent",
    FINANCE_OFFICER: "bg-green-100 text-green-700",
    STUDENT_AFFAIRS_OFFICER: "bg-purple-100 text-purple-700",
    ADMINISTRATIVE_OFFICER: "bg-slate-100 text-slate-700",
    SENIOR_CLERK: "bg-amber-100 text-amber-700",
    JUNIOR_CLERK: "bg-orange-100 text-orange-700",
  };

  const primaryPosition = (s: any) => (s.positions?.length ? s.positions[0].positionName : null);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Staff</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            {isLoading ? "Loading..." : `${staff.length} total &middot; ${departments.length} departments`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["overview", "departments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
              tab === t
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {t === "overview" ? "Staff Overview" : "Departments"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-base-content/40 uppercase">Total Staff</p>
              <p className="text-2xl font-bold text-base-content mt-1">{staff.length}</p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-base-content/40 uppercase">Departments</p>
              <p className="text-2xl font-bold text-base-content mt-1">{departments.length}</p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-base-content/40 uppercase">HODs</p>
              <p className="text-2xl font-bold text-base-content mt-1">
                {staff.filter((s) => (s.positions as any[])?.some((p) => p.positionName === "HOD")).length}
              </p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-base-content/40 uppercase">Units</p>
              <p className="text-2xl font-bold text-base-content mt-1">{units.length}</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-base-200 bg-base-200/20">
              <h2 className="text-sm font-bold text-base-content">All Staff Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Staff No</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {isLoading && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" /></td></tr>
                  )}
                  {staff.map((s: any) => {
                    const pos = primaryPosition(s);
                    return (
                      <tr key={s.staffId} className="hover:bg-base-200/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                              {getInitials(s.staffName)}
                            </div>
                            <span className="font-medium text-base-content text-sm">{s.staffName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{s.staffNo}</td>
                        <td className="px-4 py-2.5 text-xs text-base-content/60">{s.unitName || "—"}</td>
                        <td className="px-4 py-2.5">
                          {pos ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[pos] || "bg-base-200 text-base-content/60"}`}>
                              {POSITION_LABELS[pos] || pos}
                            </span>
                          ) : (
                            <span className="text-[10px] text-base-content/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-base-content/40">{s.phoneNo || "—"}</td>
                      </tr>
                    );
                  })}
                  {!isLoading && staff.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-base-content/50">No staff found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "departments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const members = staff.filter((s) => (s.unitName || s.unitId || "Unassigned") === dept);
            return (
              <div key={dept} className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-base-content">{dept}</h3>
                    <p className="text-[10px] text-base-content/40 mt-0.5">{members.length} staff</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {members.map((s: any) => {
                    const pos = primaryPosition(s);
                    return (
                      <div key={s.staffId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200/50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[8px]">
                          {getInitials(s.staffName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-base-content truncate">{s.staffName}</p>
                          <p className="text-[9px] text-base-content/40 truncate">{s.staffNo}</p>
                        </div>
                        {pos && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${roleColors[pos] || "bg-base-200 text-base-content/60"}`}>
                            {POSITION_LABELS[pos] || pos}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}