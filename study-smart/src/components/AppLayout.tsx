"use client";

import React from "react";
import {
  BookOpen,
  BrainCircuit,
  ClipboardList,
  FileBarChart,
  FileStack,
  Flame,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Route,
  Settings as SettingsIcon,
  Sparkles,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn, formatDate } from "@/lib/utils";
import { DemoBadge } from "./ui/Badge";
import type { AppNav } from "@/context/AppContext";

type NavItem = {
  key: AppNav;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "materials", label: "Materials", icon: <FileStack size={18} /> },
  { key: "analysis", label: "AI Analysis", icon: <Sparkles size={18} /> },
  { key: "notes-analysis", label: "Notes Breakdown", icon: <BookOpen size={18} /> },
  { key: "question-analysis", label: "Question Analysis", icon: <FileBarChart size={18} /> },
  { key: "roadmap", label: "Study Roadmap", icon: <Route size={18} /> },
  { key: "tutor", label: "AI Tutor", icon: <MessageSquare size={18} /> },
  { key: "tests", label: "Practice Tests", icon: <ClipboardList size={18} /> },
  { key: "progress", label: "Progress", icon: <BrainCircuit size={18} /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
];

function Sidebar({
  mobileOpen,
  closeMobile,
}: {
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const { nav, setNav, user, logout, progress } = useApp();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                StudySmart
              </p>
              <p className="text-[11px] text-slate-500">AI Study Planner</p>
            </div>
          </div>
          <button
            onClick={closeMobile}
            className="btn-ghost p-1.5 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setNav(item.key);
                closeMobile();
              }}
              className={cn(
                "w-full nav-link",
                nav === item.key && "nav-link-active"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Study streak</span>
                  <span className="flex items-center gap-1 font-semibold text-orange-600">
                    <Flame size={14} /> {progress.streak} days
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="nav-link w-full justify-start !text-danger-600 hover:!bg-danger-50"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}

function MobileBottomNav() {
  const { nav, setNav } = useApp();
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-1 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setNav(item.key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium",
              nav === item.key
                ? "bg-primary-50 text-primary-700"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {item.icon}
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function Topbar({ openMobile }: { openMobile: () => void }) {
  const { user } = useApp();
  const examDate = user?.examDate;
  const days = examDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={openMobile}
          className="btn-ghost p-2 lg:hidden"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-5 rounded bg-slate-600" />
          <span className="mt-1 block h-0.5 w-5 rounded bg-slate-600" />
          <span className="mt-1 block h-0.5 w-5 rounded bg-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-slate-800 sm:text-base">
              {user?.subjects?.[0] ?? "Study Dashboard"}
            </h2>
            <DemoBadge />
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {examDate && days != null && (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
              <span className="font-medium text-slate-500">Next exam: </span>
              <span className="font-semibold text-slate-800">
                {formatDate(examDate)}
              </span>
              <span className="ml-2 rounded-full bg-danger-50 px-2 py-0.5 font-semibold text-danger-600">
                {days}d left
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar openMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
