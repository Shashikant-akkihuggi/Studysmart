"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TopicPriority } from "@/types";
import { useApp } from "@/context/AppContext";

export function PriorityBadge({
  priority,
  size = "md",
}: {
  priority: TopicPriority;
  size?: "sm" | "md";
}) {
  const base = "badge";
  const sz =
    size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs";
  if (priority === "high")
    return (
      <span className={cn(base, "badge-high", sz)}>
        🔴 High Priority
      </span>
    );
  if (priority === "medium")
    return (
      <span className={cn(base, "badge-medium", sz)}>
        🟠 Medium Priority
      </span>
    );
  return (
    <span className={cn(base, "badge-low", sz)}>🟢 Low Priority</span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "ready" || status === "completed")
    return (
      <span className="badge bg-success-50 text-success-600">
        <span className="mr-1">✓</span> Ready
      </span>
    );
  if (status === "uploaded")
    return (
      <span className="badge bg-success-50 text-success-600">
        <span className="mr-1">✓</span> Uploaded
      </span>
    );
  if (status === "processing" || status === "analyzing")
    return (
      <span className="badge bg-primary-50 text-primary-700">
        <span className="mr-1 inline-block animate-spin">◌</span> Processing…
      </span>
    );
  if (status === "uploading")
    return (
      <span className="badge bg-warning-50 text-warning-600">
        <span className="mr-1">↑</span> Uploading…
      </span>
    );
  if (status === "failed")
    return <span className="badge bg-danger-50 text-danger-600">Failed</span>;
  return <span className="badge bg-slate-100 text-slate-600">{status}</span>;
}

export function DemoBadge() {
  const { isDemo } = useApp();
  if (!isDemo) return null;
  return (
    <span className="badge bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
      DEMO DATA
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: "easy" | "medium" | "hard";
}) {
  if (difficulty === "easy")
    return (
      <span className="badge bg-success-50 text-success-600">Easy</span>
    );
  if (difficulty === "medium")
    return (
      <span className="badge bg-warning-50 text-warning-600">Medium</span>
    );
  return <span className="badge bg-danger-50 text-danger-600">Hard</span>;
}
