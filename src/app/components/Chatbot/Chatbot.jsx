"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Paperclip,
  Mic,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";

function getFallbackReply(input) {
  const normalizedInput = String(input || "").toLowerCase();
  if (normalizedInput.includes("hello") || normalizedInput.includes("hi") || normalizedInput.includes("hey")) {
    return { text: "Hey! I can help with jobs, resume upload, recruiter actions, and platform navigation. What do you want to do first?" };
  }
  if (normalizedInput.includes("how are you") || normalizedInput.includes("how r u") || normalizedInput.includes("how you")) {
    return { text: "I am good and ready to help. Ask me about finding jobs, skill-gap checks, profile updates, or recruiter workflows." };
  }
  if (normalizedInput.includes("thank") || normalizedInput.includes("thanks")) {
    return { text: "You are welcome. I can guide your next action step-by-step." };
  }
  if (normalizedInput.includes("job") || normalizedInput.includes("role") || normalizedInput.includes("search") || normalizedInput.includes("apply")) {
    return { text: "Start from the jobs page to browse openings and compare role requirements." };
  }
  if (normalizedInput.includes("resume") || normalizedInput.includes("cv") || normalizedInput.includes("upload")) {
    return { text: "Use the resume page to upload your file, then continue to skill-gap detection for a role-focused plan." };
  }
  if (normalizedInput.includes("test") || normalizedInput.includes("assessment") || normalizedInput.includes("prepare")) {
    return { text: "Use skill test to evaluate your current level, then check skill-gap detection for what to improve next." };
  }
  if (normalizedInput.includes("company") || normalizedInput.includes("employer") || normalizedInput.includes("recruiter")) {
    return { text: "You can browse companies or jump into dashboard workflows for hiring and candidate activity." };
  }
  if (normalizedInput.includes("profile") || normalizedInput.includes("account") || normalizedInput.includes("dashboard")) {
    return { text: "Your profile manages account details while dashboard is the main hub for activity and progress." };
  }
  return { text: "I can help you move around JobMatch AI. Ask about jobs, resume upload, tests, dashboard, companies, or profile settings." };
}

