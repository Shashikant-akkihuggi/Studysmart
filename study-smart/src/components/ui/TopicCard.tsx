import React from "react";
import type { Topic } from "@/types";
import { ProgressBar } from "./Progress";
import { PriorityBadge } from "./Badge";

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-semibold text-slate-900">
            {topic.name}
          </h4>
          {topic.unit && (
            <p className="mt-0.5 text-xs text-slate-500">{topic.unit}</p>
          )}
        </div>
        <PriorityBadge priority={topic.priority} size="sm" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {topic.reason}
      </p>
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">
            {topic.progress}%
          </span>
        </div>
        <ProgressBar
          value={topic.progress}
          color={
            topic.progress >= 70
              ? "success"
              : topic.progress >= 40
                ? "warning"
                : "primary"
          }
        />
      </div>
      {topic.frequency != null && (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span>
            📄 Appeared <b className="text-slate-700">{topic.frequency}x</b>{" "}
            in previous papers
          </span>
        </div>
      )}
    </div>
  );
}
