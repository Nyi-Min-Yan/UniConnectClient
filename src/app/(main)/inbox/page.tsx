"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";

type Email = {
  id: number;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
  starred: boolean;
};

type ExamResultItem = {
  id: number;
  course: string;
  fileName: string;
  semester: number;
  year: string;
  receivedAt: string;
  viewed: boolean;
};

const EMAILS: Email[] = [
  { id: 1, from: "University Admin", avatar: "UA", subject: "Exam Schedule Released", preview: "The final examination schedule for the semester has been published...", body: "Dear Student,\n\nThe final examination schedule for the 2026 Spring semester has been published. Please log in to the student portal to view your personalized exam timetable.\n\nMake sure to check for any conflicts and report them to the registrar's office by July 30th.\n\nBest regards,\nUniversity Administration", time: "10m ago", read: false, starred: true },
  { id: 2, from: "Prof. Anderson", avatar: "PA", subject: "Project Feedback", preview: "Great work on your midterm project! Here are some suggestions for improvement...", body: "Hi there,\n\nI've finished reviewing your midterm project. Overall, excellent work! Your approach to the problem was creative and well-executed.\n\nA few suggestions for the final submission:\n1. Add more comprehensive test cases\n2. Consider optimizing the database queries\n3. Include a performance analysis section\n\nLet me know if you have any questions.\n\nBest,\nProf. Anderson", time: "1h ago", read: false, starred: false },
  { id: 3, from: "Library Services", avatar: "LS", subject: "Book Due Reminder", preview: "This is a reminder that the following books are due for return...", body: "This is a courtesy reminder that the following items are due for return:\n- Introduction to Algorithms (due July 25)\n- Machine Learning: A Probabilistic Perspective (due July 28)\n\nPlease return or renew them to avoid late fees.\n\nLibrary Services", time: "3h ago", read: true, starred: false },
  { id: 4, from: "Student Union", avatar: "SU", subject: "Upcoming Events This Week", preview: "Check out the exciting events we have planned for this week...", body: "Hey everyone!\n\nHere's what's happening this week:\n\nMonday - Movie Night: 7pm in the Auditorium\nWednesday - Guest Lecture: AI Ethics at 3pm\nFriday - Sports Day: 10am at the Field\nSaturday - Charity Gala: 6pm at the Grand Hall\n\nSee you there!\nStudent Union", time: "5h ago", read: true, starred: true },
  { id: 5, from: "Career Services", avatar: "CS", subject: "Internship Opportunity", preview: "We have an exciting internship opportunity at Google for CS students...", body: "Dear Student,\n\nWe are pleased to announce that Google is offering summer internship positions for Computer Science students. This is a fantastic opportunity to gain industry experience.\n\nRequirements:\n- Currently enrolled in a CS program\n- Strong programming skills\n- Available for 12 weeks\n\nApply by August 15th through the career portal.\n\nCareer Services", time: "1d ago", read: true, starred: false },
  { id: 6, from: "Scholarship Committee", avatar: "SC", subject: "Application Status Update", preview: "Your scholarship application has been received and is under review...", body: "Dear Applicant,\n\nYour scholarship application for the 2026-2027 academic year has been received successfully. We are currently reviewing all applications.\n\nYou can expect to hear back from us within 4-6 weeks. Shortlisted candidates will be contacted for an interview.\n\nGood luck!\nScholarship Committee", time: "2d ago", read: true, starred: false },
  { id: 7, from: "Sports Club", avatar: "SP", subject: "Tryout Announcement", preview: "Basketball team tryouts will be held this Saturday at 10am...", body: "Attention all athletes!\n\nThe university basketball team is holding open tryouts this Saturday at 10am in the Sports Complex.\n\nWhat to bring:\n- Athletic wear\n- Water bottle\n- Your A-game!\n\nAll skill levels welcome.\n\nGo Team!", time: "3d ago", read: true, starred: false },
  { id: 8, from: "Research Dept", avatar: "RD", subject: "Research Assistant Position", preview: "We are looking for a research assistant for the Spring semester...", body: "The Department of Computer Science is looking for a research assistant to work on a project about Natural Language Processing.\n\nResponsibilities:\n- Literature review\n- Data collection and preprocessing\n- Model implementation and evaluation\n\nIf interested, please send your CV and transcript to research@uni.edu.\n\nResearch Department", time: "4d ago", read: true, starred: true },
];

const EXAM_RESULTS: ExamResultItem[] = [
  { id: 1, course: "Data Structures", fileName: "UCSTGO-0001_DS_Final.pdf", semester: 4, year: "2025-2026", receivedAt: "2h ago", viewed: false },
  { id: 2, course: "Algorithms", fileName: "UCSTGO-0002_Algo_Midterm.pdf", semester: 4, year: "2025-2026", receivedAt: "2h ago", viewed: false },
  { id: 3, course: "Database Systems", fileName: "UCSTGO-0003_DB_Quiz1.pdf", semester: 3, year: "2025-2026", receivedAt: "2h ago", viewed: true },
  { id: 4, course: "Computer Networks", fileName: "UCSTGO-0004_Net_Final.pdf", semester: 5, year: "2025-2026", receivedAt: "1d ago", viewed: true },
  { id: 5, course: "Operating Systems", fileName: "UCSTGO-0005_OS_Midterm.pdf", semester: 5, year: "2025-2026", receivedAt: "1d ago", viewed: true },
];

