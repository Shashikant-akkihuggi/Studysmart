# Firebase Integration — Tasks Plan

Root spec: `./spec.md`
Repo root: `d:\sfsaf\ai\study-smart`
Framework audit: **Next.js 14.2.5 App Router (SPA, ssr:false dynamic import)** → env var prefix = `NEXT_PUBLIC_FIREBASE_*`.
Existing state model: React Context `AppContext.tsx` → keep same `useApp()` signature; swap internals.

## Task 1: Install Firebase SDK + create env template
**Priority**: high | Depends on: none
**Files to write/change**: `package.json` (dependency installed), new `.env.example` file
**AC covered**: FR1, R9
**Test Requirements (TR)**:
- (rule) `npm ls firebase` returns installed version after install.
- (rule) `.env.example` lists exactly 6 `NEXT_PUBLIC_FIREBASE_*` keys, no VITE_ keys.
**Instructions**:
1. Run `npm install firebase --save` from repo root.
2. Create `.env.example` in repo root listing the 6 `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,STORAGE_BUCKET,MESSAGING_SENDER_ID,APP_ID}` with empty value placeholders.

---

## Task 2: Create `src/lib/firebase.ts` single-init module
**Priority**: high | Depends on: Task 1
**Files to write/change**: new `src/lib/firebase.ts`
**AC covered**: FR1, NFR3
**TR**:
- (rule) Module exports `{ app, auth, db }` typed as `FirebaseApp`, `Auth`, `Firestore`.
- (rule) Uses `getApps().length === 0` guard before `initializeApp`; no runtime duplicate-app crash.
- (rule) Enables `longPolling` optional or default Firestore settings fine; no usage of `getStorage` (Cloud Storage is excluded, per user).
**Instructions**:
1. Export a single `firebaseConfig` object populated from `process.env.NEXT_PUBLIC_FIREBASE_*`.
2. Guarded `initializeApp`.
3. `getAuth(app)`, `getFirestore(app)`.

---

## Task 3: Firestore data-type converters + serialization helpers
**Priority**: medium | Depends on: Task 2
**Files to write/change**: new `src/lib/firestore.ts`
**AC covered**: FR4, NFR2
**TR**:
- (rule) Define `toFirestore`/`fromFirestore` helpers for the top-level types in `src/types/index.ts` (`User`, `Material`, `Topic`, `StudyPlan`, `ChatMessage`, `Test`, `TestResult`, `Progress`, `Activity`, `ExtractedQuestion`, `AnalysisStep[]`, `SubjectNotes`, `TopicFrequencyRow`) that convert JS `Date` ↔ Firestore Timestamp safely.
- (rubric) TS strict-friendly: no `any` casts without single-line reason. Scale: 2 = none, 1 = ≤2, 0 = >2.
**Instructions**:
1. For each type with dates, explicitly run date fields through `Timestamp` to/from conversion.
2. Add a small `withConverter<T>` builder so listeners can run typed returns.

---

## Task 4: Rewire `AppContext.tsx` to Firebase (auth + core state)
**Priority**: high | Depends on: Tasks 2, 3
**Files to change**: `src/context/AppContext.tsx`
**AC covered**: FR2, FR3, FR4, FR5, FR6, FR8
**TR**:
- (rule) `useEffect` runs `onAuthStateChanged(auth, user => {...})` once, unsubscribes on unmount.
- (rule) On new Firebase user signup/login (UID not yet in `users/{uid}`), perform `setDoc(usersRef, {...data}, {merge: true})` exactly once; fields = `uid, email, displayName, createdAt, updatedAt` plus `course/semester/subjects/examDate/dailyStudyTime`.
- (rule) On auth change *to signed-out*, clear all in-context study state (materials=[], topics=[], progress=resetProgressDefault(), user=null, chat=[], testResult=null, studyPlan=resetPlanDefault()).
- (rule) While `onAuthStateChanged` has not fired first tick → `state.authLoading = true`; afterwards false.
- (rule) `login(email, password)` now returns Promise<boolean> (or async; keep boolean return if desired; await `signInWithEmailAndPassword`).
- (rule) `signup(data: Partial<User> & {password:string})` runs `createUserWithEmailAndPassword` then writes user doc (writing already covered in onAuth handler is sufficient; if needed also await a one-time merge).
- (rule) `googleLogin()` action added: runs `signInWithPopup(auth, new GoogleAuthProvider())`.
- (rule) `logout()` now calls `signOut(auth)`.
- (rule) `forgotPassword(email)` calls `sendPasswordResetEmail` and returns true on success.
- (rule) Friendly error mapping for `auth/email-already-in-use`, `auth/invalid-email`, `auth/user-not-found`, `auth/wrong-password`, `auth/popup-blocked`, `auth/network-request-failed`.
- (rule) Subscriptions (`onSnapshot`) for each collection under `users/{uid}/...` are established in a chained effect with dep on uid, returning an unsubscribe function to avoid leaks; uid change tears down old subs then builds new.
- (rule) `isDemo: false` permanently set in context value (replace `true`), and DEMO DATA badge UI will continue to show because AppLayout's `<DemoBadge/>` is used elsewhere. *We will repurpose DemoBadge to label sample content if needed; for now keep the badge component intact as-is per the strict no-UI-redesign rule.*
- (rubric) Backward compatibility with existing `useApp()` consumers: 2 = unchanged hook signature except adding `authLoading`/`authError`/`googleLogin`/`forgotPassword`, 1 = 1-2 pages need small optional chain fixes, 0 = >2 pages break.

