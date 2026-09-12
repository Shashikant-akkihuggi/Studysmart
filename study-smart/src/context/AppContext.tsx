"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Activity,
  AnalysisStep,
  AuthError,
  ChatMessage,
  ExtractedQuestion,
  Material,
  MaterialStatus,
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
  const SERVER = "http://127.0.0.1:7788/event";
  const SESSION = "firestore-perm-denied";
  const RUN = "pre-fix";
  let __seq = 0;
  return (hypothesisId: string, location: string, msg: string, data: Record<string, any> = {}) => {
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
  addMaterial: (m: Omit<Material, "id" | "uploadDate" | "status" | "uid" | "createdAt" | "updatedAt" | "b2Bucket" | "b2ObjectKey">) => Promise<string | null>;
  updateMaterialStatus: (materialId: string, updates: { status?: MaterialStatus; b2Bucket?: string; b2ObjectKey?: string; errorMessage?: string }) => Promise<void>;
  removeMaterial: (id: string) => Promise<void>;
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

  const screenRef = useRef<Screen>(screen);
  const userRef = useRef<User | null>(user);
  const authLoadingRef = useRef<boolean>(authLoading);
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { authLoadingRef.current = authLoading; }, [authLoading]);

  const isManualAuthActionRef = useRef<boolean>(false);

  // #region debug-point H3:firebase-app-project-id
  useEffect(() => {
    try {
      let proj: string | null = null;
      let authDom: string | null = null;
      let appName: string | null = null;
      try {
        const anyAuth: any = auth;
        const appFromAuth = anyAuth?.app;
        if (appFromAuth && typeof appFromAuth === "object") {
          const opts: any = (appFromAuth as any).options;
          if (opts && typeof opts === "object") {
            proj = opts?.projectId ?? null;
            authDom = opts?.authDomain ?? null;
            appName = opts?.appId ?? null;
          }
        }
      } catch (_) { }
      __DBG("H3", "AppContext.mount:firebase-project",
        "Firebase App projectId + authDomain verified at AppProvider mount",
        {
          expectedProjectId: "ai-study-assistant-8dcfb",
          sdkProjectId: proj,
          projectIdMatches: proj === "ai-study-assistant-8dcfb",
          sdkAuthDomain: authDom,
          sdkAppIdLast6: appName ? appName.slice(-6) : null,
          isBrowser: typeof window !== "undefined",
        }
      );
    } catch (_) { }

    let rejHandler: ((ev: PromiseRejectionEvent) => void) | null = null;
    let errHandler: ((ev: ErrorEvent) => void) | null = null;
    try {
      if (typeof window !== "undefined") {
        rejHandler = (ev: PromiseRejectionEvent) => {
          try {
            const r: any = ev.reason;
            __DBG("H4", "AppContext.global:unhandledrejection",
              "Global unhandledrejection caught (possible firestore denied)",
              {
                reasonCode: r?.code ?? null,
                reasonName: r?.name ?? null,
                reasonMessage: r?.message
                  ? String(r.message).slice(0, 300)
                  : String(ev.reason).slice(0, 300),
                reasonStack: r?.stack ? "present" : "absent",
                evType: "unhandledrejection",
              }
            );
          } catch (_) { }
        };
        errHandler = (ev: ErrorEvent) => {
          try {
            __DBG("H4", "AppContext.global:error-event",
              "Global window.error caught",
              {
                evMessage: String(ev.message || "").slice(0, 300),
                evFilename: ev.filename ? ev.filename.split("/").pop() : null,
                evLine: ev.lineno ?? null,
                evCol: ev.colno ?? null,
                stack: ev.error?.stack ? "present" : "absent",
              }
            );
          } catch (_) { }
        };
        (window as any).addEventListener("unhandledrejection", rejHandler);
        (window as any).addEventListener("error", errHandler);
      }
    } catch (_) { }

    return () => {
      try {
        if (typeof window !== "undefined") {
          if (rejHandler) (window as any).removeEventListener("unhandledrejection", rejHandler);
          if (errHandler) (window as any).removeEventListener("error", errHandler);
        }
      } catch (_) { }
    };
  }, []);
  // #endregion

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const ensureUserDoc = useCallback(
    async (fbUser: FirebaseUser, overrides?: Partial<User>) => {
      const userRef = doc(db, "users", fbUser.uid);
      // #region debug-point H2:ensureUserDoc-path
      __DBG("H2", "AppContext.ensureUserDoc:build-ref",
        "ensureUserDoc about to read/write firestore", {
        fbUid: fbUser.uid,
        firestorePath: "/users/" + fbUser.uid,
        pathCollectionName: "users",
        pathDocId: fbUser.uid,
        docUidEqualsAuthUid: (fbUser.uid === fbUser.uid),
        overridesName: overrides?.name ?? null,
        overridesCourse: overrides?.course ?? null,
      }
      );
      // #endregion
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        // Build payload with explicit undefined filtering
        const rawPayload: any = {
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

        // Remove undefined fields - Firestore rejects undefined but accepts null
        const payload: any = {};
        for (const key in rawPayload) {
          if (rawPayload[key] !== undefined) {
            payload[key] = rawPayload[key];
          }
        }

        // #region debug-point H2:ensureUserDoc-write-payload
        __DBG("H2", "AppContext.ensureUserDoc:write-doc",
          "ensureUserDoc writing new user doc to firestore", {
          firestorePath: "/users/" + fbUser.uid,
          payloadUid: payload.uid,
          payloadEmail: payload.email,
          payloadName: payload.name,
          payloadKeys: Object.keys(payload).join(","),
          removedUndefinedFields: Object.keys(rawPayload).filter(k => rawPayload[k] === undefined).join(",") || "none",
        }
        );
        // #endregion
        await setDoc(userRef, payload);
      }
      const updated = await getDoc(userRef);
      const readData = updated.data();
      // #region debug-point H2:ensureUserDoc-read-back
      __DBG("H2", "AppContext.ensureUserDoc:read-back",
        "ensureUserDoc read back after write (or existing)", {
        firestorePath: "/users/" + fbUser.uid,
        exists: updated.exists(),
        docStoredUid: readData?.uid ?? null,
        docStoredUidEqualsAuthUid: readData ? readData.uid === fbUser.uid : null,
      }
      );
      // #endregion
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
        // #region debug-point H1/H2:fetchUserData-ref
        __DBG("H2", "AppContext.fetchUserData:build-ref",
          "fetchUserData about to call getDoc", {
          fbUid: fbUser.uid,
          firestorePath: "/users/" + fbUser.uid,
          pathCollectionName: "users",
          pathDocId: fbUser.uid,
          pathMatchesExpectedPattern: true,
        }
        );
        // #endregion
        const snap = await getDoc(userRef);
        // #region debug-point D:fetchUserData-snap
        __DBG("D", "AppContext.fetchUserData:snap",
          "fetchUserData firestore read done", {
          fbUid: fbUser.uid,
          exists: snap.exists(),
          docId: snap.id,
          docPath: snap.ref?.path ?? null,
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
        __DBG("H1", "AppContext.fetchUserData:err",
          "fetchUserData firestore error (permission-denied?)", {
          fbUid: fbUser.uid,
          code: e?.code ?? "unknown",
          name: e?.name ?? "unknown",
          message: e?.message ?? String(e),
          cause: e?.cause ? String(e.cause) : null,
          firestoreErrorCode: e?.code === "permission-denied" ? "PERMISSION_DENIED" : e?.code ?? "other",
          firestoreReadPath: "/users/" + fbUser.uid,
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
      const screenAtEntry = screenRef.current;
      const navAtEntry = nav;
      const userAtEntry = userRef.current;
      const authLoadingAtEntry = authLoadingRef.current;
      // #region debug-point H1/H2/H3/H5:login-start
      __DBG("A", "AppContext.login:entry", "login started", {
        emailLen: email.length,
        screenAtEntry,
        userAtEntry: userAtEntry?.uid ?? null,
        authLoadingAtEntry,
      });
      // #endregion
      isManualAuthActionRef.current = true;
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
          { fromScreen: screenAtEntry, fromNav: navAtEntry }
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
        setTimeout(() => { isManualAuthActionRef.current = false; }, 0);
      }
    },
    [fetchUserData, nav]
  );

  const signup = useCallback(
    async (data: Partial<User> & { password: string }): Promise<boolean> => {
      isManualAuthActionRef.current = true;
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
        setTimeout(() => { isManualAuthActionRef.current = false; }, 0);
      }
    },
    [ensureUserDoc]
  );

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    isManualAuthActionRef.current = true;
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
      setTimeout(() => { isManualAuthActionRef.current = false; }, 0);
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
        if ("name" in patch && patch.name !== undefined) {
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
    async (m: Omit<Material, "id" | "uploadDate" | "status" | "uid" | "createdAt" | "updatedAt" | "b2Bucket" | "b2ObjectKey">) => {
      if (!user) return null;

      const materialId = uid();
      const now = new Date();

      const newMaterial: Material = {
        ...m,
        id: materialId,
        uid: user.uid,
        uploadDate: now,
        createdAt: now,
        updatedAt: now,
        status: "uploading",
        b2Bucket: "", // Will be set after successful upload
        b2ObjectKey: "", // Will be set after successful upload
      };

      // Optimistically add to local state
      setMaterials((prev) => [newMaterial, ...prev]);

      return materialId;
    },
    [user]
  );

  const updateMaterialStatus = useCallback(
    async (
      materialId: string,
      updates: {
        status?: MaterialStatus;
        b2Bucket?: string;
        b2ObjectKey?: string;
        errorMessage?: string;
      }
    ) => {
      if (!user) return;

      try {
        const materialRef = doc(db, "materials", materialId);
        const updateData: any = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        await setDoc(materialRef, updateData, { merge: true });

        // Update local state
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === materialId
              ? { ...m, ...updates, updatedAt: new Date() }
              : m
          )
        );
      } catch (error) {
        console.error("Failed to update material:", error);
        // Update local state with error
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === materialId
              ? { ...m, status: "failed" as MaterialStatus, errorMessage: "Update failed" }
              : m
          )
        );
      }
    },
    [user]
  );

  const removeMaterial = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        // Optimistically remove from local state
        setMaterials((prev) => prev.filter((m) => m.id !== id));

        // Delete from Firestore
        const materialRef = doc(db, "materials", id);
        await deleteDoc(materialRef);
      } catch (error) {
        console.error("Failed to delete material:", error);
        // TODO: Restore material to local state if needed
      }
    },
    [user]
  );

  // Load materials from Firestore when user changes
  useEffect(() => {
    if (!user) {
      setMaterials([]);
      return;
    }

    const materialsQuery = query(
      collection(db, "materials"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      materialsQuery,
      (snapshot) => {
        const loadedMaterials = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid,
            name: data.name,
            originalFilename: data.originalFilename,
            category: data.category,
            type: data.type,
            mimeType: data.mimeType,
            size: data.size,
            subject: data.subject,
            subjectId: data.subjectId,
            status: data.status,
            b2Bucket: data.b2Bucket,
            b2ObjectKey: data.b2ObjectKey,
            uploadDate: data.uploadDate?.toDate?.() || new Date(data.uploadDate),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            errorMessage: data.errorMessage,
          } as Material;
        });

        // Sort by upload date (newest first)
        loadedMaterials.sort(
          (a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()
        );

        setMaterials(loadedMaterials);
      },
      (error) => {
        console.error("Failed to load materials:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
      "onAuthStateChanged observer mounted", { capturedScreen: screenRef.current }
    );
    // #endregion
    try {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        const screenNow = screenRef.current;
        const userNow = userRef.current;
        const authLoadingNow = authLoadingRef.current;
        const manualAction = isManualAuthActionRef.current;
        // #region debug-point B/C/E:observer-fired
        __DBG("B", "AppContext.observer:fired",
          "onAuthStateChanged observer fired", {
          fbUid: fbUser?.uid ?? null,
          screenWhenFired: screenNow,
          currentUserBefore: userNow?.uid ?? null,
          currentAuthLoading: authLoadingNow,
          manualActionInProgress: manualAction,
        }
        );
        // #endregion

        if (manualAction && fbUser) {
          __DBG("B", "AppContext.observer:skipped-manual",
            "observer skipping because manual auth action already handling state",
            { fbUid: fbUser.uid }
          );
          return;
        }

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
            let appUser: User;
            try {
              appUser = await fetchUserData(fbUser);
            } catch (fetchErr: any) {
              __DBG("A", "AppContext.observer:fetch-fallback",
                "fetchUserData failed, falling back to Firebase auth profile",
                {
                  fbUid: fbUser.uid,
                  code: fetchErr?.code ?? "unknown",
                  message: fetchErr?.message ?? String(fetchErr),
                }
              );
              appUser = {
                id: fbUser.uid,
                uid: fbUser.uid,
                name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Student",
                displayName: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Student",
                email: fbUser.email ?? "",
                course: undefined,
                semester: undefined,
                subjects: [],
                examDate: undefined,
                dailyStudyTime: undefined,
                createdAt: undefined,
                updatedAt: undefined,
              };
            }
            // #region debug-point B:observer-fetchuser-ok
            __DBG("B", "AppContext.observer:after-fetch",
              "observer fetchUserData (or fallback) succeeded", {
              appUid: appUser.uid,
              screenBeforeSet: screenNow,
              willRedirect:
                screenNow === "landing" ||
                screenNow === "login" ||
                screenNow === "signup",
            }
            );
            // #endregion
            setUser(appUser);
            if (screenNow === "landing" || screenNow === "login" || screenNow === "signup") {
              // #region debug-point E:observer-set-screen-app
              __DBG("E", "AppContext.observer:setScreen-app",
                "observer redirecting screen='app'", { from: screenNow }
              );
              // #endregion
              setScreen("app");
              setNav("dashboard");
            }
          } else {
            // #region debug-point B:observer-no-user
            __DBG("B", "AppContext.observer:signed-out",
              "observer got signed-out user", { screenBefore: screenNow }
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
            screenBeforeCatch: screenNow,
            fbUid: fbUser?.uid ?? null,
          }
          );
          // #endregion
          console.error("auth state change error:", e);
          if (fbUser) {
            __DBG("A", "AppContext.observer:catch-fbuser-present",
              "catch block: fbUser present, building fallback user instead of redirecting to landing",
              { fbUid: fbUser.uid }
            );
            const fallback: User = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Student",
              displayName: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Student",
              email: fbUser.email ?? "",
              course: undefined,
              semester: undefined,
              subjects: [],
              examDate: undefined,
              dailyStudyTime: undefined,
              createdAt: undefined,
              updatedAt: undefined,
            };
            setUser(fallback);
            if (screenNow === "landing" || screenNow === "login" || screenNow === "signup") {
              setScreen("app");
              setNav("dashboard");
            }
          } else {
            setUser(null);
            // #region debug-point A/H1:observer-set-landing-from-catch
            __DBG("A", "AppContext.observer:catch-setScreen-landing",
              "observer catch setting screen=landing (fbUser is null)", { from: screenNow }
            );
            // #endregion
            setScreen("landing");
          }
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
          "observer unsubscribed (fetchUserData changed or component unmounting)",
          { screen: screenRef.current }
        );
        // #endregion
        unsub();
      };
    } catch (e) {
      console.warn("[AppContext] Firebase Auth unavailable at runtime:", e);
      setAuthLoading(false);
      return undefined;
    }
  }, [fetchUserData]);

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
      updateMaterialStatus,
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
      updateMaterialStatus,
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