export default function InboxPage() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [examResults, setExamResults] = useState<ExamResultItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "exams">("all");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamResultItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Email | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmails(EMAILS);
      setExamResults(EXAM_RESULTS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredEmails = emails.filter((e) => {
    if (filter === "unread") return !e.read;
    if (filter === "starred") return e.starred;
    return true;
  });

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
    setToast({ visible: true, message: "Message deleted" });
  };

  const openEmail = (email: Email) => {
    markRead(email.id);
    setSelectedEmail(email);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Inbox</h1>
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Inbox</h1>
        <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
          Compose
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "unread", "starred", "exams"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
              filter === f
                ? "bg-primary text-white shadow-sm"
                : "bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200"
            }`}
          >
            {f === "exams" ? "Exam Results" : f}
            {f === "unread" && ` (${emails.filter((e) => !e.read).length})`}
            {f === "exams" && ` (${examResults.filter((e) => !e.viewed).length})`}
          </button>
        ))}
      </div>

      {filter === "exams" ? (
        selectedExam ? (
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-base-200">
              <button
                onClick={() => setSelectedExam(null)}
                className="flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-base-content">{selectedExam.course} - Result</p>
                  <p className="text-xs text-base-content/40">Received {selectedExam.receivedAt}</p>
                </div>
              </div>
              <div className="bg-base-200/50 rounded-xl p-4">
                <p className="text-xs font-medium text-base-content/60 mb-1">File</p>
                <p className="text-sm font-medium text-base-content">{selectedExam.fileName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-base-200/30 rounded-xl p-3">
                  <p className="text-xs text-base-content/40">Semester</p>
                  <p className="font-semibold text-base-content">{selectedExam.semester}</p>
                </div>
                <div className="bg-base-200/30 rounded-xl p-3">
                  <p className="text-xs text-base-content/40">Academic Year</p>
                  <p className="font-semibold text-base-content">{selectedExam.year}</p>
                </div>
              </div>
              <button className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm divide-y divide-base-200">
            {examResults.length === 0 ? (
              <div className="p-8 text-center text-base-content/40">
                <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium">No exam results yet</p>
              </div>
            ) : (
              examResults.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => { setSelectedExam(exam); setExamResults(examResults.map((e) => e.id === exam.id ? { ...e, viewed: true } : e)); }}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-base-200 ${
                    !exam.viewed ? "bg-base-200/70" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    !exam.viewed ? "bg-primary text-white" : "bg-base-200 text-base-content/50"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!exam.viewed ? "font-bold" : "font-medium"} text-base-content`}>
                        {exam.course}
                      </p>
                      <span className="text-[10px] text-base-content/40 shrink-0">{exam.receivedAt}</span>
                    </div>
                    <p className="text-xs text-base-content/50 mt-0.5 truncate">{exam.fileName}</p>
                    <p className="text-[10px] text-base-content/40 mt-0.5">Sem {exam.semester} &middot; {exam.year}</p>
                  </div>
                  {!exam.viewed && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        )
      ) : selectedEmail ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm animate-fade-in-up">
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <button
              onClick={() => setSelectedEmail(null)}
              className="flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-base-content transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleStar(selectedEmail.id)}
                className={`p-2 rounded-lg hover:bg-base-200 transition-colors ${selectedEmail.starred ? "text-primary" : "text-base-content/30"}`}
              >
                <svg className="w-4 h-4" fill={selectedEmail.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button
                onClick={() => setDeleteTarget(selectedEmail)}
                className="p-2 rounded-lg hover:bg-red-50 text-base-content/30 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-base-200 to-primary flex items-center justify-center text-white font-semibold text-sm">
                {selectedEmail.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-base-content">{selectedEmail.from}</p>
                <p className="text-xs text-base-content/40">{selectedEmail.time}</p>
              </div>
            </div>
            <h2 className="text-lg font-bold text-base-content mb-3">{selectedEmail.subject}</h2>
            <div className="text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
              {selectedEmail.body}
            </div>
          </div>

          <div className="p-4 border-t border-base-200 flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm">
              Reply
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-xl bg-base-100 text-base-content/60 border border-base-200 hover:bg-base-200 transition-colors">
              Forward
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm divide-y divide-base-200">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-base-content/40">
              <svg className="w-12 h-12 mx-auto mb-2 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">No {filter} messages</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
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
                    <p className={`text-sm ${!email.read ? "font-bold" : "font-medium"} text-base-content`}>
                      {email.from}
                    </p>
                    <span className="text-[10px] text-base-content/40 shrink-0">{email.time}</span>
                  </div>
                  <p className={`text-sm mt-0.5 ${!email.read ? "font-semibold" : ""} text-base-content/80`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-base-content/40 mt-0.5 truncate">{email.preview}</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                    className={`transition-colors ${email.starred ? "text-primary" : "text-base-content/20 hover:text-primary"}`}
                  >
                    <svg className="w-4 h-4" fill={email.starred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(email);
                    }}
                    className="text-base-content/20 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type="success"
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
