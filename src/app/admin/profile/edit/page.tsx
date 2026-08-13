"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { apiClient } from "@/lib/axios";
import useSWR from "swr";
import type { UserResponse } from "@/types";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: me } = useSWR<UserResponse>("/api/users/me");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string> = { email: form.email || me?.email || "" };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      await apiClient.patch("/api/users/me", payload);
      setToast({ visible: true, message: "Profile updated successfully!", type: "success" });
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      setToast({
        visible: true,
        message: err?.response?.data?.message || err?.response?.data?.error || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-base-200 text-base-content/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm space-y-6">
        <div>
          <label className="text-sm font-medium text-base-content/70 mb-1 block">Email</label>
          <input
            type="email"
            value={form.email || me?.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="border-t border-base-200 pt-5">
          <h2 className="text-sm font-bold text-base-content mb-3">Change Password</h2>
          <p className="text-xs text-base-content/40 mb-4">Leave blank to keep your current password.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1 block">Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => updateField("currentPassword", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1 block">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          {form.newPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-xs text-error mt-2">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || (form.newPassword !== form.confirmPassword)}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ visible: false, message: "", type: "success" })}
          />
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
