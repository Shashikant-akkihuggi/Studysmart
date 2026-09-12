"use client";

import React from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Lightbulb,
  Loader2,
  PieChart as PieIcon,
  Sparkles,
  Target,
  Text,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ui/Progress";
import { DemoBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
  const {
    processingSteps,
    topics,
    extractedQuestions,
    materials,
    setNav,
    resetProcessingSteps,
  } = useApp();

  const done = processingSteps.every((s) => s.completed);
  const completedCount = processingSteps.filter((s) => s.completed).length;
  const pct = Math.round((completedCount / processingSteps.length) * 100);

  const byPriority = {
    high: topics.filter((t) => t.priority === "high").length,
    medium: topics.filter((t) => t.priority === "medium").length,
    low: topics.filter((t) => t.priority === "low").length,
  };

  const topQuestions = [...extractedQuestions]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Analysis
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {done
              ? "Here's what the AI found in your materials."
              : "Your study materials are being analyzed. This usually takes under a minute."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetProcessingSteps} className="btn-secondary">
            <Sparkles size={16} />
            <span className="ml-2">Re-run analysis</span>
          </button>
          {done && (
            <button onClick={() => setNav("roadmap")} className="btn-primary">
              Generate Roadmap
              <ArrowRight size={16} className="ml-2" />
            </button>
          )}
        </div>
      </div>

      {!done ? (
        <div className="card mx-auto max-w-2xl p-8 text-center sm:p-10">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 via-indigo-500 to-fuchsia-500 text-white">
            <Sparkles size={32} />
            <Loader2
              size={80}
              className="pointer-events-none absolute inset-0 animate-spin text-white/30"
            />
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900 sm:text-2xl">
            Analyzing your study materials…
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Cross-referencing {materials.length} files — notes, question
            papers, and syllabus — to find the best study path for you.
          </p>
          <div className="mx-auto mt-7 max-w-md">
            <ProgressBar value={pct} />
            <p className="mt-2 text-xs font-medium text-slate-500">
              {completedCount} / {processingSteps.length} steps · {pct}%
            </p>
          </div>
          <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {processingSteps.map((s) => (
              <li
                key={s.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                  s.completed
                    ? "border-success-100 bg-success-50/50 text-success-700"
                    : "border-slate-200 bg-white text-slate-600"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 flex-none items-center justify-center rounded-full",
                    s.completed
                      ? "bg-success-500 text-white"
                      : "border border-slate-300 text-slate-300"
                  )}
                >
                  {s.completed ? <Check size={14} /> : <Loader2 size={14} className="animate-spin" />}
                </span>
                <span className="font-medium">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<FileCheck size={20} />}
              accent="primary"
              label="Files processed"
              value={materials.length}
              hint={`${materials.filter((m) => m.status === "completed").length} fully analyzed`}
            />
            <SummaryCard
              icon={<Text size={20} />}
              accent="success"
              label="Topics identified"
              value={topics.length}
              hint="From syllabus + notes cross-reference"
            />
            <SummaryCard
              icon={<Target size={20} />}
              accent="danger"
              label="Questions extracted"
              value={extractedQuestions.length}
              hint="From uploaded previous papers"
            />
            <SummaryCard
              icon={<PieIcon size={20} />}
              accent="warning"
              label="High-priority topics"
              value={byPriority.high}
              hint="Based on frequency + marks weight"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="card p-6 lg:col-span-3">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Topic Priority Breakdown
                  </h3>
                  <p className="text-sm text-slate-500">
                    Priority scores consider question-paper frequency, marks
                    weight, and syllabus coverage.
                  </p>
                </div>
                <button
                  onClick={() => setNav("question-analysis")}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Question analysis →
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <PriorityBreakdown label="High" color="danger" count={byPriority.high} total={topics.length} />
                <PriorityBreakdown label="Medium" color="warning" count={byPriority.medium} total={topics.length} />
                <PriorityBreakdown label="Low" color="success" count={byPriority.low} total={topics.length} />
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Priority list
                </p>
                <ul className="space-y-2">
                  {topics
                    .sort((a, b) => b.importance - a.importance)
                    .slice(0, 6)
                    .map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {t.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {t.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={t.priority} size="sm" />
                          <span className="text-xs font-semibold text-slate-500">
                            {t.importance}/100
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="card p-6 lg:col-span-2">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Most Repeated Questions
                  </h3>
                  <p className="text-sm text-slate-500">
                    Based on the question papers you uploaded.
                  </p>
                </div>
                <Lightbulb size={18} className="text-warning-500" />
              </div>
              <ol className="space-y-3">
                {topQuestions.map((q, i) => (
                  <li
                    key={q.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-slate-800">
                          {q.text}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="badge bg-danger-50 text-danger-600">
                            Appeared {q.frequency}x
                          </span>
                          <span className="badge bg-slate-100 text-slate-600">
                            {q.marks} marks
                          </span>
                          <span className="badge bg-slate-100 text-slate-600">
                            {q.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                <b>Note:</b> Priority and frequency are based on historical
                question-paper patterns from your uploaded files. Not a
                prediction of your next exam.
              </div>
              <button
                onClick={() => setNav("roadmap")}
                className="btn-primary mt-5 w-full"
              >
                Build My Roadmap
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Next steps
                </h3>
                <p className="text-sm text-slate-500">
                  Dive deeper into what the AI found.
                </p>
              </div>
            </div>
            <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <NextStepCard
                title="Notes Breakdown"
                desc="Chapters, units, and topics extracted from your notes."
                cta="Open Notes"
                onClick={() => setNav("notes-analysis")}
              />
              <NextStepCard
                title="Question Analysis"
                desc="Frequency charts, difficulty, and priority scores."
                cta="Open Questions"
                onClick={() => setNav("question-analysis")}
              />
              <NextStepCard
                title="Study Roadmap"
                desc="A day-by-day plan tuned to your exam date and time."
                cta="Open Roadmap"
                onClick={() => setNav("roadmap")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  accent,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  accent: "primary" | "success" | "warning" | "danger";
  label: string;
  value: number | string;
  hint?: string;
}) {
  const wrap = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
  }[accent];
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            wrap
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function PriorityBreakdown({
  label,
  color,
  count,
  total,
}: {
  label: string;
  color: "primary" | "success" | "warning" | "danger";
  count: number;
  total: number;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  const map = {
    primary: "bg-primary-500 text-primary-700 bg-primary-50",
    success: "bg-success-500 text-success-700 bg-success-50",
    warning: "bg-warning-500 text-warning-700 bg-warning-50",
    danger: "bg-danger-500 text-danger-700 bg-danger-50",
  }[color];
  const [bar, , box] = map.split(" ");
  return (
    <div className={cn("rounded-2xl p-4", box)}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className={map.split(" ")[1]}>{label}</span>
        <span className="text-slate-700">
          {count} / {total}
        </span>
      </div>
      <div className="mt-3 progress-bar !h-3 bg-white">
        <div className={cn("progress-fill", bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-right text-xs font-semibold text-slate-600">{pct}%</p>
    </div>
  );
}

function NextStepCard({
  title,
  desc,
  cta,
  onClick,
}: {
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-6 text-left transition hover:bg-slate-50"
    >
      <p className="text-base font-semibold text-slate-900 group-hover:text-primary-700">
        {title}
      </p>
      <p className="text-sm text-slate-500">{desc}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2">
        {cta}
        <CheckCircle2 size={14} />
        <ArrowRight size={14} className="transition-all group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
