"use client";

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

function AuthShell({
  title,
  subtitle,
  children,
  back,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  back?: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => back?.()}
              className={cn(
                "btn-ghost -ml-2",
                !back && "pointer-events-none opacity-0"
              )}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Sparkles size={15} />
              </div>
              <span className="text-sm font-bold tracking-tight">
                StudySmart
              </span>
            </div>
            <div className="w-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-fuchsia-600 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.15),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <GraduationCap size={28} />
            <span className="text-lg font-bold">StudySmart</span>
          </div>
          <div>
            <BookOpenCheck size={48} className="mb-5 opacity-90" />
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Smarter prep, fewer all-nighters.
            </h2>
            <p className="mt-4 max-w-md text-white/85">
              Upload once. Get a personalized, exam-aligned study plan,
              sourced entirely from your own materials.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Question-paper frequency analysis",
                "Notes-sourced AI answers with page citations",
                "Adaptive roadmap that shifts with your performance",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                    ✓
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} StudySmart.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthErrorBanner() {
  const { authError, clearAuthError } = useApp();
  if (!authError) return null;
  return (
    <div
      className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <span>{authError.message}</span>
        <button
          type="button"
          onClick={clearAuthError}
          className="text-danger-500 hover:text-danger-700"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function GoogleButton({ onLogin, disabled }: { onLogin: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onLogin}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-slate-50"
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="#EA4335" d="M12 11v3.2h5.3c-.2 1.4-1.7 4.1-5.3 4.1-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.9 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12S6.9 21 12 21c6.9 0 9.1-4.9 9.1-7.3 0-.5 0-.9-.1-1.3L12 11z" />
      </svg>
      {disabled ? "Signing in…" : "Continue with Google"}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
      <div className="h-px flex-1 bg-slate-200" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function LoginPage() {
  const { login, loginWithGoogle, setScreen, authLoading } = useApp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setSubmitting(false);
    }
  };
  const disabled = submitting || authLoading;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your study plan."
      back={() => setScreen("landing")}
    >
      <AuthErrorBanner />
      <GoogleButton onLogin={() => loginWithGoogle()} disabled={disabled} />
      <Divider label="Or sign in with email" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            disabled={disabled}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@university.edu"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label mb-0">Password</label>
            <button
              type="button"
              onClick={() => setScreen("forgot")}
              disabled={disabled}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            required
            disabled={disabled}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1.5"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 size={16} className="ml-2 animate-spin" />
              <span className="ml-2">Signing in…</span>
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => setScreen("signup")}
          disabled={disabled}
          className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          Create one
        </button>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const { signup, loginWithGoogle, setScreen, authLoading, clearAuthError } = useApp();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  React.useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup({ name, email, password });
    } finally {
      setSubmitting(false);
    }
  };
  const disabled = submitting || authLoading;
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your AI-powered study journey in under 60 seconds."
      back={() => setScreen("landing")}
    >
      <AuthErrorBanner />
      <GoogleButton onLogin={() => loginWithGoogle()} disabled={disabled} />
      <Divider label="Or create with email" />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            type="text"
            required
            disabled={disabled}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Alex Johnson"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            disabled={disabled}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@university.edu"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            minLength={6}
            disabled={disabled}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>
        <p className="text-xs text-slate-500">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
        <button type="submit" className="btn-primary w-full" disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 size={16} className="ml-2 animate-spin" />
              <span className="ml-2">Creating account…</span>
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          onClick={() => setScreen("login")}
          disabled={disabled}
          className="font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { setScreen, forgotPassword, authLoading } = useApp();
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const disabled = submitting || authLoading;
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We&apos;ll send you a link to set a new one."
      back={() => setScreen("login")}
    >
      <AuthErrorBanner />
      {sent ? (
        <div className="card p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
            ✓
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Link sent
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            If <b>{email || "your email"}</b> is registered, check your inbox
            for a reset link.
          </p>
          <button
            onClick={() => setScreen("login")}
            className="btn-primary mt-5 w-full"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
              const ok = await forgotPassword(email);
              if (ok) setSent(true);
            } finally {
              setSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              disabled={disabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@university.edu"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 size={16} className="ml-2 animate-spin" />
                <span className="ml-2">Sending link…</span>
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export function OnboardingPage() {
  const { user, updateUser, skipOnboarding, setScreen } = useApp();
  const [step, setStep] = React.useState(0);
  const [course, setCourse] = React.useState(user?.course ?? "");
  const [sem, setSem] = React.useState(user?.semester ?? "");
  const [subjects, setSubjects] = React.useState<string[]>(
    user?.subjects ?? []
  );
  const [examDate, setExamDate] = React.useState<string>(
    user?.examDate ? new Date(user.examDate).toISOString().slice(0, 10) : ""
  );
  const [studyTime, setStudyTime] = React.useState<number>(
    user?.dailyStudyTime ?? 120
  );
  const [subjectInput, setSubjectInput] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const totalSteps = 4;
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  const addSubject = () => {
    const v = subjectInput.trim();
    if (v && !subjects.includes(v)) {
      setSubjects([...subjects, v]);
      setSubjectInput("");
    }
  };

  const next = async () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else {
      setSaving(true);
      try {
        await updateUser({
          course,
          semester: sem,
          subjects,
          examDate: examDate ? new Date(examDate) : undefined,
          dailyStudyTime: studyTime,
        });
        setScreen("app");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Sparkles size={15} />
            </div>
            <span className="text-sm font-bold tracking-tight">
              StudySmart
            </span>
          </div>
          <button
            onClick={skipOnboarding}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Skip for now
          </button>
        </div>

        <div className="mb-2 text-xs font-medium text-slate-500">
          Step {step + 1} of {totalSteps}
        </div>
        <div className="progress-bar mb-8">
          <div className="progress-fill bg-primary-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="card p-6 sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                What are you studying, {user?.name?.split(" ")[0]}?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                (Optional — you can fill this in later.)
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="label">Course / Degree</label>
                  <input
                    className="input"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B.Tech Computer Science"
                  />
                </div>
                <div>
                  <label className="label">Semester / Year</label>
                  <select
                    className="input"
                    value={sem}
                    onChange={(e) => setSem(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8", "Year 1", "Year 2", "Year 3", "Year 4"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                What subjects are you preparing?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Add one or more. You can always add more later.
              </p>
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                    placeholder="Theory of Computation"
                  />
                  <button type="button" onClick={addSubject} className="btn-secondary">
                    Add
                  </button>
                </div>
                {subjects.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                      >
                        {s}
                        <button
                          onClick={() =>
                            setSubjects(subjects.filter((x) => x !== s))
                          }
                          className="text-primary-500 hover:text-primary-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500">
                    Quick suggestions
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      "Theory of Computation",
                      "Computer Networks",
                      "Database Systems",
                      "Operating Systems",
                      "Data Structures",
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !subjects.includes(s) && setSubjects([...subjects, s])}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition",
                          subjects.includes(s)
                            ? "border-primary-300 bg-primary-50 text-primary-700"
                            : "border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
                        )}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                When is your next exam?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                We&apos;ll align your study roadmap to this date.
              </p>
              <div className="mt-6">
                <label className="label">Exam date</label>
                <input
                  type="date"
                  className="input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                How much time can you study each day?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                We&apos;ll split your roadmap into realistic daily sessions.
              </p>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Daily study time
                  </span>
                  <span className="text-sm font-bold text-primary-700">
                    {Math.floor(studyTime / 60)}h {studyTime % 60}m
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={480}
                  step={15}
                  value={studyTime}
                  onChange={(e) => setStudyTime(Number(e.target.value))}
                  className="mt-3 w-full accent-primary-600"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>30m</span>
                  <span>8h</span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[60, 120, 180, 240].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setStudyTime(m)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm font-medium transition",
                        studyTime === m
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-slate-200 text-slate-600 hover:border-primary-300"
                      )}
                    >
                      {m / 60}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => (step === 0 ? skipOnboarding() : setStep(step - 1))}
              className="btn-secondary"
              disabled={saving}
            >
              {step === 0 ? "Skip" : "Back"}
            </button>
            <button onClick={next} className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="ml-2 animate-spin" />
                  <span className="ml-2">Saving…</span>
                </>
              ) : (
                <>
                  {step === totalSteps - 1 ? "Finish & Start" : "Continue"}
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
