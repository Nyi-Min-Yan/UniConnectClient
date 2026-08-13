"use client";

import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/useUsers";
import { apiClient } from "@/lib/axios";
import BackButton from "@/components/ui/BackButton";

const ROLES = ["SYSTEM_ADMIN", "STAFF", "STUDENT"] as const;

const ROLE_BADGES: Record<string, string> = {
  SYSTEM_ADMIN: "bg-accent/15 text-accent",
  STAFF: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
};

export default function UsersPage() {
  const { users, isLoading, refreshUsers } = useUsers();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "", roleName: "STAFF" });

  const counts = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.roleName === "SYSTEM_ADMIN").length,
      staff: users.filter((u) => u.roleName === "STAFF").length,
      students: users.filter((u) => u.roleName === "STUDENT").length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q) ||
        u.registrationStatus.toLowerCase().includes(q)
    );
  }, [users, query]);

  const addUser = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/api/users", form);
      setShowAdd(false);
      setForm({ email: "", password: "", roleName: "STAFF" });
      refreshUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/api/users/${userId}/status`, { isActive: !isActive });
      refreshUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">Users</h1>
          </div>
          <p className="text-sm text-base-content/50 mt-0.5">
            {isLoading ? "Loading..." : `${counts.total} total accounts`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border border-error/30 bg-error/10 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-base-content/40 uppercase">Total Users</p>
          <p className="text-2xl font-bold text-base-content mt-1">{counts.total}</p>
        </div>
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-base-content/40 uppercase">Admins</p>
          <p className="text-2xl font-bold text-base-content mt-1">{counts.admins}</p>
        </div>
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-base-content/40 uppercase">Staff</p>
          <p className="text-2xl font-bold text-base-content mt-1">{counts.staff}</p>
        </div>
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-base-content/40 uppercase">Students</p>
          <p className="text-2xl font-bold text-base-content mt-1">{counts.students}</p>
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-base-200 bg-base-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-base-content">All Accounts</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, role, status..."
            className="w-full sm:w-64 px-3 py-1.5 text-sm rounded-lg bg-base-200/50 border border-base-200 text-base-content outline-none focus:border-primary/50 transition-all placeholder:text-base-content/30"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-base-200/30 text-left text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-base-content/50">
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.userId} className="hover:bg-base-200/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-base-content">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${ROLE_BADGES[u.roleName] || "bg-base-200 text-base-content/60"}`}>
                      {u.roleName.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    {u.registrationStatus !== "APPROVED" && (
                      <span className="ml-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 text-amber-700">
                        {u.registrationStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-content/60 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(u.userId, u.isActive)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        u.isActive
                          ? "border-error/30 text-error hover:bg-error/10"
                          : "border-success/30 text-success hover:bg-success/10"
                      }`}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full sm:max-w-md bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
              <h2 className="text-sm font-bold text-base-content">Add New User</h2>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-base-content/60 hover:text-base-content transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-base-content/60">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@unicconnect.edu"
                  className="mt-1 w-full px-4 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-base-content/60">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="mt-1 w-full px-4 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-base-content/60">Role</label>
                <select
                  value={form.roleName}
                  onChange={(e) => setForm({ ...form, roleName: e.target.value })}
                  className="mt-1 w-full px-4 py-2.5 text-sm rounded-xl border border-base-200 bg-base-100 text-base-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addUser}
                disabled={submitting || !form.email || form.password.length < 8}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
