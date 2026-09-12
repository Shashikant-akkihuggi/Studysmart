"use client";

import React, { useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import AppLayout from "./AppLayout";
import DashboardPage from "./pages/DashboardPage";
import MaterialsPage from "./pages/MaterialsPage";
import AnalysisPage from "./pages/AnalysisPage";
import NotesAnalysisPage from "./pages/NotesAnalysisPage";
import QuestionAnalysisPage from "./pages/QuestionAnalysisPage";
import RoadmapPage from "./pages/RoadmapPage";
import TutorPage from "./pages/TutorPage";
import TestsPage from "./pages/TestsPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import {
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  OnboardingPage,
} from "./pages/AuthPages";

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
          <Sparkles size={26} />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading StudySmart…</span>
        </div>
      </div>
    </div>
  );
}

const SERVER = "http://127.0.0.1:7777/event";
const SESSION = "login-blocked-after-valid-creds";
const RUN = "pre-fix";
const __DBG_SHELL = (hyp, loc, msg, data = {}) => {
  try {
    fetch(SERVER, {
      method: "POST",
      body: JSON.stringify({
        sessionId: SESSION,
        runId: RUN,
        hypothesisId: hyp,
        location: "AppShell." + loc,
        msg: "[DEBUG] " + msg,
        data,
        ts: Date.now(),
      }),
    }).catch(() => { });
  } catch (_) { }
};

export default function AppShell() {
  const { screen, nav, authLoading, user } = useApp();

  // #region debug-point render:AppShell-branch
  useEffect(() => {
    __DBG_SHELL("E", "render", "AppShell render branch computed", {
      screen,
      nav,
      authLoading,
      userUid: user?.uid ?? null,
    });
  }, [screen, nav, authLoading, user?.uid]);
  // #endregion

  if (authLoading) {
    // #region debug-point H2:AppShell-loading
    __DBG_SHELL("B", "loading-render",
      "AppShell rendering AuthLoadingScreen (authLoading=true)",
      { userUid: user?.uid ?? null, screen, nav }
    );
    // #endregion
    return <AuthLoadingScreen />;
  }

  if (screen === "landing") return <LandingPage />;
  if (screen === "login") return <LoginPage />;
  if (screen === "signup") return <SignupPage />;
  if (screen === "forgot") return <ForgotPasswordPage />;
  if (screen === "onboarding") return <OnboardingPage />;

  let content: React.ReactNode = null;
  switch (nav) {
    case "dashboard":
      content = <DashboardPage />;
      break;
    case "materials":
      content = <MaterialsPage />;
      break;
    case "analysis":
      content = <AnalysisPage />;
      break;
    case "notes-analysis":
      content = <NotesAnalysisPage />;
      break;
    case "question-analysis":
      content = <QuestionAnalysisPage />;
      break;
    case "roadmap":
      content = <RoadmapPage />;
      break;
    case "tutor":
      content = <TutorPage />;
      break;
    case "tests":
      content = <TestsPage />;
      break;
    case "progress":
      content = <ProgressPage />;
      break;
    case "settings":
      content = <SettingsPage />;
      break;
    default:
      content = <DashboardPage />;
  }

  return <AppLayout>{content}</AppLayout>;
}