export default function Chatbot() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => setMobileMenuOpen(e.detail?.open ?? false);
    window.addEventListener("skillmatch:mobile-menu", handler);
    return () => window.removeEventListener("skillmatch:mobile-menu", handler);
  }, []);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am JobMatch AI assistant. I can answer quick questions and take you to the right page anywhere in the app.",
    },
  ]);

  const scrollRef = useRef(null);
  const messageIdRef = useRef(1);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        text: "Hi, I am JobMatch AI assistant. I can answer quick questions and take you to the right page anywhere in the app.",
      },
    ]);
    setSuggestionsVisible(true);
  };

  const askAssistantApi = useCallback(
    async (prompt) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        let token = "";
        if (user && typeof user.getIdToken === "function") {
          token = await user.getIdToken();
        }
        const response = await fetch("/api/chatbot/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "I encountered an error while processing your request. Please try again.");
        }
        const assistantText = String(payload?.assistant || "").trim();
        if (!assistantText) {
          throw new Error("I encountered an error while processing your request. Please try again.");
        }
        return assistantText;
      } catch {
        throw new Error("I encountered an error while processing your request. Please try again.");
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [user]
  );

  const submitPrompt = useCallback(
    async (rawPrompt) => {
      const prompt = String(rawPrompt || "").trim();
      if (!prompt || isResponding) return;
      setSuggestionsVisible(false);
      const nextId = messageIdRef.current++;
      setMessages((current) => [...current, { id: nextId + "-user", role: "user", text: prompt }]);
      setInput("");
      setOpen(true);
      setIsResponding(true);
      try {
        const assistantText = await askAssistantApi(prompt);
        setMessages((current) => [...current, { id: nextId + "-assistant", role: "assistant", text: assistantText }]);
      } catch {
        const fallback = getFallbackReply(prompt);
        setMessages((current) => [...current, { id: nextId + "-assistant", role: "assistant", text: fallback.text }]);
      } finally {
        setIsResponding(false);
      }
    },
    [askAssistantApi, isResponding]
  );

  useEffect(() => {
    function handleAssistantOpen(event) {
      setOpen(true);
      const prompt = String(event.detail?.prompt || "").trim();
      submitPrompt(prompt);
    }
    window.addEventListener("skillmatch:assistant-open", handleAssistantOpen);
    return () => {
      window.removeEventListener("skillmatch:assistant-open", handleAssistantOpen);
    };
  }, [submitPrompt]);

  const visibleQuickPrompts = useMemo(
    () => ["How do I upload my resume?", "How many jobs have I applied to?", "Summarize my skill gaps"],
    []
  );

  const getAvatarsIcon = (roleName) => {
    if (roleName === "assistant") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[15px] font-bold text-white shadow-sm">
          AI
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm overflow-hidden border border-slate-200">
        <UserRound className="h-5 w-5" />
      </div>
    );
  };

  if (mobileMenuOpen) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-6 sm:px-6 sm:pb-8">
      <div className="pointer-events-auto flex max-w-md w-full flex-col items-end gap-3">
        {open && (
          <section
            className="relative flex w-[26rem] max-w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl transition-all"
            style={{ maxHeight: "calc(100dvh - 7rem)" }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-transparent bg-white shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6452F5] text-lg font-bold text-white shadow-md">
                  AI
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 leading-tight">JobMatch AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                    <span className="text-[13px] font-medium text-slate-400">Online &middot; {messages.length} messages</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[#9ca3af]">
                <button onClick={clearChat} className="hover:text-slate-600 transition-colors" aria-label="Clear chat">
                  <Trash2 className="h-5 w-5" />
                </button>
                <button onClick={() => setOpen(false)} className="hover:text-slate-600 transition-colors" aria-label="Close assistant">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-4 pt-2 bg-[#F9FAFB]/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={"flex items-end gap-3 " + (message.role === "assistant" ? "justify-start" : "justify-end")}
                >
                  {message.role === "assistant" && getAvatarsIcon("assistant")}
                  <div className={"flex flex-col gap-3 " + (message.role === "assistant" ? "w-full overflow-hidden" : "max-w-[75%]")}>
                    <div
                      className={"px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative " + (
                        message.role === "assistant"
                          ? "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                          : "rounded-2xl rounded-br-sm bg-[#5A55F5] text-white"
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                  {message.role === "user" && getAvatarsIcon("user")}
                </div>
              ))}

              {isResponding && (
                <div className="flex items-end gap-3 justify-start">
                  {getAvatarsIcon("assistant")}
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-5 py-3.5 text-slate-500 shadow-sm animate-pulse flex items-center gap-1">
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white px-5 py-4 shrink-0">
              {suggestionsVisible && (
                <p className="mb-4 text-[13px] text-slate-500 leading-relaxed">
                  Not sure where to start? Try:{" "}
                  {visibleQuickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitPrompt(prompt)}
                      style={{ color: "#6663F6", display: "inline" }}
                      className="bg-transparent border-0 p-0 cursor-pointer underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6663F6]"
                    >
                      {prompt}
                    </button>
                  ))}
                </p>
              )}

              <div className="relative flex items-center">
                <form
                  onSubmit={(event) => { event.preventDefault(); submitPrompt(input); }}
                  className="flex w-full items-center gap-2 rounded-[1.5rem] bg-[#F4F5F7] px-4 py-3"
                >
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask JobMatch AI about your career..."
                    disabled={isResponding}
                    className="min-w-0 flex-1 bg-transparent px-2 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 placeholder:font-medium"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#AEA9FF] text-white shadow-sm transition-all hover:bg-[#9791FC] disabled:opacity-50 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-[18px] w-[18px] -ml-0.5 mt-0.5" strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex items-center gap-2.5 pl-4 pr-5 h-14 rounded-full bg-[#6452F5] text-white shadow-2xl shadow-indigo-300/50 transition-all hover:scale-105 hover:shadow-indigo-400/60 active:scale-95"
            aria-expanded={open}
            aria-label="Open JobMatch AI assistant"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#6452F5] animate-ping opacity-20 pointer-events-none" />
            <MessageCircle className="h-6 w-6 shrink-0" />
            <span className="text-sm font-bold tracking-tight">Ask AI</span>
          </button>
        )}
      </div>
    </div>
  );
}
