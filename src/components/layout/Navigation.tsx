"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@/components/ui/ProfileDropdown";

type Role = "teachers" | "students" | "manage" | "student-affire" | "finance" | "admin";

function iconProps(active: boolean) {
  return {
    className: `w-5 h-5 ${active ? "text-white" : "text-base-content/60 group-hover:text-base-content"}`,
    fill: active ? "currentColor" : "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: active ? 0 : 2,
  } as const;
}

function FeedIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
}
function ExploreIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function ChatIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
}
function InboxIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
}
function BellIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
}
function ProfileIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function UsersIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
}
function DocumentIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function ClipboardIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}
function CalendarIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function SettingsIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function LecturerIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
}
function StaffIcon({ active }: { active: boolean }) {
  return <svg {...iconProps(active)}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function SearchIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ active: boolean }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const pageTitleMap: Record<string, string> = {
  feed: "Feed",
  explore: "Explore",
  "roll-call": "Roll Call",
  timetable: "Timetable",
  "exam-results": "Exam Results",
  inbox: "Inbox",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  chat: "Chat",
  students: "Students",
  lecturers: "Lecturers",
  staff: "Staff",
  users: "Users",
  "student-manage": "Students",
  "lecture-manage": "Lecturers",
  "lecturer-manage": "Lecturers",
  "staff-manage": "Staff",
  "manage-staff": "Staff",
  "manage-student-affire": "Staff",
  "manage-finance-staff": "Staff",
};

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return pageTitleMap[last] || last.charAt(0).toUpperCase() + last.slice(1);
}

