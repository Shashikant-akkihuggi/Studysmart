# Firebase Integration Spec — StudySmart AI Study Assistant

## Problem
StudySmart is a Next.js 14 App Router SPA built with React 18 + TypeScript 5 + Tailwind 3. The UI is complete and MUST NOT be redesigned. Today, every user-facing feature (authentication, subjects, materials, topics, roadmap, tests, progress) is hardcoded in `src/data/demoData.ts` and consumed through `AppContext` with in-memory state. The project has no backend.

We need to replace only the demo/data layer with real Firebase services without altering the component tree, visual layout, navigation flow, badge system, color palette, chart libraries, or any CSS/Tailwind tokens.

## Users & Goals
- **Student end-user** — signs up, uploads materials, gets analysis/roadmap; data should persist across sessions, survive refresh, and never be visible to another UID.
- **Platform owner (user)** — deploys their own Firebase project "AI Study Assistant" with Email/Password + Google Auth + Cloud Firestore enabled.
- **Maintainer** — easily swaps Firestore listeners later for Backblaze B2 + server-side RAG endpoints (NOT in scope today).

## Non-Goals (explicit out of scope)
- Any UI redesign: layout, colors, spacing, nav, component visuals, icons, copy, DEMO DATA badge labeling system.
- Backblaze B2 integration or any file storage upload (user explicitly deferred).
- LLM / RAG / AI question-answering / embedding pipeline.
- Payment / subscription tier enforcement in Firestore.
- Server-side code or Next.js API route handlers.
- Firebase Cloud Storage for files.
- Storing passwords anywhere in Firestore (Firebase Auth handles hashing).
- Predicting exact exam questions; existing trust-rule wording stays.

## Functional Requirements (FR)
FR1. **Firebase SDK install + env-driven config**
- `firebase` package installed via npm.
- Single clean init module under `src/lib/firebase.ts` exporting only `app`, `auth`, `db`.
- Env vars use **Next.js App Router public prefix** `NEXT_PUBLIC_FIREBASE_*` (not VITE_*):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- Initialize exactly once; no per-component `initializeApp`.

FR2. **Authentication wired to existing UI screens**
- Reuse existing LoginPage / SignupPage / ForgotPasswordPage / GoogleButton components and `AppShell` screen router.
- Implement Email+Password signup → `createUserWithEmailAndPassword`.
- Implement Email+Password login → `signInWithEmailAndPassword`.
- Implement Google login → `signInWithPopup` + `GoogleAuthProvider`.
- Implement Logout → `signOut` via existing Sidebar "Sign out" button and Settings "Sign out" button.
- Implement Forgot Password → `sendPasswordResetEmail`.
- Auth state persistence: use default `LOCAL` persistence so refresh keeps user logged in.
- Auth loading state: render nothing (or a very small inline spinner in place of UI-sensitive spots) while `onAuthStateChanged` hasn't fired the first time. Do not flash "sign in required" on refresh.
- Error handling: surface friendly error strings (invalid email, wrong password, email in use, popup blocked, network) inline on the relevant auth form, do not throw to window.

FR3. **users/{uid} Firestore document created on signup**
- `users/{uid}` contains: `uid`, `email`, `displayName`, `createdAt`, `updatedAt`, plus application fields already present in the existing `User` type: `course?`, `semester?`, `subjects[]`, `examDate?`, `dailyStudyTime?`.
- Created exactly once (use set with merge via `onAuthStateChanged` listener pattern, or explicit Firestore write after signup; do not overwrite if doc exists).
- Never store password or hash.

FR4. **User isolation: all study data scoped to UID**
- Root collections/sub-collections match existing type graph; existing in-memory demos for materials/topics/roadmap/tests/progress become per-user.
- Proposed Firestore path scheme aligned to existing types in `src/types/index.ts`:
  - `users/{uid}`
  - `users/{uid}/materials/{materialId}` (Material)
  - `users/{uid}/topics/{topicId}` (Topic)
  - `users/{uid}/extractedQuestions/{questionId}` (ExtractedQuestion)
  - `users/{uid}/notesAnalysis/{notesId}` → single doc holding SubjectNotes structure
  - `users/{uid}/topicFrequency/{freqId}` → precomputed rows for chart
  - `users/{uid}/studyPlans/{studyPlanId}` → single active plan doc with days + tasks (StudyPlan)
  - `users/{uid}/chat/{messageId}` (ChatMessage)
  - `users/{uid}/tests/{testId}` + `users/{uid}/testResults/{resultId}`
  - `users/{uid}/progress/primary` → single Progress doc
  - `users/{uid}/activities/{activityId}`
  - `users/{uid}/analysisSteps/primary` → list step progress
- Write the UID on every document either in the path (preferred, via subcollections) or explicitly as a redundant `ownerUid` field; rules will check both paths.

FR5. **Context state replaced with Firestore listeners where UI features already exist**
- `AppContext.tsx`: keep the same exported interface (same action names, same `useApp()` hook), swap internal useState/demoData for `onAuthStateChanged` + per-collection `onSnapshot`.
- For new users with empty collections: leave state arrays/objects empty so existing components render their own empty-looking sections (we will inspect component-specific empty handling; components that would choke on `undefined` must receive empty `[]` / sensible defaults).
- Do NOT seed demo data automatically for real users. Keep the old demoData file around as a source of truth for structure only; never populate it into a real user's collections on login.

