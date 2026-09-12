"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Activity,
  AnalysisStep,
  AuthError,
  ChatMessage,
  ExtractedQuestion,
  Material,
  Progress,
  StudyPlan,
  SubjectNotes,
  Test,
  TestResult,
  Topic,
  User,
} from "@/types";
import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  type FirebaseUser,
} from "@/lib/firebase";
import { uid } from "@/lib/utils";

// #region debug-point setup:trace-helpers
const __DBG = (() => {
  const SERVER = "http://127.0.0.1:7777/event";
  const SESSION = "login-blocked-after-valid-creds";
  const RUN = "pre-fix";
  let __seq = 0;
  return (hypothesisId, location, msg, data = {}) => {
    try {
      __seq += 1;
      fetch(SERVER, {
        method: "POST",
        body: JSON.stringify({
          sessionId: SESSION,
          runId: RUN,
          hypothesisId,
          location,
          msg: "[DEBUG] " + msg,
          data,
          ts: Date.now(),
          seq: __seq,
        }),
      }).catch(() => { });
    } catch (_) { }
  };
})();
// #endregion

type Screen =
  | "landing"
  | "login"
  | "signup"
  | "forgot"
  | "onboarding"
  | "app";

export type AppNav =
  | "dashboard"
  | "materials"
  | "analysis"
  | "notes-analysis"
  | "question-analysis"
  | "roadmap"
  | "tutor"
  | "tests"
  | "progress"
  | "settings";

interface AppState {
  screen: Screen;
  setScreen: (s: Screen) => void;
  nav: AppNav;
  setNav: (n: AppNav) => void;

