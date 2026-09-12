"use client";

import React from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  CircleDot,
  Clock,
  FileWarning,
  RefreshCcw,
  Route,
  ShieldAlert,
  Sparkles,
  Target,
  Wand2,
  Flame,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ui/Progress";
import { DemoBadge, PriorityBadge, DifficultyBadge } from "@/components/ui/Badge";
import { cn, daysUntil, formatDate } from "@/lib/utils";

export default function RoadmapPage() {
  const { studyPlan, toggleTask, topics, user, recomputeRoadmap, setNav } =
    useApp();

  const totalTasks = studyPlan.days.reduce(
    (s, d) => s + d.tasks.length,
    0
  );
  const doneTasks = studyPlan.days.reduce(
    (s, d) => s + d.tasks.filter((t) => t.completed).length,
    0
  );
  const donePct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalMin = studyPlan.days.reduce(
    (s, d) => s + d.tasks.reduce((ss, t) => ss + t.estimatedMinutes, 0),
    0
  );

  const daysLeft = user?.examDate ? daysUntil(user.examDate) : 14;

  const highTopics = topics.filter((t) => t.priority === "high").slice(0, 3);
  const weakTopics = topics
    .filter((t) => t.weak || (t.progress ?? 0) < 35)
    .slice(0, 2);
  const strongTopics = topics
    .filter((t) => (t.progress ?? 0) >= 70)
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Personalized Study Roadmap
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {studyPlan.days.length}-day plan for {studyPlan.subject} ·{" "}
            {user?.examDate
              ? `Exam: ${formatDate(user.examDate)} (${daysLeft} days left)`
              : "Set your exam date in settings"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              recomputeRoadmap();
            }}
            className="btn-secondary"
          >
            <RefreshCcw size={16} />
            <span className="ml-2">Adapt to latest performance</span>
          </button>
          <button onClick={() => setNav("tests")} className="btn-primary">
            Start Today's Test
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Days covered</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {studyPlan.days.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Daily, focused sessions</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Total tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {doneTasks} / {totalTasks}
          </p>
          <ProgressBar value={donePct} className="mt-3" />
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Planned study</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {Math.round(totalMin / 60)}h
          </p>
          <p className="mt-1 text-xs text-slate-500">
            ≈ {Math.round(totalMin / studyPlan.days.length / 60 * 10) / 10}h / day
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">High-priority tasks</p>
          <p className="mt-1 text-2xl font-bold text-danger-600">
            {
              studyPlan.days.reduce(
                (s, d) => s + d.tasks.filter((t) => t.priority === "high").length,
                0
              )
            }
          </p>
          <p className="mt-1 text-xs text-slate-500">Do these first</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
            <div className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Adaptive recommendation
                </p>
                <h3 className="mt-1 text-lg font-bold sm:text-xl">
                  Reduce Unit 1 revision — focus on Unit 2
                </h3>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Your recent test scores show <b>85% mastery on Unit 1</b> but{" "}
                  <b>only 42% on Unit 2</b>. Reallocating 45 min/day from
                  revision to CFG & PDA practice will accelerate gains.
                </p>
              </div>
              <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/10">
                <Wand2 size={24} />
              </div>
            </div>
            <div className="grid divide-x divide-white/10 border-t border-white/10 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-3 px-6 py-4">
                <TrendingUp
                  size={18}
                  className="text-emerald-300"
                />
                <div>
                  <p className="text-xs text-white/70">Unit 1</p>
                  <p className="font-semibold">85% mastery · cut 45m</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4">
                <TrendingDown size={18} className="text-rose-300" />
                <div>
                  <p className="text-xs text-white/70">Unit 2</p>
                  <p className="font-semibold">42% mastery · add 45m</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-6 py-4">
                <Flame size={18} className="text-amber-300" />
                <div>
                  <p className="text-xs text-white/70">Forecast impact</p>
                  <p className="font-semibold">+18% expected Unit-2 score</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {studyPlan.days.map((day, di) => {
              const done = day.tasks.filter((t) => t.completed).length;
              const pct = day.tasks.length
                ? Math.round((done / day.tasks.length) * 100)
                : 0;
              return (
                <div key={di} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                        <Route size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Day {day.day} · {day.date}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {day.subject} · {day.tasks.length} tasks · {done} done
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-48">
                      <ProgressBar value={pct} />
                    </div>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {day.tasks.map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => toggleTask(t.id)}
                          className={cn(
                            "flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50",
                            t.completed && "bg-slate-50/60"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg border-2 transition",
                              t.completed
                                ? "border-primary-600 bg-primary-600 text-white"
                                : "border-slate-300 bg-white hover:border-primary-400"
                            )}
                          >
                            {t.completed && <CheckSquare size={13} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm font-semibold leading-snug text-slate-800",
                                t.completed && "text-slate-400 line-through"
                              )}
                            >
                              {t.title}
                            </p>
                            {t.topic && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                Topic: {t.topic}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                                <Clock size={11} />
                                {t.estimatedMinutes} min
                              </span>
                              <DifficultyBadge difficulty={t.difficulty} />
                              <PriorityBadge priority={t.priority} size="sm" />
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 capitalize text-slate-600">
                                <CircleDot size={11} />
                                {t.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Target size={18} className="text-danger-500" />
              Focus this week
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Topics driving your roadmap order.
            </p>
            <ul className="mt-4 space-y-3">
              {highTopics.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-danger-100 bg-danger-50/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <ProgressBar value={t.progress} color="danger" className="mt-2" />
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <ShieldAlert size={18} className="text-warning-500" />
              Weak areas (extra time allocated)
            </h3>
            <ul className="mt-4 space-y-2">
              {weakTopics.length === 0 ? (
                <li className="text-sm text-slate-500">None detected.</li>
              ) : (
                weakTopics.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-warning-50 p-3 text-sm"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {t.name}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-warning-700">
                      {t.progress}%
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Sparkles size={18} className="text-success-500" />
              Strong topics (reduced schedule)
            </h3>
            <ul className="mt-4 space-y-2">
              {strongTopics.length === 0 ? (
                <li className="text-sm text-slate-500">
                  Keep studying — you'll get here!
                </li>
              ) : (
                strongTopics.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-success-50 p-3 text-sm"
                  >
                    <span className="truncate font-medium text-slate-800">
                      {t.name}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-success-700">
                      {t.progress}%
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-start gap-3 border-b border-slate-200 p-5">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FileWarning size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  How the roadmap is built
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Nothing is random.
                </p>
              </div>
            </div>
            <ol className="space-y-3 p-5 text-sm text-slate-600">
              <li>
                <b className="text-slate-800">1. Exam date</b> — determines
                total days & sessions.
              </li>
              <li>
                <b className="text-slate-800">2. Question frequency</b> —
                repeated topics appear earlier and more often.
              </li>
              <li>
                <b className="text-slate-800">3. Marks weight</b> — high-mark
                topics get more practice time.
              </li>
              <li>
                <b className="text-slate-800">4. Weak / Strong</b> — your test
                performance shifts the schedule daily.
              </li>
              <li>
                <b className="text-slate-800">5. Study time</b> — tasks fit
                within your available daily window.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
