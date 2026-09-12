"use client";

import React from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  List,
  Sparkles,
  Hash,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ProgressBar } from "@/components/ui/Progress";
import { DemoBadge, PriorityBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function NotesAnalysisPage() {
  const { notesAnalysis, topics, setNav } = useApp();
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    notesAnalysis.units.forEach((u, i) => (o[u.id] = i < 2));
    return o;
  });
  const [selTopicId, setSelTopicId] = React.useState<string | null>(
    topics[0]?.id ?? null
  );

  const toggle = (id: string) =>
    setOpen((o) => ({ ...o, [id]: !o[id] }));

  const selectedTopic = topics.find((t) => t.id === selTopicId) ?? topics[0];

  const totalTopics = notesAnalysis.units.reduce(
    (s, u) => s + u.topics.length,
    0
  );
  const avgProgress = totalTopics
    ? Math.round(
        notesAnalysis.units.reduce(
          (s, u) =>
            s + u.topics.reduce((ss, t) => ss + (t.progress ?? 0), 0),
          0
        ) / totalTopics
      )
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Notes Breakdown — {notesAnalysis.subject}
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Structured topic hierarchy extracted from your uploaded notes.
            Click a topic to see its importance and priority rationale.
          </p>
        </div>
        <button onClick={() => setNav("roadmap")} className="btn-primary">
          Use this to build Roadmap
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Units</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {notesAnalysis.units.length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Topics extracted</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {totalTopics}
          </p>
        </div>
        <div className="card p-5">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Average progress
          </p>
          <ProgressBar value={avgProgress} showLabel />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <List size={18} className="text-primary-500" />
              Topic Hierarchy
            </h3>
            <button
              onClick={() =>
                setOpen(
                  Object.fromEntries(notesAnalysis.units.map((u) => [u.id, true]))
                )
              }
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Expand all
            </button>
          </div>
          <div className="divide-y divide-slate-200">
            {notesAnalysis.units.map((unit) => {
              const isOpen = !!open[unit.id];
              const unitAvg = unit.topics.length
                ? Math.round(
                    unit.topics.reduce((s, t) => s + (t.progress ?? 0), 0) /
                      unit.topics.length
                  )
                : 0;
              return (
                <div key={unit.id}>
                  <button
                    onClick={() => toggle(unit.id)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {isOpen ? (
                        <ChevronDown size={18} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-400" />
                      )}
                      <FileText
                        size={18}
                        className="text-primary-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {unit.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {unit.topics.length} topics
                        </p>
                      </div>
                    </div>
                    <div className="w-40">
                      <ProgressBar value={unitAvg} />
                      <p className="mt-1 text-right text-[11px] font-semibold text-slate-600">
                        {unitAvg}%
                      </p>
                    </div>
                  </button>
                  {isOpen && (
                    <ul className="border-t border-slate-100 bg-slate-50/50">
                      {unit.topics.map((t) => {
                        const active = selTopicId === t.id;
                        return (
                          <li key={t.id}>
                            <button
                              onClick={() => setSelTopicId(t.id)}
                              className={cn(
                                "flex w-full items-center gap-4 px-6 py-3 text-left transition hover:bg-white",
                                active && "bg-primary-50/60"
                              )}
                            >
                              <Hash size={14} className="text-slate-400" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {t.name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {t.frequency
                                    ? `Appeared ${t.frequency}× in question papers`
                                    : "Detected from notes"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <PriorityBadge
                                  priority={t.priority}
                                  size="sm"
                                />
                                <div className="hidden w-28 sm:block">
                                  <ProgressBar value={t.progress ?? 0} />
                                </div>
                                <span className="text-xs font-semibold text-slate-600">
                                  {t.progress ?? 0}%
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles size={18} className="text-primary-500" />
              Selected Topic
            </h3>
            {selectedTopic ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {selectedTopic.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedTopic.unit} · {selectedTopic.subject}
                    </p>
                  </div>
                  <PriorityBadge priority={selectedTopic.priority} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Why it matters
                  </p>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                    {selectedTopic.reason}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniStat label="Progress" value={`${selectedTopic.progress}%`} />
                  <MiniStat label="Importance" value={`${selectedTopic.importance}/100`} />
                  <MiniStat
                    label="Frequency"
                    value={`${selectedTopic.frequency ?? 0}×`}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Mastery
                  </p>
                  <ProgressBar
                    value={selectedTopic.progress}
                    color={
                      selectedTopic.progress >= 70
                        ? "success"
                        : selectedTopic.progress >= 40
                          ? "warning"
                          : "primary"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNav("tutor")}
                    className="btn-secondary text-xs"
                  >
                    Ask AI about this
                  </button>
                  <button
                    onClick={() => setNav("roadmap")}
                    className="btn-primary text-xs"
                  >
                    Add to Today's Plan
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Select a topic to see details.
              </p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Lightbulb size={16} className="text-warning-500" />
              Structured notes — example
            </h3>
            <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              <p>
                <b className="text-slate-800">Chapters:</b> 4 units detected
              </p>
              <p>
                <b className="text-slate-800">Definitions:</b> 47 extracted
              </p>
              <p>
                <b className="text-slate-800">Formulas / Identities:</b> 18
              </p>
              <p>
                <b className="text-slate-800">Worked examples:</b> 31
              </p>
              <p>
                <b className="text-slate-800">Potential exam questions:</b> 22
                candidates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