  user: User | null;
  authLoading: boolean;
  authError: AuthError | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: Partial<User> & { password: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  skipOnboarding: () => void;

  materials: Material[];
  addMaterial: (m: Omit<Material, "id" | "uploadDate" | "status" | "uid">) => void;
  removeMaterial: (id: string) => void;
  processingSteps: AnalysisStep[];
  resetProcessingSteps: () => void;

  topics: Topic[];
  toggleTask: (taskId: string) => void;
  updateTopicProgress: (topicId: string, p: number) => void;

  extractedQuestions: ExtractedQuestion[];
  topicFrequency: { topic: string; count: number }[];
  notesAnalysis: SubjectNotes;

  studyPlan: StudyPlan;
  recomputeRoadmap: () => void;

  chat: ChatMessage[];
  sendMessage: (text: string) => void;

  test: Test | null;
  testResult: TestResult | null;
  startTest: () => void;
  submitTest: (answers: Record<string, number | string>) => void;

  progress: Progress;
  activities: Activity[];
  isDemo: boolean;
}

const AppContext = createContext<AppState | null>(null);

const EMPTY_PROGRESS: Progress = {
  overall: 0,
  topicsCompleted: 0,
  topicsTotal: 0,
  questionsSolved: 0,
  testsCompleted: 0,
  averageScore: 0,
  streak: 0,
  roadmapCompletion: 0,
  strongTopics: [],
  weakTopics: [],
};

const EMPTY_STUDY_PLAN: StudyPlan = {
  id: "",
  subject: "",
  examDate: new Date(),
  days: [],
  createdAt: new Date(),
};

const EMPTY_NOTES_ANALYSIS: SubjectNotes = {
  subject: "",
  units: [],
};

function mapFirestoreUser(fbUser: FirebaseUser, docData?: any): User {
  const name =
    docData?.name ??
    docData?.displayName ??
    fbUser.displayName ??
    fbUser.email?.split("@")[0] ??
    "Student";
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    name,
    displayName: docData?.displayName ?? fbUser.displayName ?? name,
    email: docData?.email ?? fbUser.email ?? "",
    course: docData?.course,
    semester: docData?.semester,
    subjects: docData?.subjects ?? [],
    examDate: docData?.examDate
      ? docData.examDate.toDate
        ? docData.examDate.toDate()
        : new Date(docData.examDate)
      : undefined,
    dailyStudyTime: docData?.dailyStudyTime,
    createdAt: docData?.createdAt
      ? docData.createdAt.toDate
        ? docData.createdAt.toDate()
        : new Date(docData.createdAt)
      : undefined,
    updatedAt: docData?.updatedAt
      ? docData.updatedAt.toDate
        ? docData.updatedAt.toDate()
        : new Date(docData.updatedAt)
      : undefined,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [nav, setNav] = useState<AppNav>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [processingSteps, setProcessingSteps] = useState<AnalysisStep[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan>(EMPTY_STUDY_PLAN);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [activities, setActivities] = useState<Activity[]>([]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const ensureUserDoc = useCallback(
    async (fbUser: FirebaseUser, overrides?: Partial<User>) => {
      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const payload: any = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName:
            overrides?.displayName ?? fbUser.displayName ?? overrides?.name,
          name:
            overrides?.name ??
            fbUser.displayName ??
            fbUser.email?.split("@")[0] ??
            "Student",
          course: overrides?.course,
          semester: overrides?.semester,
          subjects: overrides?.subjects ?? [],
          examDate: overrides?.examDate ?? null,
          dailyStudyTime: overrides?.dailyStudyTime ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, payload);
      }
      const updated = await getDoc(userRef);
      return mapFirestoreUser(fbUser, updated.data());
    },
    []
  );

  const fetchUserData = useCallback(
    async (fbUser: FirebaseUser): Promise<User> => {
      // #region debug-point A/D:fetchUserData-entry
      __DBG("D", "AppContext.fetchUserData:entry",
        "fetchUserData starting", { fbUid: fbUser.uid }
      );
      // #endregion
      try {
        const userRef = doc(db, "users", fbUser.uid);
        const snap = await getDoc(userRef);
        // #region debug-point D:fetchUserData-snap
        __DBG("D", "AppContext.fetchUserData:snap",
          "fetchUserData firestore read done", {
          fbUid: fbUser.uid,
          exists: snap.exists(),
        }
        );
        // #endregion
        let parsed;
        try {
          parsed = mapFirestoreUser(
            fbUser,
            snap.exists() ? snap.data() : undefined
          );
        } catch (mapErr) {
          // #region debug-point D:fetchUserData-map-err
          __DBG("D", "AppContext.fetchUserData:map-err",
            "mapFirestoreUser threw", {
            fbUid: fbUser.uid,
            message: (mapErr as any)?.message ?? String(mapErr),
          }
          );
          // #endregion
          throw mapErr;
        }
        // #region debug-point D:fetchUserData-ok
        __DBG("D", "AppContext.fetchUserData:ok",
          "fetchUserData completed", {
          appUid: parsed.uid,
          name: parsed.name,
        }
        );
        // #endregion
        return parsed;
      } catch (e: any) {
        // #region debug-point D:fetchUserData-err
        __DBG("D", "AppContext.fetchUserData:err",
          "fetchUserData firestore error", {
          fbUid: fbUser.uid,
          code: e?.code ?? "unknown",
          message: e?.message ?? String(e),
        }
        );
        // #endregion
        throw e;
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      // #region debug-point H1/H2/H3/H5:login-start
      __DBG("A", "AppContext.login:entry", "login started", {
        emailLen: email.length,
        screenAtEntry: screen,
        userAtEntry: user?.uid ?? null,
        authLoadingAtEntry: authLoading,
      });
      // #endregion
      setAuthLoading(true);
      setAuthError(null);
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // #region debug-point A:signin-ok
        __DBG("A", "AppContext.login:after-signin",
          "signInWithEmailAndPassword succeeded", {
          fbUid: cred.user.uid,
          isEmailVerified: cred.user.emailVerified,
        }
        );
        // #endregion
        // #region debug-point A:fetchuser-start
        __DBG("A", "AppContext.login:before-fetch",
          "login fetchUserData starting", { fbUid: cred.user.uid }
        );
        // #endregion
        const appUser = await fetchUserData(cred.user);
        // #region debug-point A:fetchuser-ok
        __DBG("A", "AppContext.login:after-fetch",
          "login fetchUserData succeeded", {
          appUid: appUser.uid,
          email: appUser.email,
          name: appUser.name,
        }
        );
        // #endregion
        setUser(appUser);
        // #region debug-point A:set-screen-app
        __DBG("E", "AppContext.login:setScreen-app",
          "login() about to set screen='app' + nav='dashboard'",
          { fromScreen: screen, fromNav: nav }
        );
        // #endregion
        setScreen("app");
        setNav("dashboard");
        return true;
      } catch (e: any) {
        // #region debug-point A:login-err
        __DBG("A", "AppContext.login:catch",
          "login threw an error", {
          code: e?.code ?? "unknown",
          message: e?.message ?? String(e),
        }
        );
        // #endregion
        setAuthError({
          code: e?.code ?? "auth/unknown",
          message:
            e?.code === "auth/invalid-credential" ||
              e?.code === "auth/user-not-found" ||
              e?.code === "auth/wrong-password"
              ? "Invalid email or password. Please try again."
              : e?.message ?? "Sign in failed. Please try again.",
        });
        return false;
      } finally {
        // #region debug-point A:login-finally
        __DBG("A", "AppContext.login:finally",
          "login() finally sets authLoading=false",
          { aboutToSetAuthLoading: false }
        );
        // #endregion
        setAuthLoading(false);
      }
    },
    [fetchUserData, screen, nav, user, authLoading]
  );

  const signup = useCallback(
    async (data: Partial<User> & { password: string }): Promise<boolean> => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        if (!data.email) throw new Error("Email is required");
        if (!data.password) throw new Error("Password is required");
        const cred = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        const appUser = await ensureUserDoc(cred.user, {
          name: data.name,
          displayName: data.name,
          course: data.course,
          semester: data.semester,
          subjects: data.subjects,
          examDate: data.examDate,
          dailyStudyTime: data.dailyStudyTime,
        });
        setUser(appUser);
        if (
          !appUser.course ||
          !appUser.subjects.length ||
          !appUser.examDate
        ) {
          setScreen("onboarding");
        } else {
          setScreen("app");
          setNav("materials");
        }
        return true;
      } catch (e: any) {
        let msg = e?.message ?? "Sign up failed. Please try again.";
        if (e?.code === "auth/email-already-in-use") {
          msg = "That email is already registered. Try signing in instead.";
        } else if (e?.code === "auth/weak-password") {
          msg = "Password is too weak. Use at least 6 characters.";
        } else if (e?.code === "auth/invalid-email") {
          msg = "Please enter a valid email address.";
        }
        setAuthError({ code: e?.code ?? "auth/unknown", message: msg });
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [ensureUserDoc]
  );

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const appUser = await ensureUserDoc(cred.user);
      setUser(appUser);
      if (
        !appUser.course ||
        !appUser.subjects.length ||
        !appUser.examDate
      ) {
        setScreen("onboarding");
      } else {
        setScreen("app");
        setNav("dashboard");
      }
      return true;
    } catch (e: any) {
      if (e?.code !== "auth/cancelled-popup-request" &&
        e?.code !== "auth/popup-closed-by-user") {
        setAuthError({
          code: e?.code ?? "auth/unknown",
          message: e?.message ?? "Google sign-in failed. Please try again.",
        });
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [ensureUserDoc]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      setMaterials([]);
      setTopics([]);
      setStudyPlan(EMPTY_STUDY_PLAN);
      setChat([]);
      setTestResult(null);
      setProgress(EMPTY_PROGRESS);
      setActivities([]);
      setScreen("landing");
    }
  }, []);

  const forgotPassword = useCallback(
    async (email: string): Promise<boolean> => {
      setAuthError(null);
      try {
        await sendPasswordResetEmail(auth, email);
        return true;
      } catch (e: any) {
        setAuthError({
          code: e?.code ?? "auth/unknown",
          message: e?.message ?? "Could not send reset link. Please try again.",
        });
        return false;
      }
    },
    []
  );

  const updateUser = useCallback(
    async (patch: Partial<User>): Promise<void> => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const fbPatch: any = {
          updatedAt: serverTimestamp(),
        };
        if ("course" in patch) fbPatch.course = patch.course ?? null;
        if ("semester" in patch) fbPatch.semester = patch.semester ?? null;
        if ("subjects" in patch) fbPatch.subjects = patch.subjects ?? [];
        if ("examDate" in patch)
          fbPatch.examDate = patch.examDate ?? null;
        if ("dailyStudyTime" in patch)
          fbPatch.dailyStudyTime = patch.dailyStudyTime ?? null;
        if ("name" in patch) {
          fbPatch.name = patch.name;
          fbPatch.displayName = patch.name;
        }
        await updateDoc(userRef, fbPatch);
        setUser((u) => (u ? { ...u, ...patch } : u));
      } catch (e) {
        console.error("updateUser error:", e);
      }
    },
    [user]
  );

  const skipOnboarding = useCallback(() => {
    setScreen("app");
    setNav("materials");
  }, []);

  const addMaterial = useCallback(
    (m: Omit<Material, "id" | "uploadDate" | "status" | "uid">) => {
      if (!user) return;
      const nm: Material = {
        ...m,
        id: uid(),
        uid: user.uid,
        uploadDate: new Date(),
        status: "uploading",
      };
      setMaterials((prev) => [nm, ...prev]);
      setTimeout(() => {
        setMaterials((prev) =>
          prev.map((x) => (x.id === nm.id ? { ...x, status: "analyzing" } : x))
        );
      }, 1000);
      setTimeout(() => {
        setMaterials((prev) =>
          prev.map((x) => (x.id === nm.id ? { ...x, status: "completed" } : x))
        );
      }, 3500);
    },
    [user]
  );

  const removeMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const resetProcessingSteps = useCallback(() => {
    const initial: AnalysisStep[] = [
      { label: "Reading documents", completed: false },
      { label: "Extracting topics", completed: false },
      { label: "Analyzing syllabus", completed: false },
      { label: "Identifying questions", completed: false },
      { label: "Finding repeated questions", completed: false },
      { label: "Detecting important topics", completed: false },
      { label: "Creating study roadmap", completed: false },
    ];
    setProcessingSteps(initial);
    initial.forEach((_, i) => {
      setTimeout(() => {
        setProcessingSteps((prev) =>
          prev.map((s, idx) => (idx <= i ? { ...s, completed: true } : s))
        );
      }, 900 * (i + 1));
    });
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setStudyPlan((sp) => ({
      ...sp,
      days: sp.days.map((d) => ({
        ...d,
        tasks: d.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      })),
    }));
  }, []);

  const updateTopicProgress = useCallback((topicId: string, p: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, progress: p } : t))
    );
  }, []);

  const recomputeRoadmap = useCallback(() => {
    setStudyPlan((sp) => ({ ...sp, createdAt: new Date() }));
  }, []);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMsg]);
  }, []);

  const startTest = useCallback(() => {
    setTestResult(null);
  }, []);

  const submitTest = useCallback((_answers: Record<string, number | string>) => {
    setTestResult(null);
  }, []);

  useEffect(() => {
    const isFirebaseConfigured =
      auth &&
      typeof (auth as unknown as { onAuthStateChanged?: unknown })
        .onAuthStateChanged === "function" &&
      db &&
      typeof (db as unknown as { collection?: unknown }).collection ===
      "function";

    if (!isFirebaseConfigured) {
      // #region debug-point setup:firebase-not-configured
      __DBG("?", "AppContext.observer:abort", "Firebase not configured at useEffect mount, skipping observer");
      // #endregion
      setAuthLoading(false);
      return undefined;
    }

    // #region debug-point H3:observer-mounted
    __DBG("C", "AppContext.observer:mount",
      "onAuthStateChanged observer mounted", { capturedScreen: screen }
    );
    // #endregion
    try {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        // #region debug-point B/C/E:observer-fired
        __DBG("B", "AppContext.observer:fired",
          "onAuthStateChanged observer fired", {
          fbUid: fbUser?.uid ?? null,
          screenWhenFired: screen,
          currentUserBefore: user?.uid ?? null,
          currentAuthLoading: authLoading,
        }
        );
        // #endregion
        setAuthLoading(true);
        try {
          if (fbUser) {
            // #region debug-point B:observer-fetchuser-start
            __DBG("B", "AppContext.observer:before-fetch",
              "observer about to call fetchUserData", {
              fbUid: fbUser.uid,
            }
            );
            // #endregion
            const appUser = await fetchUserData(fbUser);
            // #region debug-point B:observer-fetchuser-ok
            __DBG("B", "AppContext.observer:after-fetch",
              "observer fetchUserData succeeded", {
              appUid: appUser.uid,
              screenBeforeSet: screen,
              willRedirect:
                screen === "landing" ||
                screen === "login" ||
                screen === "signup",
            }
            );
            // #endregion
            setUser(appUser);
            if (screen === "landing" || screen === "login" || screen === "signup") {
              // #region debug-point E:observer-set-screen-app
              __DBG("E", "AppContext.observer:setScreen-app",
                "observer redirecting screen='app'", { from: screen }
              );
              // #endregion
              setScreen("app");
              setNav("dashboard");
            }
          } else {
            // #region debug-point B:observer-no-user
            __DBG("B", "AppContext.observer:signed-out",
              "observer got signed-out user", { screenBefore: screen }
            );
            // #endregion
            setUser(null);
            setScreen("landing");
          }
        } catch (e) {
          // #region debug-point B/H1:observer-error
          __DBG("A", "AppContext.observer:catch",
            "!!! observer catch block executing !!!", {
            code: (e as any)?.code ?? "unknown",
            message: (e as any)?.message ?? String(e),
            stack: (e as any)?.stack ? "present" : "absent",
            screenBeforeCatch: screen,
          }
          );
          // #endregion
          console.error("auth state change error:", e);
          setUser(null);
          // #region debug-point A/H1:observer-set-landing-from-catch
          __DBG("A", "AppContext.observer:catch-setScreen-landing",
            "observer catch setting screen=landing", { from: screen }
          );
          // #endregion
          setScreen("landing");
        } finally {
          // #region debug-point B:observer-finally
          __DBG("B", "AppContext.observer:finally",
            "observer finally setting authLoading=false"
          );
          // #endregion
          setAuthLoading(false);
        }
      });
      return () => {
        // #region debug-point C:observer-unmounted
        __DBG("C", "AppContext.observer:unmount",
          "observer unsubscribed (deps changed or component unmounting)",
          { screen: screen }
        );
        // #endregion
        unsub();
      };
    } catch (e) {
      console.warn("[AppContext] Firebase Auth unavailable at runtime:", e);
      setAuthLoading(false);
      return undefined;
    }
  }, [fetchUserData, screen, user, authLoading]);

  const value = useMemo<AppState>(
    () => ({
      screen,
      setScreen,
      nav,
      setNav,
      user,
      authLoading,
      authError,
      clearAuthError,
      login,
      signup,
      loginWithGoogle,
      logout,
      forgotPassword,
      updateUser,
      skipOnboarding,
      materials,
      addMaterial,
      removeMaterial,
      processingSteps,
      resetProcessingSteps,
      topics,
      toggleTask,
      updateTopicProgress,
      extractedQuestions: [],
      topicFrequency: [],
      notesAnalysis: EMPTY_NOTES_ANALYSIS,
      studyPlan,
      recomputeRoadmap,
      chat,
      sendMessage,
      test: null,
      testResult,
      startTest,
      submitTest,
      progress,
      activities,
      isDemo: false,
    }),
    [
      screen,
      nav,
      user,
      authLoading,
      authError,
      clearAuthError,
      login,
      signup,
      loginWithGoogle,
      logout,
      forgotPassword,
      updateUser,
      skipOnboarding,
      materials,
      addMaterial,
      removeMaterial,
      processingSteps,
      resetProcessingSteps,
      topics,
      toggleTask,
      updateTopicProgress,
      studyPlan,
      recomputeRoadmap,
      chat,
      sendMessage,
      testResult,
      startTest,
      submitTest,
      progress,
      activities,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
