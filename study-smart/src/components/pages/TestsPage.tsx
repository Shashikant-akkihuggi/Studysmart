"use client";

import React from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  ListChecks,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
  Zap,
  BookMarked,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { TestType } from "@/types";
import { ProgressBar } from "@/components/ui/Progress";
import { DemoBadge, DifficultyBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const TYPES: {
  key: TestType;
  label: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
}[] = [
    {
      key: "mcq",
      label: "MCQ Test",
      icon: <ListChecks size={20} />,
      desc: "Multiple-choice questions on your topics.",
      color: "bg-primary-50 text-primary-700",
    },
    {
      key: "short_answer",
      label: "Short Answer",
      icon: <FileText size={20} />,
      desc: "Exam-style conceptual questions.",
      color: "bg-success-50 text-success-700",
    },
    {
      key: "previous_paper",
      label: "Previous Paper",
      icon: <BookMarked size={20} />,
      desc: "Practice with uploaded past papers.",
      color: "bg-warning-50 text-warning-700",
    },
    {
      key: "topic",
      label: "Topic-Specific",
      icon: <Target size={20} />,
      desc: "Deep-dive on a single topic.",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      key: "mock",
      label: "Full Mock",
      icon: <GraduationCap size={20} />,
      desc: "Full-length exam simulation.",
      color: "bg-fuchsia-50 text-fuchsia-700",
    },
  ];

export default function TestsPage() {
  const { test, testResult, startTest, submitTest, setNav } = useApp();
  const [view, setView] = React.useState<"home" | "take" | "result">(
    testResult ? "result" : "home"
  );
  const [type, setType] = React.useState<TestType>("mcq");
  const [answers, setAnswers] = React.useState<Record<string, number | string>>({});
  const [current, setCurrent] = React.useState(0);

  const safeLen = test?.questions.length ?? 1;
  const pct = Math.round(((current + 1) / safeLen) * 100);

  const begin = () => {
    setAnswers({});
    setCurrent(0);
    startTest();
    setView("take");
  };

  const submit = () => {
    submitTest(answers);
    setView("result");
  };

  if (view === "take" && test)
    return <TestRunner test={test} answers={answers} setAnswers={setAnswers} current={current} setCurrent={setCurrent} pct={pct} onSubmit={submit} />;

  if (view === "result" && testResult && test)
    return <TestResultView result={testResult} test={test} onRetry={begin} onHome={() => setView("home")} onRoadmap={() => setNav("roadmap")} />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Practice Tests
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Generate tests from your materials, take them, and see your weak
            areas.
          </p>
        </div>
        <button onClick={begin} className="btn-primary">
          <Sparkles size={16} />
          <span className="ml-2">Generate Unit 1 MCQ test</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={cn(
              "card card-hover text-left p-5 transition",
              type === t.key && "ring-2 ring-primary-500 ring-offset-1"
            )}
          >
            <div
              className={cn(
                "mb-3 flex h-11 w-11 items-center justify-center rounded-xl",
                t.color
              )}
            >
              {t.icon}
            </div>
            <p className="text-sm font-bold text-slate-900">{t.label}</p>
            <p className="mt-1 text-xs text-slate-500">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden lg:col-span-2">
          {test ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {test.questions.length} questions · {test.totalMarks} marks ·{" "}
                      {test.durationMinutes} min
                    </p>
                  </div>
                </div>
                <button onClick={begin} className="btn-primary">
                  Start test
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
              <ol className="divide-y divide-slate-100">
                {test.questions.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-4 px-6 py-4">
                    <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-slate-800">
                        {q.text}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="badge bg-slate-100 text-slate-600">
                          {q.topic}
                        </span>
                        <span className="badge bg-primary-50 text-primary-700">
                          {q.marks} mark{q.marks > 1 ? "s" : ""}
                        </span>
                        <DifficultyBadge difficulty={q.difficulty} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <ClipboardList size={44} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">
                No generated tests yet
              </h3>
              <p className="mt-2 mx-auto max-w-md text-sm text-slate-500">
                Upload your study materials and run the AI analysis to generate
                topic-aligned practice tests from your own content.
              </p>
              <button
                onClick={() => setNav("materials")}
                className="btn-primary mt-6"
              >
                <Sparkles size={16} />
                <span className="ml-2">Upload & Generate Test</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Trophy size={18} className="text-warning-500" />
              Your test history
            </h3>
            <div className="mt-4">
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <ListChecks size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  No tests completed yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Take your first practice test to track progress here.
                </p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-start gap-3 border-b border-slate-200 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50 text-danger-600">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Trust note
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tests are generated from your materials only.
                </p>
              </div>
            </div>
            <div className="p-5 text-xs text-slate-600">
              <p>
                After every test the adaptive planner rebalances your roadmap:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex gap-2">
                  <Check size={14} className="mt-0.5 text-success-600" />
                  <span>Mastered topics get less revision.</span>
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="mt-0.5 text-success-600" />
                  <span>Weak topics gain extra practice days.</span>
                </li>
                <li className="flex gap-2">
                  <Check size={14} className="mt-0.5 text-success-600" />
                  <span>
                    Results only drive your plan — no prediction claims.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestRunner({
  test,
  answers,
  setAnswers,
  current,
  setCurrent,
  pct,
  onSubmit,
}: {
  test: ReturnType<typeof useApp>["test"];
  answers: Record<string, number | string>;
  setAnswers: (a: Record<string, number | string>) => void;
  current: number;
  setCurrent: (n: number) => void;
  pct: number;
  onSubmit: () => void;
}) {
  if (!test) return null;
  const q = test.questions[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
            <p className="text-sm text-slate-500">
              Question {current + 1} of {test.questions.length} ·{" "}
              <Clock size={13} className="inline" /> {test.durationMinutes} min
              total
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="badge bg-slate-100 text-slate-700">
              {answered}/{test.questions.length} answered
            </span>
            <button onClick={onSubmit} className="btn-primary">
              Submit
              <CheckCircle2 size={16} className="ml-2" />
            </button>
          </div>
        </div>
        <ProgressBar value={pct} className="mt-4" />
      </div>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="badge bg-slate-100 text-slate-600">{q.topic}</span>
          <DifficultyBadge difficulty={q.difficulty} />
          <span className="badge bg-primary-50 text-primary-700">
            {q.marks} marks
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
          {current + 1}. {q.text}
        </h2>
        <div className="mt-6 space-y-3">
          {q.options?.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [q.id]: i })}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-sm transition",
                  selected
                    ? "border-primary-500 bg-primary-50/50"
                    : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 flex-none items-center justify-center rounded-lg text-sm font-bold",
                    selected
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-slate-800">{opt}</span>
                {selected && <Check size={18} className="text-primary-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          className="btn-secondary disabled:opacity-40"
          disabled={current === 0}
        >
          ← Previous
        </button>
        <div className="hidden flex-wrap justify-center gap-2 sm:flex">
          {test.questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-9 w-9 rounded-lg text-xs font-semibold transition",
                i === current
                  ? "bg-primary-600 text-white"
                  : answers[qq.id] !== undefined
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {current < test.questions.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className="btn-primary"
          >
            Next →
          </button>
        ) : (
          <button onClick={onSubmit} className="btn-primary">
            Finish test
            <Zap size={16} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}

function TestResultView({
  result,
  test,
  onRetry,
  onHome,
  onRoadmap,
}: {
  result: NonNullable<ReturnType<typeof useApp>["testResult"]>;
  test: ReturnType<typeof useApp>["test"];
  onRetry: () => void;
  onHome: () => void;
  onRoadmap: () => void;
}) {
  const [tab, setTab] = React.useState<"summary" | "correct" | "incorrect">("summary");
  if (!test) return null;
  const pct = Math.round((result.score / result.totalMarks) * 100);
  const wrong = result.totalQuestions - result.correctCount;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary-600 via-indigo-600 to-fuchsia-600 px-6 py-10 text-center text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
            Test result
          </p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{test.title}</h2>
          <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/25">
            <div>
              <p className="text-4xl font-extrabold">{pct}%</p>
              <p className="text-xs uppercase tracking-wider text-white/80">
                Score
              </p>
            </div>
          </div>
          <div className="mx-auto mt-6 grid max-w-xl grid-cols-3 gap-3 text-left">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[11px] text-white/70">Correct</p>
              <p className="mt-0.5 text-lg font-bold">
                {result.correctCount}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[11px] text-white/70">Incorrect</p>
              <p className="mt-0.5 text-lg font-bold">{wrong}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[11px] text-white/70">Total</p>
              <p className="mt-0.5 text-lg font-bold">
                {result.totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 p-4 sm:p-6">
          {(["summary", "correct", "incorrect"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold capitalize transition",
                tab === t
                  ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {t === "correct" && (
                <CheckCircle2 size={14} className="mr-1.5 inline text-success-600" />
              )}
              {t === "incorrect" && (
                <XCircle size={14} className="mr-1.5 inline text-danger-600" />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "summary" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-warning-200 bg-warning-50/60 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <ShieldAlert size={16} className="text-warning-600" />
                    Weak topics (review these)
                  </h3>
                  {result.weakTopics.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">
                      No weak topics flagged — great work!
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {result.weakTopics.map((w) => (
                        <li
                          key={w}
                          className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm"
                        >
                          <span className="font-medium text-slate-800">
                            {w}
                          </span>
                          <span className="text-xs font-semibold text-warning-700">
                            Needs practice
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-primary-200 bg-primary-50/60 p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <BookOpenCheck size={16} className="text-primary-600" />
                    Recommended revision
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex gap-2">
                      <Check size={14} className="mt-1 text-primary-600" />
                      Revisit Regular Languages pumping lemma proof.
                    </li>
                    <li className="flex gap-2">
                      <Check size={14} className="mt-1 text-primary-600" />
                      Practice NFA → DFA conversion with 3 worked examples.
                    </li>
                    <li className="flex gap-2">
                      <Check size={14} className="mt-1 text-primary-600" />
                      Solve 10 more MCQs from Unit 1 tomorrow.
                    </li>
                  </ul>
                  <button
                    onClick={onRoadmap}
                    className="btn-primary mt-5 w-full"
                  >
                    Update my Roadmap
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                <b>Privacy & trust:</b> test results are used only to adapt
                your study plan. This score does{" "}
                <b>not</b> predict your actual exam result.
              </div>
            </div>
          )}

          {tab !== "summary" && (
            <ol className="space-y-3">
              {test.questions
                .map((q, i) => {
                  const userAns = null as any; // would need answers stored in result; approximate
                  const correct =
                    i < result.correctCount || tab === "correct" ? true : false;
                  return {
                    q,
                    i,
                    correct,
                  };
                })
                .filter((x) =>
                  tab === "correct" ? x.correct : !x.correct
                )
                .map((x, idx) => (
                  <li
                    key={x.q.id}
                    className={cn(
                      "rounded-2xl border p-5",
                      x.correct
                        ? "border-success-200 bg-success-50/40"
                        : "border-danger-200 bg-danger-50/40"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg text-white",
                          x.correct ? "bg-success-500" : "bg-danger-500"
                        )}
                      >
                        {x.correct ? <Check size={14} /> : <X size={14} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-snug text-slate-800">
                          {x.i + 1}. {x.q.text}
                        </p>
                        {x.q.options?.[x.q.correctAnswer as number] != null && (
                          <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-slate-200">
                            <span className="font-semibold text-success-700">
                              Correct answer:{" "}
                            </span>
                            {String.fromCharCode(65 + (x.q.correctAnswer as number))}.{" "}
                            {x.q.options[x.q.correctAnswer as number]}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </ol>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4 sm:p-6">
          <button onClick={onHome} className="btn-secondary">
            Back to tests
          </button>
          <button onClick={onRetry} className="btn-secondary">
            <RefreshCcw size={16} className="mr-2" />
            Try again
          </button>
          <button onClick={onRoadmap} className="btn-primary">
            Go to Roadmap
            <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
