"use client";

import React from "react";
import {
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  GraduationCap,
  Mail,
  Shield,
  Sparkles,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DemoBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, updateUser, materials, logout, setNav } = useApp();
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [course, setCourse] = React.useState(user?.course ?? "");
  const [sem, setSem] = React.useState(user?.semester ?? "");
  const [examDate, setExamDate] = React.useState<string>(
    user?.examDate ? new Date(user.examDate).toISOString().slice(0, 10) : ""
  );
  const [studyTime, setStudyTime] = React.useState<number>(
    user?.dailyStudyTime ?? 180
  );
  const [subjectInput, setSubjectInput] = React.useState("");
  const [subjects, setSubjects] = React.useState<string[]>(user?.subjects ?? []);
  const [saved, setSaved] = React.useState(false);

  const [notifications, setNotifications] = React.useState({
    daily: true,
    roadmap: true,
    weak: true,
    weekly: false,
  });

  const addSubject = () => {
    const v = subjectInput.trim();
    if (v && !subjects.includes(v)) {
      setSubjects([...subjects, v]);
      setSubjectInput("");
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      course,
      semester: sem,
      subjects,
      examDate: examDate ? new Date(examDate) : undefined,
      dailyStudyTime: studyTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile, preferences and data.
          </p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Card title="Profile" icon={<UserCircle2 size={18} />} subtitle="Your student identity on StudySmart.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Course / Degree">
              <input
                className="input"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech Computer Science"
              />
            </Field>
            <Field label="Semester / Year">
              <select
                className="input"
                value={sem}
                onChange={(e) => setSem(e.target.value)}
              >
                <option value="">Select…</option>
                {[
                  "Semester 1",
                  "Semester 2",
                  "Semester 3",
                  "Semester 4",
                  "Semester 5",
                  "Semester 6",
                  "Semester 7",
                  "Semester 8",
                  "Year 1",
                  "Year 2",
                  "Year 3",
                  "Year 4",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-2">
            <Field label="Subjects you're preparing">
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={subjectInput}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSubject())
                  }
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="Add subject"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="btn-secondary"
                >
                  Add
                </button>
              </div>
              {subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                    >
                      <BookOpen size={13} />
                      {s}
                      <button
                        type="button"
                        onClick={() =>
                          setSubjects(subjects.filter((x) => x !== s))
                        }
                        className="text-primary-400 hover:text-primary-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </Card>

        <Card
          title="Exam & Study"
          icon={<GraduationCap size={18} />}
          subtitle="Drive the AI roadmap with these settings."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Upcoming exam date">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-slate-400" />
                <input
                  type="date"
                  className="input flex-1"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
            </Field>
            <Field label={`Daily study time: ${Math.floor(studyTime / 60)}h ${studyTime % 60}m`}>
              <div className="space-y-2">
                <input
                  type="range"
                  min={30}
                  max={480}
                  step={15}
                  value={studyTime}
                  onChange={(e) => setStudyTime(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[60, 120, 180, 300].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setStudyTime(m)}
                      className={cn(
                        "rounded-xl border px-2 py-1.5 font-medium transition",
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
            </Field>
          </div>
        </Card>

        <Card
          title="Notifications"
          icon={<Bell size={18} />}
          subtitle="We'll only ping you about the important stuff."
        >
          <div className="space-y-3">
            {[
              {
                k: "daily",
                title: "Daily study reminder",
                desc: "A nudge at the start of each planned study day.",
              },
              {
                k: "roadmap",
                title: "Roadmap updates",
                desc: "When your plan adapts after a test.",
              },
              {
                k: "weak",
                title: "Weak topic alerts",
                desc: "When we detect a gap worth addressing.",
              },
              {
                k: "weekly",
                title: "Weekly progress digest",
                desc: "A recap every Sunday.",
              },
            ].map((row) => {
              const on = (notifications as any)[row.k] as boolean;
              return (
                <label
                  key={row.k}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {row.title}
                    </p>
                    <p className="text-xs text-slate-500">{row.desc}</p>
                  </div>
                  <span
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [row.k]: !on,
                      })
                    }
                    className={cn(
                      "relative mt-1 flex h-6 w-11 flex-none cursor-pointer rounded-full transition",
                      on ? "bg-primary-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                        on ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </span>
                </label>
              );
            })}
          </div>
        </Card>

        <Card
          title="Data & Privacy"
          icon={<Shield size={18} />}
          subtitle="Control the materials you've uploaded and your account."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Info icon={<Database size={16} />} label="Uploaded materials" value={`${materials.length} files`} />
            <Info icon={<Mail size={16} />} label="Email verified" value="Yes (demo)" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setNav("materials")}
              className="btn-secondary"
            >
              Manage files
            </button>
            <button
              type="button"
              className="btn-secondary !text-danger-600 hover:!bg-danger-50"
            >
              <Trash2 size={15} className="mr-1.5" />
              Clear all data
            </button>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={logout}
            className="btn-secondary !text-slate-700"
          >
            Sign out
          </button>
          <button type="submit" className="btn-primary">
            Save changes
            {saved && (
              <CheckCircle2 size={16} className="ml-2 text-success-100" />
            )}
          </button>
          {saved && (
            <span className="badge bg-success-50 text-success-700">
              ✓ Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
