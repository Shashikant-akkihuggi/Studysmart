"use client";

import React from "react";
import {
  BookCheck,
  CalendarDays,
  CheckSquare,
  CircleDot,
  Flame,
  ListChecks,
  MessageSquare,
  Route,
  Target,
  Trophy,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProgressBar, StatCard } from "@/components/ui/Progress";
import { TopicCard } from "@/components/ui/TopicCard";
import { DemoBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn, formatDate, getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { user, progress, topics, toggleTask, studyPlan, activities, setNav } =
    useApp();

  const today = studyPlan.days[0] ?? {
    day: 1,
    date: "No tasks yet",
    subject: user?.subjects?.[0] ?? "Your subject",
    tasks: [],
  };
  const daysLeft = user?.examDate
    ? Math.max(
      0,
      Math.ceil(
        (new Date(user.examDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    )
    : 0;

  const highPri = topics.filter((t) => t.priority === "high");
  const medPri = topics.filter((t) => t.priority === "medium");
  const lowPri = topics.filter((t) => t.priority === "low");
  const weak = topics.filter((t) => t.weak || (t.progress != null && t.progress < 35));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your next exam:{" "}
              <b className="text-slate-700">
                {user?.subjects?.[0] ?? "Theory of Computation"} —{" "}
                {user?.examDate ? formatDate(user.examDate) : "Set a date"}
              </b>{" "}
              · <span className="text-danger-600"> {daysLeft} days left</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoBadge />
            <button
              onClick={() => setNav("roadmap")}
              className="btn-primary"
            >
              <Route size={16} />
              <span className="ml-2">Continue Study Plan</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Target size={20} />}
          label="Overall Preparation"
          value={`${progress.overall}%`}
          hint={`${progress.topicsCompleted}/${progress.topicsTotal} topics complete`}
          accent="primary"
        />
        <StatCard
          icon={<Flame size={20} />}
          label="Study Streak"
          value={`${progress.streak} days`}
          hint="Keep it going!"
          accent="warning"
        />
        <StatCard
          icon={<ListChecks size={20} />}
          label="Questions Solved"
          value={progress.questionsSolved}
          hint="Across practice + tests"
          accent="success"
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Avg Test Score"
          value={`${progress.averageScore}%`}
          hint={`${progress.testsCompleted} test${progress.testsCompleted === 1 ? "" : "s"} taken`}
          accent="primary"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Overall Preparation
              </h3>
              <p className="text-sm text-slate-500">
                Syllabus coverage, based on notes, question-paper weightage, and
                performance.
              </p>
            </div>
            <span className="text-2xl font-bold text-primary-700">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Roadmap Completion
              </p>
              <ProgressBar
                value={progress.roadmapCompletion}
                className="mt-2"
                color="primary"
              />
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {progress.roadmapCompletion}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                High-Priority Progress
              </p>
              <ProgressBar
                value={
                  Math.round(
                    highPri.reduce((s, t) => s + t.progress, 0) /
                    Math.max(1, highPri.length)
                  )
                }
                className="mt-2"
                color="danger"
              />
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {highPri.length} topics
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Weak-Area Progress
              </p>
              <ProgressBar
                value={
                  Math.round(
                    weak.reduce((s, t) => s + t.progress, 0) /
                    Math.max(1, weak.length)
                  )
                }
                className="mt-2"
                color="warning"
              />
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {weak.length} topics
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Today's Plan — {today.date}
          </h3>
          {today.tasks.length > 0 ? (
            <>
              <p className="text-sm text-slate-500">
                {today.subject} ·{" "}
                {today.tasks.reduce((s, t) => s + (t.completed ? 1 : 0), 0)}/
                {today.tasks.length} completed
              </p>
              <ul className="mt-4 space-y-3">
                {today.tasks.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => toggleTask(t.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-primary-200 hover:bg-primary-50/40",
                        t.completed && "bg-slate-50"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border",
                          t.completed
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-slate-300 bg-white"
                        )}
                      >
                        {t.completed ? "✓" : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium text-slate-900",
                            t.completed && "text-slate-400 line-through"
                          )}
                        >
                          {t.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            <CalendarDays size={12} className="mr-0.5 inline" />
                            {t.estimatedMinutes} min
                          </span>
                          <span>
                            <CircleDot size={12} className="mr-0.5 inline" />
                            {t.difficulty}
                          </span>
                          <PriorityBadge priority={t.priority} size="sm" />
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <Route size={28} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                No study plan yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload your materials and run an AI analysis to generate your personalized roadmap.
              </p>
              <button
                onClick={() => setNav("roadmap")}
                className="btn-primary mt-4"
              >
                Build My Roadmap
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Priority Topics
          </h3>
          <button
            onClick={() => setNav("notes-analysis")}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all →
          </button>
        </div>
        {topics.length === 0 ? (
          <div className="card p-10 text-center">
            <Target size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              No topics analyzed yet
            </p>
            <p className="mt-1 mx-auto max-w-md text-xs text-slate-500">
              Once you upload your notes, syllabus, and previous papers, the AI
              will identify and prioritize the most important topics for you.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {highPri.map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
            {medPri.slice(0, 2).map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
            {lowPri.slice(0, 1).map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target size={18} className="text-danger-500" />
            Weak Areas
          </h3>
          {weak.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing flagged yet — keep practising!
            </p>
          ) : (
            <ul className="space-y-3">
              {weak.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-danger-100 bg-danger-50/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {t.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t.unit} ·{" "}
                        {t.frequency ? `${t.frequency}× in papers` : "Low performance detected"}
                      </p>
                    </div>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={t.progress}
                      color="danger"
                    />
                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {t.progress}% mastery
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BookCheck size={18} className="text-primary-500" />
            Recent Activity
          </h3>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <CheckSquare size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                No activity yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Start studying and your activity will appear here.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-5">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white",
                      a.type === "test" && "bg-primary-500",
                      a.type === "question" && "bg-success-500",
                      a.type === "topic" && "bg-warning-500",
                      a.type === "roadmap" && "bg-indigo-500"
                    )}
                  >
                    {a.type === "test" && <CheckSquare size={11} className="text-white" />}
                    {a.type === "question" && (
                      <MessageSquare size={11} className="text-white" />
                    )}
                    {a.type === "topic" && <BookCheck size={11} className="text-white" />}
                    {a.type === "roadmap" && <Route size={11} className="text-white" />}
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {a.title}
                  </p>
                  <p className="text-xs text-slate-500">{a.description}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {formatDate(a.timestamp)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