---

## Task 5: Wire existing AuthPages UI to new context actions
**Priority**: high | Depends on: Task 4
**Files to change**: `src/components/pages/AuthPages.tsx`
**AC covered**: FR2, R6, R11, R12
**TR**:
- (rule) LoginPage submit calls `await login(email,password)` and sets any error message inline below submit button using `authError` from context.
- (rule) SignupPage submit calls `await signup({name,email,password})` with error inline.
- (rule) GoogleButton → calls `googleLogin()` in both LoginPage and SignupPage.
- (rule) ForgotPasswordPage submit → calls `await forgotPassword(email)` then toggles `sent=true` only on success.
- (rule) Loading state on submit buttons: disable button + text "Signing in..." / "Creating account..." / "Sending..." while `authLoading || submitting`.
- (rubric) U1 reuse: 2 = no DOM structure changes except `<p className="text-xs text-danger-600 mt-2">` for errors and a small disabled state on button. 1 = 1-2 new wrappers; 0 = full restructure.

---

## Task 6: Auth guard + `AppShell` loading flash removal
**Priority**: high | Depends on: Task 4
**Files to change**: `src/components/AppShell.tsx`
**AC covered**: FR6, R10
**TR**:
- (rule) If `authLoading === true` return a centered small spinner (3 dots, existing palette). Do not render Landing or Login yet.
- (rule) If Firebase user is non-null → force `screen = auth state needs onboarding ? "onboarding" : "app"`.
- (rule) If Firebase user is null → allow `screen ∈ {landing, login, signup, forgot}`.

---

## Task 7: Write `firestore.rules` file for strict user isolation
**Priority**: high | Depends on: Task 4
**Files to write**: new `firestore.rules` (repo root)
**AC covered**: FR7, R8
**TR**:
- (rule) Top-level `match /databases/{db}/documents`:
  - `match /users/{uid}` + nested `match /{document=**}` → allow read/write if `request.auth.uid == uid`.
  - `match /{document=**}` outside users → deny all explicitly.
- (rubric) U2 isolation: 2 = strict subcollection path-only + explicit deny; 1 = uid field check only; 0 = rules missing or public read.

---

## Task 8: Empty state defaults and per-page robustness
**Priority**: medium | Depends on: Task 4
**Files to change**: Inspect each page for hardcoded-index access like `topics[0]` / `studyPlan.days[0]` → fix with optional chaining and empty copy. Pages: `DashboardPage.tsx`, `MaterialsPage.tsx`, `AnalysisPage.tsx`, `NotesAnalysisPage.tsx`, `QuestionAnalysisPage.tsx`, `RoadmapPage.tsx`, `TutorPage.tsx`, `TestsPage.tsx`, `ProgressPage.tsx`, `SettingsPage.tsx`.
**AC covered**: R7, FR5
**TR**:
- (rule) For each page, assert in dev: reload page with fresh user → no JS runtime crash, renders readable copy.
- (rule) If a component needs an empty state message to feel non-broken, add a minimal `.card` with neutral color matching the existing DEMO visual style; do NOT change existing grids when data exists.
- (rubric) Empty-state fidelity: 2 = matches existing card style; 1 = mismatched CSS but usable; 0 = still crashes.

---

## Task 9: Build pass + lint + dev smoke
**Priority**: high | Depends on: Tasks 1-8
**Files**: terminal only
**AC covered**: R1, R2, R3, R4, R5, R6, R7, R11
**TR**:
- (rule) `npm run build` exit 0.
- (rule) `npm run lint` no new ESLint errors that block build.
- (rule) Manual 5-step smoke in browser:
  1. Open incognito → landing matches visual baseline.
  2. Click Sign up → new user → check Firestore doc created (R3).
  3. Refresh → still logged in (R4).
  4. Click Sign out → back to landing (R5).
  5. Wrong password inline error (R6).
- (rule) Google login: attempt flow; if popup fails due to missing env setup it should inline-error gracefully.

---

## Task 10: Security rules deployment instructions + user next steps handoff
**Priority**: low | Depends on: Task 7
**Files to write**: none (handoff text to user in final response; do NOT add a README or markdown file).
**AC covered**: R8
**TR**:
- (rule) Handoff response lists exact cmd for rules deploy: `firebase deploy --only firestore:rules` — no secrets shared.
- (rule) Lists `.env.local` vars required.

---

## Dependencies order
T1 → T2 → T3 → T4 → (T5, T6, T7) → T8 → T9 → T10
