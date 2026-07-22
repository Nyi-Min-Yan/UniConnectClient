"use client";

import { useState, useEffect } from "react";

type Message = {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
};

type Contact = {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMsg: string;
  unread: number;
};

const CONTACTS: Contact[] = [
  { id: 1, name: "Sarah Chen", avatar: "SC", online: true, lastMsg: "See you tomorrow!", unread: 2 },
  { id: 2, name: "Marcus Johnson", avatar: "MJ", online: true, lastMsg: "Thanks for the notes", unread: 0 },
  { id: 3, name: "Emily Rodriguez", avatar: "ER", online: false, lastMsg: "Study group at 2pm?", unread: 1 },
  { id: 4, name: "David Kim", avatar: "DK", online: true, lastMsg: "Great job today!", unread: 0 },
  { id: 5, name: "Lisa Thompson", avatar: "LT", online: false, lastMsg: "Workshop confirmed", unread: 3 },
  { id: 6, name: "Alex Wong", avatar: "AW", online: true, lastMsg: "Let me check", unread: 0 },
];

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Hey! Are you coming to the study session?", sender: "other", time: "10:30 AM" },
    { id: 2, text: "Yes, I'll be there at 2pm!", sender: "me", time: "10:32 AM" },
    { id: 3, text: "Perfect! I'll save you a seat.", sender: "other", time: "10:33 AM" },
    { id: 4, text: "See you tomorrow!", sender: "other", time: "10:35 AM" },
  ],
};

export default function ChatPage() {
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messages, setMessages] = useState<Record<number, Message[]>>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = () => {
    if (!inputText.trim() || !selectedChat) return;
    const newMsg: Message = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }));
    setInputText("");
  };

  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Chat</h1>
        <div className="space-y-4 p-4 bg-base-100 rounded-2xl border border-base-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
              <div className="w-8 h-8 rounded-full skeleton-loader shrink-0" />
              <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end flex flex-col"}`}>
                <div className={`h-10 rounded-2xl skeleton-loader ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                <div className="h-2.5 w-12 skeleton-loader" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] animate-fade-in-up">
      <h1 className="text-xl sm:text-2xl font-bold text-base-content mb-4">Chat</h1>

      <div className="flex h-[calc(100%-3rem)] bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm">
        <div className={`w-full sm:w-72 border-r border-base-200 flex flex-col ${showMobileList ? "block" : "hidden sm:flex"}`}>
          <div className="p-3 border-b border-base-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full px-3 py-2 pl-9 rounded-xl bg-base-200 text-sm text-base-content outline-none placeholder:text-base-content/30 border-none"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => { setSelectedChat(contact.id); setShowMobileList(false); }}
                className={`w-full flex items-center gap-3 p-3 transition-colors hover:bg-base-200 text-left ${
                  selectedChat === contact.id ? "bg-base-200" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center text-white font-semibold text-sm">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-base-content">{contact.name}</p>
                    {contact.unread > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/40 truncate">{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!showMobileList ? "block" : "hidden sm:flex"}`}>
          {selectedChat ? (
            <>
              <div className="flex items-center gap-3 p-3 border-b border-base-200">
                <button
                  className="sm:hidden text-base-content/50"
                  onClick={() => setShowMobileList(true)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center text-white font-semibold text-sm">
                  {CONTACTS.find((c) => c.id === selectedChat)?.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content">{CONTACTS.find((c) => c.id === selectedChat)?.name}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === "me"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-base-200 text-base-content rounded-bl-md"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-white/60" : "text-base-content/40"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-base-200">
                <div className="flex gap-2">
                  <button className="text-base-content/40 hover:text-accent transition-colors p-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-base-200 text-sm text-base-content outline-none placeholder:text-base-content/30 border-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim()}
                    className="p-2 rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-base-content/40">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-3 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
