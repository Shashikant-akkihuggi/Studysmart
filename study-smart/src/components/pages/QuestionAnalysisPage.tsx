"use client";

import React from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileBarChart,
  Filter,
  Flame,
  Layers,
  Search,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import type { TopicPriority } from "@/types";
import { DemoBadge, DifficultyBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

export default function QuestionAnalysisPage() {
  const { extractedQuestions, topicFrequency, topics, setNav } = useApp();
  const [query, setQuery] = React.useState("");
  const [pri, setPri] = React.useState<"all" | TopicPriority>("all");
  const [unit, setUnit] = React.useState<string>("all");

  const units = Array.from(
    new Set(extractedQuestions.map((q) => q.unit).filter(Boolean) as string[])
  );

  const filtered = extractedQuestions.filter((q) => {
    const matchQ =
      !query || q.text.toLowerCase().includes(query.toLowerCase()) ||
      (q.topic ?? "").toLowerCase().includes(query.toLowerCase());
    const matchPri = pri === "all" || q.priority === pri;
    const matchUnit = unit === "all" || q.unit === unit;
    return matchQ && matchPri && matchUnit;
  });

  const byPriority = {
    high: extractedQuestions.filter((q) => q.priority === "high").length,
    medium: extractedQuestions.filter((q) => q.priority === "medium").length,
    low: extractedQuestions.filter((q) => q.priority === "low").length,
  };

  const totalMarks = extractedQuestions.reduce(
    (s, q) => s + (q.marks ?? 0) * q.frequency,
    0
  );

  const top = [...extractedQuestions].sort((a, b) => b.frequency - a.frequency);

  const freqData = topicFrequency.map((x) => ({
    name: x.topic.length > 18 ? x.topic.slice(0, 17) + "…" : x.topic,
    count: x.count,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Question Paper Analysis
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Historical question-paper patterns from the papers you uploaded.
            Priority tags reflect frequency + marks weight, not predictions.
          </p>
        </div>
        <button onClick={() => setNav("tests")} className="btn-primary">
          Generate Practice Test
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<FileBarChart size={20} />}
          accent="primary"
          label="Questions extracted"
          value={extractedQuestions.length}
        />
        <Stat
          icon={<Flame size={20} />}
          accent="danger"
          label="High-priority"
          value={byPriority.high}
          hint="Based on historical frequency"
        />
        <Stat
          icon={<Trophy size={20} />}
          accent="warning"
          label="Total marks coverage"
          value={totalMarks}
          hint="Weighted by frequency"
        />
        <Stat
          icon={<Layers size={20} />}
          accent="success"
          label="Topics referenced"
          value={topicFrequency.length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <BarChart3 size={18} className="text-primary-500" />
                Topic Frequency
              </h3>
              <p className="text-sm text-slate-500">
                How often each topic has appeared across uploaded papers.
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={freqData}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {freqData.map((_, i) => (
                    <Cell key={i} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target size={18} className="text-danger-500" />
            Priority Classification
          </h3>
          <p className="text-sm text-slate-500">
            Scored from historical frequency, marks, and syllabus weight.
          </p>

          <ul className="mt-5 space-y-4">
            {(
              [
                { k: "high", label: "High Priority", c: byPriority.high, color: "danger" },
                { k: "medium", label: "Medium Priority", c: byPriority.medium, color: "warning" },
                { k: "low", label: "Low Priority", c: byPriority.low, color: "success" },
              ] as const
            ).map((x) => {
              const total =
                byPriority.high + byPriority.medium + byPriority.low;
              const pct = total ? Math.round((x.c / total) * 100) : 0;
              return (
                <li key={x.k}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <PriorityBadge priority={x.k} />
                    <span className="text-xs font-semibold text-slate-700">
                      {x.c} questions · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={cn(
                        "progress-fill",
                        x.color === "danger" && "bg-danger-500",
                        x.color === "warning" && "bg-warning-500",
                        x.color === "success" && "bg-success-500"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
            <p className="font-semibold">
              ⚠️ Important disclaimer
            </p>
            <p className="mt-1">
              The analysis above is based purely on historical frequency from
              the question papers you uploaded. We never claim a question{" "}
              <b>will</b> appear in your exam — only that it has{" "}
              <b>appeared often in the past</b> and should be treated as high
              priority during revision.
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles size={18} className="text-primary-500" />
            Most Repeated Questions
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-6 py-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions / topics…"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter size={14} />
            <select
              className="input !py-1.5 !text-xs"
              value={pri}
              onChange={(e) => setPri(e.target.value as any)}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="input !py-1.5 !text-xs"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="all">All units</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ol className="divide-y divide-slate-200">
          {filtered.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-slate-500">
              No questions match your filters.
            </li>
          )}
          {filtered.map((q) => (
            <li key={q.id} className="px-6 py-4 hover:bg-slate-50/60">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">
                  {q.frequency}×
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-slate-800">
                    {q.text}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    {q.unit && (
                      <span className="badge bg-slate-100 text-slate-600">
                        <BookOpen size={11} className="mr-1" />
                        {q.unit}
                      </span>
                    )}
                    {q.topic && (
                      <span className="badge bg-slate-100 text-slate-600">
                        Topic: {q.topic}
                      </span>
                    )}
                    {q.year && (
                      <span className="badge bg-slate-100 text-slate-600">
                        Years: {q.year}
                      </span>
                    )}
                    {q.marks && (
                      <span className="badge bg-primary-50 text-primary-700">
                        {q.marks} marks
                      </span>
                    )}
                    <DifficultyBadge difficulty={q.difficulty} />
                    <PriorityBadge priority={q.priority} size="sm" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Stat({
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
