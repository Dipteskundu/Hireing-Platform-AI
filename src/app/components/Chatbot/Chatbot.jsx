"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Mic,
  Paperclip,
  Send,
  Sparkles,
  UserRound,
  X,
  Zap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { askChatbot } from "../../lib/chatbotClient";
import { API_BASE } from "../../lib/apiClient";
import {
  assistantPrompts,
  assistantQuickActions,
  assistantQuickActionsByRole,
  determineRole,
} from "../../lib/siteNavigation";

/* ─── icon map ─── */
const actionIconMap = {
  "/jobs": Briefcase,
  "/resume": FileText,
  "/skill-gap-detection": Sparkles,
  "/skill-test": Zap,
  "/dashboard": LayoutDashboard,
  "/companies": Building2,
  "/profile": UserRound,
};

/* ─── action card colour map ─── */
const actionColorMap = {
  "/resume": { bg: "#eef2ff", icon: "#6366f1", border: "#c7d2fe" },
  "/skill-gap-detection": { bg: "#f5f3ff", icon: "#8b5cf6", border: "#ddd6fe" },
  "/jobs": { bg: "#eff6ff", icon: "#3b82f6", border: "#bfdbfe" },
  "/skill-test": { bg: "#fef9c3", icon: "#ca8a04", border: "#fde68a" },
  "/dashboard": { bg: "#f0fdf4", icon: "#16a34a", border: "#bbf7d0" },
  "/companies": { bg: "#fff7ed", icon: "#ea580c", border: "#fed7aa" },
  "/profile": { bg: "#fdf4ff", icon: "#a21caf", border: "#f5d0fe" },
};

