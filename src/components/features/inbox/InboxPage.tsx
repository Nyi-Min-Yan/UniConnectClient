"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/ui/BackButton";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";
import ComposeModal from "./ComposeModal";
import EmailViewer from "./EmailViewer";
import type { Email, Folder } from "./types";

const INITIAL_EMAILS: Email[] = [
  { id: 1, from: "University Admin", avatar: "UA", subject: "Exam Schedule Released", preview: "The final examination schedule for the semester has been published...", body: "Dear Student,\n\nThe final examination schedule for the 2026 Spring semester has been published. Please log in to the student portal to view your personalized exam timetable.\n\nMake sure to check for any conflicts and report them to the registrar's office by July 30th.\n\nBest regards,\nUniversity Administration", time: "10m ago", read: false, starred: true, to: "student@uni.edu" },
  { id: 2, from: "Prof. Anderson", avatar: "PA", subject: "Project Feedback", preview: "Great work on your midterm project! Here are some suggestions for improvement...", body: "Hi there,\n\nI've finished reviewing your midterm project. Overall, excellent work! Your approach to the problem was creative and well-executed.\n\nA few suggestions for the final submission:\n1. Add more comprehensive test cases\n2. Consider optimizing the database queries\n3. Include a performance analysis section\n\nLet me know if you have any questions.\n\nBest,\nProf. Anderson", time: "1h ago", read: false, starred: false, to: "student@uni.edu", attachments: [{ name: "feedback.pdf", size: "245 KB" }] },
  { id: 3, from: "Library Services", avatar: "LS", subject: "Book Due Reminder", preview: "This is a reminder that the following books are due for return...", body: "This is a courtesy reminder that the following items are due for return:\n- Introduction to Algorithms (due July 25)\n- Machine Learning: A Probabilistic Perspective (due July 28)\n\nPlease return or renew them to avoid late fees.\n\nLibrary Services", time: "3h ago", read: true, starred: false, to: "student@uni.edu" },
  { id: 4, from: "Student Union", avatar: "SU", subject: "Upcoming Events This Week", preview: "Check out the exciting events we have planned for this week...", body: "Hey everyone!\n\nHere's what's happening this week:\n\nMonday - Movie Night: 7pm in the Auditorium\nWednesday - Guest Lecture: AI Ethics at 3pm\nFriday - Sports Day: 10am at the Field\nSaturday - Charity Gala: 6pm at the Grand Hall\n\nSee you there!\nStudent Union", time: "5h ago", read: true, starred: true, to: "student@uni.edu" },
  { id: 5, from: "Career Services", avatar: "CS", subject: "Internship Opportunity", preview: "We have an exciting internship opportunity at Google for CS students...", body: "Dear Student,\n\nWe are pleased to announce that Google is offering summer internship positions for Computer Science students. This is a fantastic opportunity to gain industry experience.\n\nRequirements:\n- Currently enrolled in a CS program\n- Strong programming skills\n- Available for 12 weeks\n\nApply by August 15th through the career portal.\n\nCareer Services", time: "1d ago", read: true, starred: false, to: "student@uni.edu" },
  { id: 6, from: "Scholarship Committee", avatar: "SC", subject: "Application Status Update", preview: "Your scholarship application has been received and is under review...", body: "Dear Applicant,\n\nYour scholarship application for the 2026-2027 academic year has been received successfully. We are currently reviewing all applications.\n\nYou can expect to hear back from us within 4-6 weeks. Shortlisted candidates will be contacted for an interview.\n\nGood luck!\nScholarship Committee", time: "2d ago", read: true, starred: false, to: "student@uni.edu" },
  { id: 7, from: "Sports Club", avatar: "SP", subject: "Tryout Announcement", preview: "Basketball team tryouts will be held this Saturday at 10am...", body: "Attention all athletes!\n\nThe university basketball team is holding open tryouts this Saturday at 10am in the Sports Complex.\n\nWhat to bring:\n- Athletic wear\n- Water bottle\n- Your A-game!\n\nAll skill levels welcome.\n\nGo Team!", time: "3d ago", read: true, starred: false, to: "student@uni.edu" },
  { id: 8, from: "Research Dept", avatar: "RD", subject: "Research Assistant Position", preview: "We are looking for a research assistant for the Spring semester...", body: "The Department of Computer Science is looking for a research assistant to work on a project about Natural Language Processing.\n\nResponsibilities:\n- Literature review\n- Data collection and preprocessing\n- Model implementation and evaluation\n\nIf interested, please send your CV and transcript to research@uni.edu.\n\nResearch Department", time: "4d ago", read: true, starred: true, to: "student@uni.edu" },
];

