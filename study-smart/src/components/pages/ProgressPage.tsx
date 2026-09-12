"use client";

import React from "react";
import {
  BrainCircuit,
  CalendarDays,
  CheckSquare,
  Flame,
  ListChecks,
  PieChart as PieIcon,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ui/Progress";
import { DemoBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const SCORE_HISTORY = [
  { day: "Mon 1", score: 45, topics: 1 },
  { day: "Tue 2", score: 52, topics: 2 },
  { day: "Wed 3", score: 50, topics: 3 },
  { day: "Thu 4", score: 61, topics: 4 },
  { day: "Fri 5", score: 58, topics: 4 },
  { day: "Sat 6", score: 66, topics: 5 },
  { day: "Sun 7", score: 68, topics: 5 },
  { day: "Mon 8", score: 68, topics: 6 },
  { day: "Tue 9", score: 72, topics: 7 },
];

export default function ProgressPage() {
  const { progress, topics, studyPlan, activities, setNav } = useApp();

  const strong = progress.strongTopics;
  const weak = progress.weakTopics;
  const weakNotInStrong = weak.filter(
    (w) => !strong.some((s) => s.id === w.id)
  );

  const pieData = [
    {
      name: "Completed",
      value: progress.topicsCompleted,
      color: "#10b981",
    },
    {
      name: "In progress",
      value: progress.topicsTotal - progress.topicsCompleted - weak.length,
      color: "#6366f1",
    },
    {
      name: "Weak areas",
      value: weak.length,
      color: "#f59e0b",
    },
  ].filter((x) => x.value > 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Your Progress
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            One view of how your preparation is moving.
          </p>
        </div>
        <button onClick={() => setNav("roadmap")} className="btn-primary">
          Continue Roadmap
          <TrendingUp size={16} className="ml-2" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          icon={<Target size={20} />}
          accent="primary"
          label="Overall Preparation"
          value={`${progress.overall}%`}
          hint={`${progress.topicsCompleted}/${progress.topicsTotal} topics`}
        />
        <KPI
          icon={<Flame size={20} />}
          accent="warning"
          label="Study Streak"
          value={`${progress.streak} days`}
          hint="Keep it up!"
        />
        <KPI
          icon={<CheckSquare size={20} />}
          accent="success"
          label="Questions Solved"
          value={progress.questionsSolved}
          hint="Practice + tests"
        />
        <KPI
          icon={<Trophy size={20} />}
          accent="primary"
          label="Avg Test Score"
          value={`${progress.averageScore}%`}
          hint={`${progress.testsCompleted} tests`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Performance Over Time
              </h3>
              <p className="text-sm text-slate-500">
                Average test score vs. topics completed in the last 9 days.
              </p>
            </div>
            <div className="hidden items-center gap-4 text-xs text-slate-500 sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Test score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success-500" />
                Topics completed
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SCORE_HISTORY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="topics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="url(#score)"
                  strokeWidth={2}
                  name="Score (%)"
                />
                <Area
                  type="monotone"
                  dataKey="topics"
                  stroke="#10b981"
                  fill="url(#topics)"
                  strokeWidth={2}
                  name="Topics (cumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Topic Status Breakdown
          </h3>
          <p className="text-sm text-slate-500">Where you stand.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2 text-sm">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-500">Overall</span>
                <span className="font-semibold text-slate-700">
                  {progress.overall}%
                </span>
              </div>
              <ProgressBar
                value={progress.overall}
                color={
                  progress.overall >= 70
                    ? "success"
                    : progress.overall >= 40
                      ? "warning"
                      : "primary"
                }
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-500">Roadmap</span>
                <span className="font-semibold text-slate-700">
                  {progress.roadmapCompletion}%
                </span>
              </div>
              <ProgressBar value={progress.roadmapCompletion} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BrainCircuit size={18} className="text-primary-500" />
            Topics by priority & progress
          </h3>
          <div className="mt-4 space-y-3">
            {topics
              .slice()
              .sort((a, b) => b.importance - a.importance)
              .map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-500">{t.unit}</p>
                    </div>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 items-center gap-4 text-xs">
                    <div className="col-span-2">
                      <ProgressBar
                        value={t.progress}
                        color={
                          t.progress >= 70
                            ? "success"
                            : t.progress >= 40
                              ? "warning"
                              : "primary"
                        }
                      />
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700">
                        {t.progress}%
                      </span>{" "}
                      <span className="text-slate-400">
                        · {t.frequency ?? 0}× freq
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Sparkles size={18} className="text-success-500" />
              Strong Topics
            </h3>
            <ul className="mt-4 space-y-2">
              {strong.length === 0 ? (
                <li className="text-sm text-slate-500">
                  No strong topics yet — keep going!
                </li>
              ) : (
                strong.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-success-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {t.name}
                    </span>
                    <span className="ml-2 flex-none text-xs font-semibold text-success-700">
                      {t.progress}%
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <ShieldAlert size={18} className="text-warning-500" />
              Weak Topics
            </h3>
            <ul className="mt-4 space-y-2">
              {weakNotInStrong.length === 0 ? (
                <li className="text-sm text-slate-500">
                  No weak topics flagged yet.
                </li>
              ) : (
                weakNotInStrong.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-warning-50 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {t.name}
                    </span>
                    <span className="ml-2 flex-none text-xs font-semibold text-warning-700">
                      {t.progress}%
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <CalendarDays size={18} className="text-primary-500" />
              Upcoming from Roadmap
            </h3>
            <ul className="mt-4 space-y-3">
              {studyPlan.days
                .flatMap((d) => d.tasks.filter((t) => !t.completed))
                .slice(0, 5)
                .map((t) => (
                  <li
                    key={t.id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {t.title}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        <ListChecks size={11} className="mr-1 inline" />
                        {t.estimatedMinutes} min
                      </span>
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <PieIcon size={18} className="text-primary-500" />
            Recent activity
          </h3>
        </div>
        <ol className="divide-y divide-slate-100">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl",
                  a.type === "test" && "bg-primary-50 text-primary-700",
                  a.type === "question" && "bg-success-50 text-success-700",
                  a.type === "topic" && "bg-warning-50 text-warning-700",
                  a.type === "roadmap" && "bg-indigo-50 text-indigo-700"
                )}
              >
                {a.type === "test" && <CheckSquare size={16} />}
                {a.type === "question" && <BrainCircuit size={16} />}
                {a.type === "topic" && <Target size={16} />}
                {a.type === "roadmap" && <TrendingUp size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {a.title}
                </p>
                <p className="text-xs text-slate-500">{a.description}</p>
              </div>
              <p className="hidden flex-none text-xs text-slate-400 sm:block">
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function KPI({
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
