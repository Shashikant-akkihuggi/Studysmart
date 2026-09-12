import React from "react";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  color = "primary",
  showLabel = false,
  className,
}: {
  value: number;
  color?: "primary" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const colorClass = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  }[color];
  return (
    <div className={cn("progress-bar", className)}>
      <div
        className={cn("progress-fill", colorClass)}
        style={{ width: `${v}%` }}
      />
      {showLabel && (
        <p className="mt-1 text-xs font-medium text-slate-500">{v}%</p>
      )}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  accent = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "slate" | "primary" | "success" | "warning" | "danger";
}) {
  const wrap = {
    slate: "bg-slate-50 text-slate-600",
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
  }[accent];
  return (
    <div className="card card-hover p-5">
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
