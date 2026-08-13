"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";

export default function EditProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [form, setForm] = useState({
    displayName: "User",
    email: "student@uni.edu",
    bio: "CS student passionate about AI and web development",
    location: "New York, USA",
    education: "University of Technology - Computer Science (2022-2026)",
    interests: "AI, Web Dev, Robotics, Design",
    website: "",
    phone: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setToast({ visible: true, message: "Profile updated successfully!" });
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
        <div className="flex items-center gap-4 pb-4 border-b border-base-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md shrink-0">
            U
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">Profile Photo</p>
            <p className="text-xs text-base-content/40 mb-2">JPEG, PNG, or GIF. Max 5MB.</p>
            <div className="flex gap-2">
              <button type="button" className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                Upload
              </button>
              <button type="button" className="px-4 py-1.5 text-xs font-medium rounded-lg bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "displayName", label: "Display Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "location", label: "Location", type: "text" },
            { key: "website", label: "Website", type: "url" },
            { key: "education", label: "Education", type: "text" },
          ].map((field) => (
            <div key={field.key} className={field.key === "education" ? "sm:col-span-2" : ""}>
              <label className="text-sm font-medium text-base-content/70 mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-base-content/70 mb-1 block">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-base-content/70 mb-1 block">Interests</label>
          <input
            type="text"
            value={form.interests}
            onChange={(e) => updateField("interests", e.target.value)}
            placeholder="Comma-separated list"
            className="w-full px-4 py-2.5 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
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
            type="success"
            onClose={() => setToast({ visible: false, message: "" })}
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
