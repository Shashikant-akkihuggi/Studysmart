"use client";

import React from "react";
import {
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  Lightbulb,
  Link as LinkIcon,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DemoBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "Explain DFA and NFA in simple words.",
  "Give me the 10 most important questions for Theory of Computation.",
  "Create 10 MCQs on Regular Expressions.",
  "Summarize Unit 2 in 5 bullet points.",
  "What should I study today?",
  "Why is CFG high priority for my exam?",
];

export default function TutorPage() {
  const { chat, sendMessage, topics, setNav } = useApp();
  const [text, setText] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendMessage(t);
    setText("");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Study Assistant
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions — answers are sourced from your uploaded materials
            when possible.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="space-y-4 lg:col-span-1">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Quick prompts
            </h3>
            <ul className="mt-3 space-y-2">
              {QUICK_PROMPTS.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => {
                      setText(p);
                      setTimeout(() => sendMessage(p), 0);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition hover:border-primary-300 hover:bg-primary-50/40"
                  >
                    <HelpCircle size={14} className="text-primary-500" />
                    <span className="flex-1 truncate">{p}</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Jump to related
            </h3>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setNav("notes-analysis")}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <BookOpen size={14} className="text-primary-500" />
                Notes Breakdown
              </button>
              <button
                onClick={() => setNav("question-analysis")}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <FileText size={14} className="text-primary-500" />
                Question Paper Analysis
              </button>
              <button
                onClick={() => setNav("roadmap")}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Sparkles size={14} className="text-primary-500" />
                Study Roadmap
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                Sources
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Assistant prioritizes your uploaded materials. Outside that
              scope, it tells you clearly and offers a general explanation.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              {["Notes", "Q. Papers", "Syllabus", "Textbook"].map((x) => (
                <span
                  key={x}
                  className="rounded-lg bg-slate-50 px-2 py-1 text-center text-slate-600"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <section className="card flex h-[calc(100vh-180px)] min-h-[600px] flex-col lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-indigo-500 to-fuchsia-500 text-white">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Tutor — {topics[0]?.subject ?? "Your Subjects"}
                </p>
                <p className="text-xs text-slate-500">
                  {chat.length} messages · sourced from your materials
                </p>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
          >
            <div className="mx-auto max-w-3xl space-y-6">
              {chat.length === 0 && (
                <EmptyState onPick={(p) => sendMessage(p)} />
              )}
              {chat.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" && "justify-end"
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white">
                      <Sparkles size={16} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-primary-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {renderMarkdownish(m.content)}
                    </div>
                    {m.sources && m.sources.length > 0 && (
                      <div
                        className={cn(
                          "mt-3 rounded-xl p-3 text-xs",
                          m.role === "user"
                            ? "bg-white/10 text-white/90"
                            : "bg-slate-50 text-slate-600"
                        )}
                      >
                        <p className="mb-2 flex items-center gap-1.5 font-semibold">
                          <LinkIcon size={12} /> Sources from your materials:
                        </p>
                        <ul className="space-y-1.5">
                          {m.sources.map((s, i) => (
                            <li
                              key={i}
                              className={cn(
                                "flex items-start justify-between gap-2 rounded-lg px-2 py-1.5",
                                m.role === "user"
                                  ? "bg-white/10"
                                  : "bg-white ring-1 ring-slate-200"
                              )}
                            >
                              <span className="flex items-center gap-1.5 font-medium">
                                <FileText size={12} />
                                {s.material}
                              </span>
                              <span className="flex-none rounded-md px-2 py-0.5 font-semibold">
                                Page {s.page ?? "?"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!m.sources && m.role === "assistant" && (
                      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 ring-1 ring-inset ring-amber-200">
                        Note: The answer above includes a general AI
                        explanation beyond the scope of your uploaded
                        materials. Cross-check with your notes/external
                        textbooks when in doubt.
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-primary-100 text-primary-700 text-xs font-bold">
                      You
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="border-t border-slate-200 p-4 sm:p-5"
          >
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder='Ask anything: "Explain this topic in simple words…"'
                className="min-h-[42px] max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="btn-primary !py-2"
                disabled={!text.trim()}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
              When possible, answers cite your uploaded materials. AI can make
              mistakes — always verify important answers.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white">
        <Sparkles size={24} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900">
        Ask anything about your study materials
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Try one of the quick prompts to the left, or start with something like:
      </p>
      <div className="mx-auto mt-5 grid max-w-xl gap-2 sm:grid-cols-2">
        {QUICK_PROMPTS.slice(0, 4).map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-xs text-slate-700 shadow-sm transition hover:border-primary-400 hover:bg-white"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderMarkdownish(text: string) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        let l = line;
        let bold = false;
        const parts: React.ReactNode[] = [];
        const regex = /\*\*(.+?)\*\*/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(l)) !== null) {
          if (m.index > last) parts.push(l.slice(last, m.index));
          parts.push(<b key={`b-${i}-${parts.length}`}>{m[1]}</b>);
          last = m.index + m[0].length;
        }
        if (last < l.length) parts.push(l.slice(last));
        const bullet = /^\s*[-*]\s+/.test(l);
        if (bullet)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-slate-400" />
              <span className="flex-1">
                {parts.slice(1)}
              </span>
            </div>
          );
        if (/^\s*\d+\.\s+/.test(l)) {
          const match = /^\s*(\d+)\.\s+/.exec(l);
          const n = match ? match[1] : "•";
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                {n}
              </span>
              <span className="flex-1">{parts.slice(match ? 0 : 1)}</span>
            </div>
          );
        }
        const blockQuote = /^\s*>\s?/.test(l);
        if (blockQuote)
          return (
            <p
              key={i}
              className="border-l-2 border-primary-300 bg-primary-50/60 pl-3 italic text-slate-700"
            >
              {l.replace(/^\s*>\s?/, "")}
            </p>
          );
        return (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {parts.length ? parts : "\u00A0"}
          </p>
        );
      })}
    </>
  );
}
