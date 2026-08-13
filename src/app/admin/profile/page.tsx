"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import useSWR from "swr";
import type { UserResponse, StaffResponse } from "@/types";

type Tab = "posts" | "about" | "photos";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("about");

  const { data: me, isLoading: meLoading } = useSWR<UserResponse>("/api/users/me");
  const { data: staffList } = useSWR<StaffResponse[]>("/api/staff");

  const staff = staffList?.find((s) => s.userId === me?.userId) || null;

  if (meLoading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
          <div className="h-32 sm:h-48 skeleton-loader rounded-none" />
          <div className="px-6 pb-6 -mt-12 relative z-10">
            <div className="w-24 h-24 rounded-full skeleton-loader border-4 border-base-100" />
            <div className="mt-3 space-y-2">
              <div className="h-5 w-40 skeleton-loader" />
              <div className="h-3 w-28 skeleton-loader" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = staff?.staffName || me?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const joinedDate = me?.createdAt ? new Date(me.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—";
  const roleLabel = me?.roleName?.replace("_", " ") || "—";
  const unitName = staff?.unitName || "—";

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-base-200 via-primary/20 to-primary/30 rounded-t-2xl relative" />

        <div className="px-4 sm:px-6 pb-6 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-md shrink-0 relative">
              {initials || "U"}
            </div>
            <div className="flex-1 pt-2 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <BackButton />
                    <h1 className="text-xl sm:text-2xl font-bold text-base-content">{displayName}</h1>
                  </div>
                  <p className="text-sm text-base-content/50">{roleLabel} &middot; {unitName}</p>
                </div>
                <Link
                  href="/admin/profile/edit"
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm self-start"
                >
                  Edit Profile
                </Link>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-base-content/50">
                {me?.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {me.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Joined {joinedDate}
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${me?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {me?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {staff?.staffNo && (
            <div className="flex items-center gap-6 mt-5 text-center">
              {[
                { label: "Staff No", value: staff.staffNo },
                { label: "Department", value: unitName },
                { label: "Role", value: roleLabel },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg font-bold text-base-content">{stat.value}</p>
                  <p className="text-xs text-base-content/40">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-base-100 rounded-2xl border border-base-200 p-1 shadow-sm">
        <div className="flex">
          {(["about", "posts", "photos"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-primary text-white shadow-sm"
                  : "text-base-content/50 hover:text-base-content hover:bg-base-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "about" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-4 sm:p-6 shadow-sm space-y-4">
          {[
            { label: "Email", value: me?.email || "—" },
            { label: "Role", value: roleLabel },
            { label: "Department", value: unitName },
            { label: "Staff No", value: staff?.staffNo || "—" },
            { label: "Account Status", value: `${me?.isActive ? "Active" : "Inactive"} · ${me?.registrationStatus || "—"}` },
            { label: "Registered", value: joinedDate },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm text-base-content mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-8 text-center text-sm text-base-content/50">
          No posts yet
        </div>
      )}

      {activeTab === "photos" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gradient-to-br from-base-200 to-primary/20 flex items-center justify-center text-base-content/30 hover:shadow-md transition-shadow cursor-pointer"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
