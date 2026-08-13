"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/components/ui/ThemeProvider";

type SettingsSection = "privacy" | "notifications" | "appearance";

const THEMES = [
  { id: "light", label: "Light" },
  { id: "system", label: "System" },
  { id: "dark", label: "Dark" },
] as const;

export default function SettingsPage() {
  const { mode, setMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>("privacy");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Settings</h1>
        </div>
        <div className="bg-base-100 rounded-2xl border border-base-200 p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-28 skeleton-loader" />
                <div className="h-3 w-40 skeleton-loader" />
              </div>
              <div className="w-10 h-6 skeleton-loader rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sections: { id: SettingsSection; label: string }[] = [
    { id: "privacy", label: "Privacy" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
  ];

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Settings</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
              activeSection === s.id
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm">
        {activeSection === "privacy" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-base-content">Privacy Settings</h2>
            {[
              { label: "Profile Visibility", desc: "Who can see your profile", value: "Everyone" },
              { label: "Activity Status", desc: "Show when you're online", value: "On" },
              { label: "Message Requests", desc: "Who can send you messages", value: "Friends" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-base-content">{item.label}</p>
                  <p className="text-xs text-base-content/50">{item.desc}</p>
                </div>
                <span className="text-sm font-medium text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-base-content">Notification Preferences</h2>
            {[
              { label: "Push Notifications", desc: "Receive push notifications" },
              { label: "Email Digest", desc: "Daily email summary" },
              { label: "Message Alerts", desc: "Notify on new messages" },
              { label: "Event Reminders", desc: "Get reminded about events" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-base-content">{item.label}</p>
                  <p className="text-xs text-base-content/50">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                  <div className="w-11 h-6 rounded-full bg-base-200 peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-base-100 after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeSection === "appearance" && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-base-content">Appearance</h2>
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-3 block">Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMode(t.id as typeof mode)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                      mode === t.id
                        ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/30"
                        : "bg-base-100 text-base-content/60 border-base-200 hover:bg-base-200"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      mode === t.id ? "border-white" : "border-base-content/30"
                    }`}>
                      {mode === t.id && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