FR6. **Auth guard in AppShell / routing state machine**
- The `screen` state-machine stays: "landing | login | signup | forgot | onboarding | app".
- When Firebase user is non-null → force screen to "app" (or onboarding if the user doc lacks course/subjects/examDate); when null → default to "landing".
- During the first `onAuthStateChanged` tick, the shell renders nothing (auth loading) so no routing flash.

FR7. **Firestore security rules for strict per-user access**
- Rules file generated at `firestore.rules` in the repo root.
- Rule shape:
  - Allow read/write on `users/{uid}/**` if `request.auth.uid == uid`.
  - Allow a user to create/update their own `users/{uid}` doc but not another user's.
  - Top-level collections besides `users` are denied.
- Do not rely on `.read: if true` anywhere.

FR8. **Types: add optional `authLoading` and `authError` to context**
- Extend existing `AppState` interface with `authLoading: boolean` and `authError: string | null` only; do not rename existing fields.

## Non-Functional Requirements (NFR)
NFR1. UI Pristinity. No color, no spacing, no nav, no icon changes. Only add:
- inline error banners under auth form submit buttons (existing DOM flow, use `<p>` with text-danger-600, reuse existing `.card` class if wrapping needed)
- auth-loading fallback inside `AppShell.tsx` only (a centered 3-dot spinner, no new fonts/images)
NFR2. TypeScript strict: build must pass with `strict: true`; no `any` casts without comment explaining external interface.
NFR3. Single Firebase init; no duplication of `getApp()` error handling.
NFR4. Firestore listeners are unsubscribed on `AppProvider` unmount OR user change (avoid leaking subscriptions across sign-out → sign-in).
NFR5. Clean console: NO uncaught Firebase errors leaking to `console.error` without wrapping.

## Constraints & Dependencies
- Framework = Next.js 14.2.5 App Router; client-only SPA (single page at `src/app/page.tsx`, ssr:false dynamic import). Firebase must run client-side only; never require API keys server-side.
- Existing state management = React Context (`AppProvider` / `useApp`). DO NOT migrate to Redux/Zustand.
- Existing demo file `src/data/demoData.ts` may be kept as reference but must NOT be the initial state for logged-in real users.
- NO secrets in client code (all Firebase web config is *public* API key per Firebase docs; we use env vars per request to avoid hardcoding).

## Assumptions
A1. The user's Firebase project "AI Study Assistant" already has Email/Password and Google sign-in methods enabled in Firebase Console.
A2. The user has already added `localhost` (and production domains if any) to Firebase Console → Auth → Authorized Domains, so Google popups work.
A3. Firestore Database was created in the project (either Native mode).
A4. Environment vars will be provided by the user via `.env.local` manually after we tell them the list.

## Open Questions
(OQ1 resolved = assume No) Do we need `signInWithRedirect` for mobile Safari Google login where popups are problematic? → default to popup, keep redirect as stretch optional enhancement.
(OQ2) Do existing `NotesAnalysisPage` / `QuestionAnalysisPage` / `RoadmapPage` need fallback empty states beyond missing arrays? We will add minimal inline "Add materials first, then run AI Analysis" copy matching DEMO UI style only where required to avoid blank screens. Implementation detail in tasks.

## Acceptance Criteria (AC)

### Rules (objectively pass/fail)
- **R1**: `npm run build` exits 0 after all changes.
- **R2**: Running app shows exact same Landing → Login → Dashboard layout, colors, typography as pre-Firebase baseline (compare screenshots if needed; assert zero component renames, zero class wholesale changes to globals.css/tailwind.config.ts).
- **R3**: After email/password signup, new `users/{uid}` doc is visible in Firebase Console Firestore viewer with `uid`, `email`, `displayName`, `createdAt`, `updatedAt`.
- **R4**: After signup, refresh the tab → user stays logged in (auth persistence works).
- **R5**: Logging out (Sidebar Sign out) clears auth state and returns to landing.
- **R6**: Login with wrong password shows inline user-friendly error; `authError` set in context.
- **R7**: A freshly signed-up user with zero data sees empty/sensible pages, not a crash from `undefined[0]`. Every page in the 10-entry nav loads without throwing.
- **R8**: Two different accounts (UID1, UID2) created; write a material/doc to UID1 → UID2 login cannot read it via listener + cannot write to UID1 path (enforced by rules, verified by deploying rules and attempting in a new browser profile or incognito).
- **R9**: No VITE_ prefix on env vars; only NEXT_PUBLIC_FIREBASE_* used.
- **R10**: `AppShell` renders a loading UI (not the dashboard) during `authLoading` to prevent flash-of-logged-out content.
- **R11**: `GoogleButton` wired to real `signInWithPopup` (GoogleAuthProvider) and not the previous fake `login("", "")` path that created demoUser.
- **R12**: ForgotPasswordPage → submit with any registered email invokes `sendPasswordResetEmail`; success state shows (existing `sent` toggle works) with friendly success card.

### Rubrics (evaluative, scale 0-2, pass threshold = ≥1)
- **U1 / Adaptability**: Score 0-2 on whether the implementation preserves the existing AppContext hook signature so NO downstream page needs refactoring beyond passing a new prop for `authLoading`/`authError`. 2 = 100% compatible drop-in. 1 = minor edit in 1-2 page components. 0 = pages rewrote.
- **U2 / Isolation rigor**: 0-2 on whether all writes/read paths correctly namespace data per UID (subcollections under users/{uid}). 2 = perfect. 1 = 1-2 top-level stray reads with fallback listeners. 0 = not done.
- **U3 / Error handling**: 0-2 on user-facing auth error UX. 2 = every Firebase error mapped and inline-friendly. 1 = generic "Something went wrong" fallback. 0 = raw stack traces.
