"use client";

import React from "react";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload as UploadIcon,
  Trash2,
  X,
  Sparkles,
  Book,
  ClipboardCheck,
  BookOpen,
  BookCopy,
  FolderKanban,
  MoreHorizontal,
  FileType,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { MaterialCategory } from "@/types";
import { StatusBadge, DemoBadge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";

const CATEGORIES: { key: MaterialCategory; label: string; icon: React.ReactNode; hint: string }[] = [
  { key: "notes", label: "Notes", icon: <Book size={16} />, hint: "Class notes, handwritten, typed" },
  { key: "question_paper", label: "Question Paper", icon: <ClipboardCheck size={16} />, hint: "Previous year papers, sample papers" },
  { key: "syllabus", label: "Syllabus", icon: <BookOpen size={16} />, hint: "Syllabus document" },
  { key: "textbook", label: "Textbook", icon: <BookCopy size={16} />, hint: "Chapters, reference books" },
  { key: "assignment", label: "Assignment", icon: <FolderKanban size={16} />, hint: "Assignments, worksheets" },
  { key: "other", label: "Other", icon: <MoreHorizontal size={16} />, hint: "Slides, cheat sheets, etc." },
];

const ACCEPTED = ".pdf,.docx,.pptx,.txt,.png,.jpg,.jpeg,.webp";

function fileTypeOf(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "Image";
  if (ext === "pdf") return "PDF";
  if (["docx", "doc"].includes(ext)) return "DOCX";
  if (["pptx", "ppt"].includes(ext)) return "PPTX";
  if (ext === "txt") return "TXT";
  return ext.toUpperCase() || "File";
}

function fileIconFor(type: string, name: string) {
  if (type === "Image") return <FileImage size={20} className="text-rose-500" />;
  if (name.endsWith(".pdf")) return <FileText size={20} className="text-danger-500" />;
  if (name.endsWith(".docx") || name.endsWith(".doc"))
    return <FileSpreadsheet size={20} className="text-blue-500" />;
  return <FileType size={20} className="text-slate-500" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsPage() {
  const { materials, addMaterial, removeMaterial, setNav, resetProcessingSteps } = useApp();
  const [drag, setDrag] = React.useState(false);
  const [category, setCategory] = React.useState<MaterialCategory>("notes");
  const [subject, setSubject] = React.useState("Theory of Computation");
  const [filter, setFilter] = React.useState<"all" | MaterialCategory>("all");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((f) => {
      addMaterial({
        name: f.name,
        category,
        type: fileTypeOf(f.name),
        size: f.size,
        subject,
      });
    });
  };

  const filtered = filter === "all" ? materials : materials.filter((m) => m.category === filter);
  const counts = CATEGORIES.map((c) => ({
    ...c,
    count: materials.filter((m) => m.category === c.key).length,
  }));
  const allCount = materials.length;

  const analyze = () => {
    resetProcessingSteps();
    setNav("analysis");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Study Materials
            </h1>
            <DemoBadge />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Upload notes, question papers, syllabus, and more. The AI will analyze
            everything together.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={analyze} className="btn-secondary">
            <Sparkles size={16} />
            <span className="ml-2">Analyze with AI</span>
          </button>
          <button onClick={() => setNav("analysis")} className="btn-primary">
            View Analysis →
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-primary-300",
            filter === "all" && "border-primary-500 ring-2 ring-primary-500/10"
          )}
        >
          <p className="text-xs font-medium text-slate-500">All</p>
          <p className="mt-0.5 text-xl font-bold text-slate-900">{allCount}</p>
        </button>
        {counts.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={cn(
              "rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-primary-300",
              filter === c.key && "border-primary-500 ring-2 ring-primary-500/10"
            )}
          >
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              {c.icon}
              {c.label}
            </div>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{c.count}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFiles(e.dataTransfer.files);
            }}
            className={cn(
              "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition",
              drag
                ? "border-primary-500 bg-primary-50/40"
                : "border-slate-300 bg-white hover:border-primary-300 hover:bg-slate-50/60"
            )}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <UploadIcon size={26} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Drag & drop your files here
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              or click to browse. PDF, DOCX, PPTX, TXT, PNG, JPG.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="badge bg-slate-100 text-slate-600">PDF</span>
              <span className="badge bg-slate-100 text-slate-600">DOCX</span>
              <span className="badge bg-slate-100 text-slate-600">PPTX</span>
              <span className="badge bg-slate-100 text-slate-600">TXT</span>
              <span className="badge bg-slate-100 text-slate-600">Images</span>
            </div>
          </div>

          <div className="card mt-5 p-5">
            <h4 className="text-sm font-semibold text-slate-800">
              Upload settings
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              These apply to the next files you upload.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as MaterialCategory)
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label} — {c.hint}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Subject</label>
                <select
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option>Theory of Computation</option>
                  <option>Computer Networks</option>
                  <option>Database Systems</option>
                  <option>Operating Systems</option>
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                    category === c.key
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-primary-300"
                  )}
                >
                  {c.icon}
                  <div className="flex-1">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-[11px] font-normal text-slate-500">
                      {c.hint}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Uploaded files
              </h3>
              <span className="text-xs text-slate-500">
                {filtered.length} file{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="max-h-[560px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">
                  <X size={22} className="mb-2 text-slate-400" />
                  No files yet. Drop some to the left!
                </div>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((m) => (
                    <li
                      key={m.id}
                      className="group rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-50">
                          {fileIconFor(m.type, m.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {m.name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span>{m.type}</span>
                            <span>·</span>
                            <span>{formatSize(m.size)}</span>
                            <span>·</span>
                            <span>{formatDate(m.uploadDate)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <StatusBadge status={m.status} />
                            <button
                              onClick={() => removeMaterial(m.id)}
                              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-danger-50 hover:text-danger-600 group-hover:opacity-100"
                              aria-label="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-slate-200 p-4">
              <button onClick={analyze} className="btn-primary w-full">
                <Sparkles size={16} />
                <span className="ml-2">
                  Analyze {allCount} file{allCount === 1 ? "" : "s"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