const sentEmails: Email[] = [
  { id: 101, from: "Me", avatar: "U", subject: "Re: Project Feedback", preview: "Thank you for the detailed feedback...", body: "Dear Prof. Anderson,\n\nThank you for the detailed feedback on my project. I'll work on the suggestions and submit the final version by the deadline.\n\nBest regards", time: "30m ago", read: true, starred: false, to: "Prof. Anderson" },
];

const draftEmails: Email[] = [
  { id: 201, from: "Me", avatar: "U", subject: "Draft: Research Proposal", preview: "Dear Committee, I am writing to submit my research proposal...", body: "Dear Committee,\n\nI am writing to submit my research proposal for the upcoming semester...", time: "1d ago", read: true, starred: false, to: "Research Committee" },
];

export default function InboxPage() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [folder, setFolder] = useState<Folder>("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Email | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: "success" | "error" }>({ visible: false, message: "" });
  const [showCompose, setShowCompose] = useState(false);
  const [composeMode, setComposeMode] = useState<"compose" | "reply" | "replyAll" | "forward">("compose");
  const [composePrefill, setComposePrefill] = useState<{ to?: string; subject?: string; body?: string }>({});
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmails(INITIAL_EMAILS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getFolderEmails = (): Email[] => {
    switch (folder) {
      case "inbox": return emails.filter((e) => !e.from.startsWith("Me"));
      case "sent": return sentEmails;
      case "draft": return draftEmails;
      case "starred": return emails.filter((e) => e.starred);
      case "trash": return [];
    }
  };

  const folderEmails = getFolderEmails();
  const unreadCount = emails.filter((e) => !e.read).length;

  const toggleStar = (id: number) => {
    setEmails(emails.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  };

  const markRead = (id: number) => {
    setEmails(emails.map((e) => (e.id === id ? { ...e, read: true } : e)));
  };

  const deleteEmail = (id: number) => {
    setEmails(emails.filter((e) => e.id !== id));
    setDeleteTarget(null);
    if (selectedEmail?.id === id) setSelectedEmail(null);
    setToast({ visible: true, message: "Message deleted", type: "success" });
  };

  const openEmail = (email: Email) => {
    markRead(email.id);
    setSelectedEmail(email);
    setShowMobileList(false);
  };

  const handleSend = (data: { to: string; subject: string }) => {
    setToast({ visible: true, message: `Message sent to ${data.to}`, type: "success" });
  };

  const handleReply = (email: Email) => {
    setComposeMode("reply");
    setComposePrefill({ to: email.from, subject: `Re: ${email.subject}`, body: `\n\n--- Original message ---\n${email.body}` });
    setShowCompose(true);
  };

  const handleReplyAll = (email: Email) => {
    setComposeMode("replyAll");
    setComposePrefill({ to: email.from, subject: `Re: ${email.subject}`, body: `\n\n--- Original message ---\n${email.body}` });
    setShowCompose(true);
  };

  const handleForward = (email: Email) => {
    setComposeMode("forward");
    setComposePrefill({ subject: `Fwd: ${email.subject}`, body: `\n\n--- Forwarded message ---\nFrom: ${email.from}\nSubject: ${email.subject}\n${email.body}` });
    setShowCompose(true);
  };

  const sidebarItems: { key: Folder; label: string; icon: string; count?: number }[] = [
    { key: "inbox" as Folder, label: "Inbox", icon: "inbox", count: unreadCount },
    { key: "sent" as Folder, label: "Sent", icon: "sent" },
    { key: "draft" as Folder, label: "Draft", icon: "draft", count: draftEmails.length },
    { key: "starred" as Folder, label: "Starred", icon: "starred" },
    { key: "trash" as Folder, label: "Trash", icon: "trash" },
  ];

  const renderFolderIcon = (icon: string, active: boolean) => {
    const cls = `w-4 h-4 ${active ? "text-primary" : "text-base-content/40"}`;
    switch (icon) {
      case "inbox": return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
      case "sent": return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>;
      case "draft": return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
      case "starred": return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
      case "trash": return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Inbox</h1>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-base-100 rounded-2xl border border-base-200 p-4 flex gap-3">
            <div className="w-10 h-10 rounded-full skeleton-loader shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 skeleton-loader" />
              <div className="h-3 w-full skeleton-loader" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Inbox</h1>
      </div>

      {/* Desktop: 3-column layout */}
      <div className="hidden lg:flex h-[calc(100vh-12rem)] bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
        {/* Left Sidebar */}
        <div className="w-52 border-r border-base-200 flex flex-col">
          <div className="p-3">
            <button onClick={() => { setComposeMode("compose"); setComposePrefill({}); setShowCompose(true); }} className="w-full py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Compose
            </button>
          </div>
          <div className="flex-1 space-y-0.5 px-2 pb-3">
            {sidebarItems.map((item) => {
              const active = folder === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setFolder(item.key); setSelectedEmail(null); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active ? "bg-primary/10 text-primary font-semibold" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  {renderFolderIcon(item.icon, active)}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count ? <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{item.count}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Message List */}
        <div className="w-80 border-r border-base-200 flex flex-col">
          <div className="p-3 border-b border-base-200">
            <input type="text" placeholder="Search messages..." className="w-full px-3 py-1.5 pl-8 rounded-lg bg-base-200/50 text-sm text-base-content outline-none placeholder:text-base-content/30 border-none" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-base-200">
            {folderEmails.length === 0 ? (
              <div className="p-6 text-center text-xs text-base-content/30">No messages</div>
            ) : (
              folderEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className={`flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-base-200 ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                    } ${!email.read ? "bg-base-200/50" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-semibold text-xs shrink-0">
                      {email.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${!email.read ? "font-bold" : "font-medium"} text-base-content truncate`}>{email.from}</p>
                        <span className="text-[9px] text-base-content/30 shrink-0">{email.time}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${!email.read ? "font-semibold" : ""} text-base-content/70 truncate`}>{email.subject}</p>
                      <p className="text-[10px] text-base-content/40 mt-0.5 truncate">{email.preview}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }} className={`shrink-0 transition-colors ${email.starred ? "text-primary" : "text-base-content/20 hover:text-primary"}`}>
                      <svg className="w-3.5 h-3.5" fill={email.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Email Preview */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <EmailViewer
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
              onReply={handleReply}
              onReplyAll={handleReplyAll}
              onForward={handleForward}
              onDelete={deleteEmail}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-3 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-base-content/40">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet */}
      <div className="lg:hidden">
        {selectedEmail && !showMobileList ? (
          <EmailViewer
            email={selectedEmail}
            onBack={() => { setSelectedEmail(null); setShowMobileList(true); }}
            onReply={handleReply}
            onReplyAll={handleReplyAll}
            onForward={handleForward}
            onDelete={deleteEmail}
          />
        ) : (
          <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
            {/* Mobile folder tabs */}
            <div className="flex gap-1 p-2 border-b border-base-200 overflow-x-auto">
              {sidebarItems.map((item) => {
                const active = folder === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setFolder(item.key); setSelectedEmail(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      active ? "bg-primary text-white" : "text-base-content/60 hover:bg-base-200"
                    }`}
                  >
                    {renderFolderIcon(item.icon, active)}
                    {item.label}
                    {item.count ? <span className="text-[9px] font-bold ml-0.5">({item.count})</span> : null}
                  </button>
                );
              })}
            </div>
            <div className="divide-y divide-base-200">
              {folderEmails.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-base-content/40">No messages</p>
                </div>
              ) : (
                folderEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-base-200 ${
                      !email.read ? "bg-base-200/70" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {email.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${!email.read ? "font-bold" : "font-medium"} text-base-content`}>{email.from}</p>
                        <span className="text-[10px] text-base-content/40 shrink-0">{email.time}</span>
                      </div>
                      <p className={`text-sm mt-0.5 ${!email.read ? "font-semibold" : ""} text-base-content/80`}>{email.subject}</p>
                      <p className="text-xs text-base-content/40 mt-0.5 truncate">{email.preview}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }} className={`transition-colors ${email.starred ? "text-primary" : "text-base-content/20 hover:text-primary"}`}>
                        <svg className="w-4 h-4" fill={email.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(email); }} className="text-base-content/20 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ComposeModal
        visible={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSend}
        mode={composeMode}
        initialTo={composePrefill.to}
        initialSubject={composePrefill.subject}
        initialBody={composePrefill.body}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type || "success"}
        onClose={() => setToast({ visible: false, message: "" })}
      />

      <ConfirmModal
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        visible={deleteTarget !== null}
        onConfirm={() => deleteEmail(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