/* ─── skill badge colours ─── */
const badgeStyle = {
  EXPERT:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  "GAP FOUND": { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  EMERGING:  { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

/* ─── skill icon colours ─── */
const skillIconStyle = {
  EXPERT:    { color: "#2563eb", Icon: CheckCircle2 },
  "GAP FOUND": { color: "#d97706", Icon: AlertCircle },
  EMERGING:  { color: "#7c3aed", Icon: Zap },
};

/* ─── fallback logic ─── */
const defaultReply = {
  text: "I can help with internal SkillMatch features, navigation, and read-only summaries already stored in the platform.",
  actions: assistantQuickActions.slice(0, 2),
};

function getFallbackReply(input, isAuthenticated) {
  const n = String(input || "").toLowerCase();

  if (n.includes("hello") || n.includes("hi") || n.includes("hey")) {
    return {
      text: isAuthenticated
        ? "Hi! I can help with platform features, your dashboard data, resume summary, and stored skill-gap information."
        : "Hi! Sign in to ask about your account data, or ask me for platform feature-help and navigation guidance.",
      actions: assistantQuickActions.slice(0, 2),
    };
  }
  if (n.includes("resume") || n.includes("cv") || n.includes("upload")) {
    return {
      text: "Use the resume page to upload your file. The platform stores a resume summary and can use it in skill-gap guidance.",
      actions: assistantQuickActions.filter((a) =>
        ["/resume", "/skill-gap-detection"].includes(a.href),
      ),
    };
  }
  if (n.includes("skill") || n.includes("gap") || n.includes("test")) {
    return {
      text: "Use skill test to assess your level, then check skill-gap detection to review missing skills and stored recommendations.",
      actions: assistantQuickActions.filter((a) =>
        ["/skill-test", "/skill-gap-detection"].includes(a.href),
      ),
    };
  }
  if (n.includes("job") || n.includes("role") || n.includes("search")) {
    return {
      text: "Use the jobs page to browse openings, save roles, and compare them with your skills.",
      actions: assistantQuickActions.filter((a) =>
        ["/jobs", "/skill-gap-detection"].includes(a.href),
      ),
    };
  }
  return defaultReply;
}

function getWelcomeMessage(isAuthenticated) {
  return isAuthenticated
    ? "Hello! I'm your **SkillMatch AI** curator. I've analyzed 2,400+ career trajectories this morning. How can I assist with your professional growth today?"
    : "Hello! I'm your **SkillMatch AI** curator. Sign in to unlock personalized career insights, or ask me anything about the platform!";
}

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2 mb-1">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
      >
        AI
      </div>
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ─── Render bold markdown (**text**) ─── */
function RenderText({ text }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ─── Skill Gap Matrix card ─── */
function SkillGapMatrix({ skills }) {
  return (
    <div
      className="mt-2 rounded-2xl overflow-hidden"
      style={{ border: "1px solid #e5e7eb", background: "#fff" }}
    >
      {skills.map((skill, i) => {
        const badge = badgeStyle[skill.level] || badgeStyle.EXPERT;
        const { Icon, color } = skillIconStyle[skill.level] || skillIconStyle.EXPERT;
        return (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: i < skills.length - 1 ? "1px solid #f3f4f6" : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" style={{ color }} />
              <span className="text-sm font-medium text-gray-800">{skill.name}</span>
            </div>
            <span
              className="text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-full"
              style={{
                color: badge.color,
                background: badge.bg,
                border: `1px solid ${badge.border}`,
              }}
            >
              {skill.level}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Chatbot() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const role = determineRole(user);
  const roleActions =
    assistantQuickActionsByRole[role] || assistantQuickActionsByRole.guest;

  // Prevent SSR issues
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: getWelcomeMessage(isAuthenticated),
      actions: assistantQuickActions.slice(0, 2),
    },
  ]);

  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected'
  const [messageCount, setMessageCount] = useState(1);

  // Only render after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update message count
  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        setConnectionStatus(response.ok ? 'connected' : 'disconnected');
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdRef = useRef(1);

  /* sync welcome message on auth change */
  useEffect(() => {
    setMessages((cur) => {
      if (!cur.length || cur[0].id !== "welcome") return cur;
      const next = [...cur];
      next[0] = {
        ...next[0],
        text: getWelcomeMessage(isAuthenticated),
        actions: roleActions.slice(0, 2),
      };
      return next;
    });
  }, [isAuthenticated, roleActions]);

  /* auto-scroll */
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  /* focus input on open */
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const askAssistantApi = useCallback(
    async (prompt, history = []) => {
      if (!isAuthenticated) return getFallbackReply(prompt, false).text;

      try {
        const payload = await askChatbot(prompt, { history });
        const text = String(payload?.answer || "").trim();
        if (!text) throw new Error("Empty answer");

        // Check if the response contains skill gap information
        const hasSkillGap = text.toLowerCase().includes('skill gap') ||
                           text.toLowerCase().includes('missing skills') ||
                           text.toLowerCase().includes('learning suggestions');

        return {
          text,
          skillGaps: hasSkillGap ? [
            { name: "JavaScript", level: "EXPERT" },
            { name: "React", level: "EXPERT" },
            { name: "Node.js", level: "GAP FOUND" },
            { name: "Python", level: "EMERGING" },
          ] : null
        };
      } catch (error) {
        console.error('Chatbot API error:', error);
        throw error;
      }
    },
    [isAuthenticated],
  );

  const submitPrompt = useCallback(
    async (rawPrompt) => {
      const prompt = String(rawPrompt || "").trim();
      if (!prompt || isResponding) return;

      const nextId = messageIdRef.current++;
      setMessages((cur) => [
        ...cur,
        { id: `${nextId}-user`, role: "user", text: prompt, timestamp: new Date() },
      ]);
      setInput("");
      setOpen(true);
      setIsResponding(true);

      try {
        const historyForApi = [...messages, { role: "user", text: prompt }]
          .slice(-5)
          .map((m) => ({ role: m.role, text: m.text }));

        const assistantResponse = await askAssistantApi(prompt, historyForApi);
        const assistantText = typeof assistantResponse === 'string' ? assistantResponse : assistantResponse.text;
        const skillGaps = typeof assistantResponse === 'object' ? assistantResponse.skillGaps : null;

        setMessages((cur) => [
          ...cur,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: assistantText,
            actions: roleActions.slice(0, 2),
            skillGaps,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Chatbot error:', error);
        const errorMessage = error.message?.includes('sign in')
          ? 'Please sign in to ask account-specific questions.'
          : connectionStatus === 'disconnected'
          ? 'Unable to connect to the assistant service. Please check your connection and try again.'
          : 'I encountered an error while processing your request. Please try again.';

        setMessages((cur) => [
          ...cur,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: errorMessage,
            actions: roleActions.slice(0, 2),
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsResponding(false);
      }
    },
    [askAssistantApi, isAuthenticated, isResponding, messages, roleActions],
  );

  /* keyboard shortcuts */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isResponding) {
        e.preventDefault();
        submitPrompt(input);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, input, isResponding, submitPrompt]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  /* today label */
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: undefined,
    month: "short",
    day: "numeric",
  });

  // Prevent SSR issues - only render after hydration
  if (!mounted) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .chat-slide-up { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .msg-fade-in   { animation: fadeIn  0.22s ease forwards; }
        .chat-scrollbar::-webkit-scrollbar       { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .quick-chip:hover { background: #e0e7ff !important; border-color: #a5b4fc !important; color: #4338ca !important; }
        .action-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.12); border-color: #a5b4fc !important; }
        .send-btn:not(:disabled):hover { filter: brightness(1.1); }
      `}</style>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="pointer-events-auto flex max-w-md flex-col items-end gap-3">

          {/* ── Chat Panel ── */}
          {open && (
            <section
              className="chat-slide-up relative flex flex-col overflow-hidden rounded-3xl"
              style={{
                width: "min(95vw, 26rem)",
                maxHeight: "calc(100dvh - 7rem)",
                background: "#f8f9fb",
                border: "1px solid #e5e7eb",
                boxShadow: "0 24px 64px -8px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              {/* ── Header ── */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  background: "#fff",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold shadow-md"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">SkillMatch AI</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-emerald-400' :
                        connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                        'bg-red-400'
                      }`}
                    />
                    {connectionStatus === 'connected' ? 'Online' :
                     connectionStatus === 'connecting' ? 'Connecting' :
                     'Offline'} · {messageCount} messages
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Messages ── */}
              <div
                ref={scrollRef}
                className="chat-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-4"
                style={{ background: "#f8f9fb" }}
              >
                {/* TODAY separator */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase">
                    Today
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {messages.map((message, idx) => (
                  <div
                    key={message.id}
                    className={`msg-fade-in flex ${message.role === "assistant" ? "justify-start" : "justify-end"} items-end gap-2`}
                    style={{ animationDelay: `${idx * 25}ms` }}
                  >
                    {/* ── Assistant message ── */}
                    {message.role === "assistant" ? (
                      <>
                        {/* Bot avatar */}
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold shadow self-start mt-0.5"
                          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                        >
                          AI
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Bubble */}
                          <div
                            className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm relative group"
                            style={{
                              background: "#fff",
                              border: "1px solid #e5e7eb",
                              maxWidth: "100%",
                            }}
                          >
                            <button
                              onClick={() => copyToClipboard(message.text)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100"
                              title="Copy message"
                            >
                              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <p className="text-sm leading-6 text-gray-700 whitespace-pre-line pr-6">
                              <RenderText text={message.text} />
                            </p>
                            {/* Timestamp */}
                            <div className="text-[10px] text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                          </div>

                          {/* Action cards (2-column grid) */}
                          {message.actions?.length ? (
                            <div className="grid grid-cols-2 gap-2">
                              {message.actions.map((action) => {
                                const Icon = actionIconMap[action.href] || Sparkles;
                                const colors = actionColorMap[action.href] || {
                                  bg: "#f3f4f6",
                                  icon: "#6b7280",
                                  border: "#e5e7eb",
                                };
                                return (
                                  <button
                                    key={`${message.id}-${action.href}`}
                                    type="button"
                                    onClick={() => handleActionClick(action.href)}
                                    className="action-card flex flex-col items-start gap-2 rounded-2xl p-3 text-left transition-all"
                                    style={{
                                      background: "#fff",
                                      border: `1px solid #e5e7eb`,
                                    }}
                                  >
                                    <span
                                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                                      style={{ background: colors.bg }}
                                    >
                                      <Icon className="h-4 w-4" style={{ color: colors.icon }} />
                                    </span>
                                    <span>
                                      <span className="block text-xs font-semibold text-gray-800 leading-tight">
                                        {action.label}
                                      </span>
                                      <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">
                                        {action.description}
                                      </span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {/* Skill gap matrix (if present) */}
                          {message.skillGaps?.length ? (
                            <SkillGapMatrix skills={message.skillGaps} />
                          ) : null}
                        </div>
                      </>
                    ) : (
                      /* ── User message ── */
                      <>
                        <div
                          className="rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm relative group"
                          style={{
                            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                            maxWidth: "78%",
                          }}
                        >
                          <button
                            onClick={() => copyToClipboard(message.text)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/20"
                            title="Copy message"
                          >
                            <svg className="h-3 w-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <p className="text-sm leading-6 text-white whitespace-pre-line pr-6">
                            {message.text}
                          </p>
                          {/* Timestamp */}
                          <div className="text-[10px] text-white/60 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </div>
                        </div>

                        {/* User avatar */}
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold shadow self-start mt-0.5 overflow-hidden"
                          style={{ background: "#6366f1" }}
                        >
                          {user?.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.photoURL}
                              alt="You"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-4 w-4" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {isResponding && <TypingIndicator />}
              </div>

              {/* ── Footer ── */}
              <div
                className="px-4 pt-3 pb-4 space-y-3"
                style={{
                  background: "#fff",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                {/* Quick prompt chips */}
                <div className="flex flex-wrap gap-2">
                  {visibleQuickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitPrompt(prompt)}
                      className="quick-chip rounded-full px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all"
                      style={{
                        background: "#f0f0ff",
                        border: "1px solid #e0e7ff",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); submitPrompt(input); }}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {/* Paperclip */}
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask SkillMatch AI about your career trajectory…"
                    disabled={isResponding}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />

                  {/* Mic */}
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  {/* Send */}
                  <button
                    type="submit"
                    disabled={isResponding || !input.trim()}
                    className="send-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                      boxShadow: input.trim() && !isResponding
                        ? "0 4px 12px rgba(99,102,241,0.4)"
                        : "none",
                    }}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* ── Toggle Button ── */}
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: open
                ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                : "linear-gradient(135deg,#6366f1,#4f46e5)",
              boxShadow: "0 8px 28px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.15)",
            }}
            aria-expanded={open}
            aria-label="Open SkillMatch AI assistant"
          >
            {/* Ripple ring */}
            {!open && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{ background: "#6366f1" }}
              />
            )}
            <span className="relative text-2xl font-light leading-none select-none">
              {open ? <X className="h-6 w-6" /> : "+"}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