const sectionsByRole: Record<Role, NavSection[]> = {
  teachers: [
    {
      label: "Campus",
      items: [
        { href: "/teachers/feed", label: "Feed", icon: FeedIcon },
      ],
    },
    {
      label: "Academic",
      items: [
        { href: "/teachers/roll-call", label: "Roll Call", icon: ClipboardIcon },
        { href: "/teachers/timetable", label: "Timetable", icon: CalendarIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/teachers/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/teachers/chat", label: "Chat", icon: ChatIcon },
        { href: "/teachers/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/teachers/profile", label: "Profile", icon: ProfileIcon },
        { href: "/teachers/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  students: [
    {
      label: "Campus",
      items: [
        { href: "/students/feed", label: "Feed", icon: FeedIcon },
        { href: "/students/explore", label: "Explore", icon: ExploreIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/students/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/students/chat", label: "Chat", icon: ChatIcon },
        { href: "/students/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/students/profile", label: "Profile", icon: ProfileIcon },
        { href: "/students/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  manage: [
    {
      label: "Campus",
      items: [
        { href: "/manage/feed", label: "Feed", icon: FeedIcon },
        { href: "/manage/explore", label: "Explore", icon: ExploreIcon },
      ],
    },
    {
      label: "People",
      items: [
        { href: "/manage/lecture-manage", label: "Lecturers", icon: LecturerIcon },
        { href: "/manage/manage-staff", label: "Staff", icon: StaffIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/manage/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/manage/chat", label: "Chat", icon: ChatIcon },
        { href: "/manage/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/manage/profile", label: "Profile", icon: ProfileIcon },
        { href: "/manage/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  "student-affire": [
    {
      label: "Campus",
      items: [
        { href: "/student-affire/feed", label: "Feed", icon: FeedIcon },
        { href: "/student-affire/explore", label: "Explore", icon: ExploreIcon },
      ],
    },
    {
      label: "People",
      items: [
        { href: "/student-affire/student-manage", label: "Students", icon: UsersIcon },
        { href: "/student-affire/manage-student-affire", label: "Staff", icon: StaffIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/student-affire/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/student-affire/chat", label: "Chat", icon: ChatIcon },
        { href: "/student-affire/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/student-affire/profile", label: "Profile", icon: ProfileIcon },
        { href: "/student-affire/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  finance: [
    {
      label: "Campus",
      items: [
        { href: "/finance/feed", label: "Feed", icon: FeedIcon },
        { href: "/finance/explore", label: "Explore", icon: ExploreIcon },
      ],
    },
    {
      label: "People",
      items: [
        { href: "/finance/manage-finance-staff", label: "Staff", icon: StaffIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/finance/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/finance/chat", label: "Chat", icon: ChatIcon },
        { href: "/finance/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/finance/profile", label: "Profile", icon: ProfileIcon },
        { href: "/finance/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
  admin: [
    {
      label: "Campus",
      items: [
        { href: "/admin/feed", label: "Feed", icon: FeedIcon },
        { href: "/admin/explore", label: "Explore", icon: ExploreIcon },
      ],
    },
    {
      label: "People",
      items: [
        { href: "/admin/students", label: "Students", icon: UsersIcon },
        { href: "/admin/lecturers", label: "Lecturers", icon: LecturerIcon },
        { href: "/admin/staff", label: "Staff", icon: StaffIcon },
        { href: "/admin/users", label: "Users", icon: UsersIcon },
      ],
    },
    {
      label: "Academic",
      items: [
        { href: "/admin/timetable", label: "Timetable", icon: CalendarIcon },
        { href: "/admin/exam-results", label: "Exam Results", icon: DocumentIcon },
        { href: "/admin/roll-call", label: "Roll Call", icon: ClipboardIcon },
      ],
    },
    {
      label: "Communication",
      items: [
        { href: "/admin/inbox", label: "Inbox", icon: InboxIcon },
        { href: "/admin/chat", label: "Chat", icon: ChatIcon },
        { href: "/admin/notifications", label: "Notifications", icon: BellIcon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/admin/profile", label: "Profile", icon: ProfileIcon },
        { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
      ],
    },
  ],
};

export default function Navigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = sectionsByRole[role];
  const allItems = sections.flatMap((s) => s.items);
  const logoHref = allItems.find((i) => i.href.endsWith("/feed"))?.href || `/${role}/feed`;
  const pageTitle = getPageTitle(pathname);

  return (
    <>
      {/* Desktop Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-base-100/80 backdrop-blur-md border-b border-base-200 hidden lg:flex items-center justify-between px-6 h-16 ml-64">
        <h1 className="text-lg font-bold text-base-content">{pageTitle}</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search..."
              className="w-56 pl-9 pr-3 py-1.5 text-sm rounded-lg bg-base-200/50 border border-base-200 text-base-content outline-none focus:border-primary/50 focus:bg-base-100 transition-all placeholder:text-base-content/30"
            />
          </div>
          <Link
            href={`/${role}/notifications`}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              pathname === `/${role}/notifications` ? "text-primary bg-primary/10" : "text-base-content/50 hover:bg-base-200"
            }`}
          >
            <BellIcon active={pathname === `/${role}/notifications`} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[9px] font-bold text-white flex items-center justify-center">3</span>
          </Link>
          <ProfileDropdown role={role} />
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-base-100 border-b border-base-200 lg:hidden flex items-center justify-between px-4 h-14">
        <Link href={logoHref} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="text-lg font-bold text-base-content">UniConnect</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href={`/${role}/notifications`}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              pathname === `/${role}/notifications` ? "text-primary bg-primary/10" : "text-base-content/50 hover:bg-base-200"
            }`}
          >
            <BellIcon active={pathname === `/${role}/notifications`} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[9px] font-bold text-white flex items-center justify-center">3</span>
          </Link>
          <ProfileDropdown role={role} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <nav className="fixed top-0 left-0 z-50 h-screen w-64 bg-base-100 border-r border-base-200 hidden lg:flex flex-col shadow-sm">
        <div className="p-5 border-b border-base-200">
          <Link href={logoHref} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-xl font-bold text-base-content">UniConnect</span>
          </Link>
        </div>

        <div className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-[10px] font-bold text-base-content/30 uppercase tracking-widest mb-1">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                      }`}
                    >
                      <item.icon active={isActive} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-base-200">
          <ProfileDropdown role={role} />
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-200 flex lg:hidden justify-around items-center py-2 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {allItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 ${
                isActive ? "text-primary" : "text-base-content/50"
              }`}
            >
              <item.icon active={isActive} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-base-content/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile More Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed bottom-20 left-2 right-2 z-50 bg-base-100 rounded-2xl shadow-xl border border-base-200 p-3 lg:hidden animate-fade-in-up max-h-[60vh] overflow-y-auto">
            <div className="space-y-1">
              {allItems.slice(4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive ? "bg-primary text-white" : "text-base-content/70 hover:bg-base-200"
                    }`}
                  >
                    <item.icon active={isActive} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
