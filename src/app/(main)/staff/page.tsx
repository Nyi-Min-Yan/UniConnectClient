"use client";

import { useState, useMemo } from "react";
import { getStaff, addStaff, type NewStaffInput } from "@/lib/store";
import { type Staff, STAFF_DEPARTMENTS } from "@/lib/data";
import BackButton from "@/components/BackButton";
import ModalPortal from "@/components/ModalPortal";

type StaffTab = "overview" | "departments";

const ROLE_LABELS: Record<Staff["role"], string> = {
  admin: "Administration",
  finance: "Finance",
  sa: "Student Affairs",
  itsm: "IT supporting and maintenance",
};

export default function StaffPage() {
  const [tab, setTab] = useState<StaffTab>("overview");
  const [showModal, setShowModal] = useState(false);
  const [rerender, setRerender] = useState(0);

  const staff = useMemo(() => getStaff(), [rerender]);

  const departments = useMemo(
    () => [...new Set(staff.map((s) => s.department))].sort(),
    [staff]
  );

  const [form, setForm] = useState<NewStaffInput>({
    name: "", email: "", department: STAFF_DEPARTMENTS[0].name, role: "admin", phone: "",
  });

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addStaff(form);
    setShowModal(false);
    setForm({ name: "", email: "", department: STAFF_DEPARTMENTS[0].name, role: "admin", phone: "" });
    setRerender((n) => n + 1);
  };

  const roleColors: Record<Staff["role"], string> = {
    admin: "bg-blue-100 text-blue-700",
    finance: "bg-green-100 text-green-700",
    sa: "bg-purple-100 text-purple-700",
    itsm: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Staff</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            {staff.length} total &middot; {departments.length} departments
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Staff
        </button>
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
              <p className="text-[10px] font-bold text-base-content/40 uppercase">Admin Roles</p>
              <p className="text-2xl font-bold text-base-content mt-1">{staff.filter((s) => s.role === "admin").length}</p>
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-base-content/40 uppercase">Staff IDs</p>
              <p className="text-2xl font-bold text-base-content mt-1">{new Set(staff.map((s) => s.staffId)).size}</p>
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
                    <th className="px-4 py-3">Staff ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {staff.map((s) => (
                    <tr key={s.id} className="hover:bg-base-200/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                            {s.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="font-medium text-base-content text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-base-content/60">{s.staffId}</td>
                      <td className="px-4 py-2.5 text-xs text-base-content/60">{s.department}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[s.role]}`}>
                          {ROLE_LABELS[s.role]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-base-content/40">{s.phone}</td>
                      <td className="px-4 py-2.5 text-xs text-base-content/40">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "departments" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const members = staff.filter((s) => s.department === dept);
            return (
              <div key={dept} className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-base-content">{dept}</h3>
                    <p className="text-[10px] text-base-content/40 mt-0.5">{members.length} staff</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {members.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-base-200/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[8px]">
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-base-content truncate">{s.name}</p>
                        <p className="text-[9px] text-base-content/40 truncate">{s.staffId}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${roleColors[s.role]}`}>
                        {ROLE_LABELS[s.role]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ModalPortal onClose={() => setShowModal(false)}>
          <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 p-5 w-full animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-base-content">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-base-200 text-base-content/40 hover:text-base-content transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. U Kyaw Kyaw" className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. kyaw.kyaw@uni.edu" className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 09-123456789" className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-base-content/60 mb-1 block">Department</label>
                <select value={form.department} onChange={(e) => {
                  const dept = STAFF_DEPARTMENTS.find((d) => d.name === e.target.value);
                  setForm({ ...form, department: e.target.value, role: dept?.id as Staff["role"] || form.role });
                }} className="w-full px-3 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary">
                  {STAFF_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-base-200 text-base-content hover:bg-base-300 transition-all">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name || !form.email} className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Staff
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
