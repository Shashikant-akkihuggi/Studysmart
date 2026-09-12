# Debug Session: login-blocked-after-valid-creds

Status: **[OPEN]** (Phase 3 / 11 — Instrumentation being applied)
Session ID: `login-blocked-after-valid-creds`
Date: 2026-09-12
Framework: Next.js 14 (App Router) + React 18 + Firebase SDK v9 modular

## Symptom
After entering valid email/password on the Login page:
- Expected: Transition to dashboard / app screen (nav = "dashboard").
- Actual: User cannot reach the dashboard — either lands back on landing page or gets stuck on a spinner.

Reported working controls:
- ✅ Firebase Auth Email/Password sign-up works.
- ✅ New users appear in Firebase Authentication.
- ✅ Firestore `users/{uid}` document is created on sign-up.
- ✅ Dev server runs cleanly.

Suspected race: dual auth-state writers (synchronous `login()` function at
[AppContext.tsx L239-L265](file:///d:/sfsaf/ai/study-smart/src/context/AppContext.tsx#L239-L265)
vs async observer
[L506-L549](file:///d:/sfsaf/ai/study-smart/src/context/AppContext.tsx#L506-L549))

## 5 Falsifiable Hypotheses
| # | Name | Predicted failing call site |
|---|------|-----------------------------|
| H1 | Observer catch-clause reverts screen | observer `fetchUserData` throws → catch `setScreen("landing")` |
| H2 | `authLoading` stuck true forever  | observer finally bypassed, `authLoading` never set false |
| H3 | Effect `[screen]` dep tears observer mid-flight | new observer is re-created while old one awaits fetchUserData |
| H4 | Firestore rules default / mis-deployed | `getDoc(users/{uid})` during observer read is rejected (read-after-write) |
| H5 | `screen` closure captured stale value | `if (screen === "login"|"signup"|"landing")` guard fails, no redirect |

## Instrumentation Plan
1. Debug server at `http://localhost:TRAE_DBGP` (automatic port)
2. Add `#region debug-point <id>` network-report call with `sessionId` right after each step of the login flow:
   1. `dp-login-start`
   2. `dp-login-signin-ok` (post-signInWithEmailAndPassword success, UID only, no secret)
   3. `dp-login-fetchuser-start`
   4. `dp-login-fetchuser-ok`
   5. `dp-login-fetchuser-err`
   6. `dp-observer-fired`
   7. `dp-observer-fetchuser-start`
   8. `dp-observer-fetchuser-ok`
   9. `dp-observer-fetchuser-err`
   10. `dp-screen-set` (every setScreen call — record screen val, caller, current user UID)
   11. `dp-authloading-set` (record new value, caller)
   12. `dp-userstate-set` (userUID or null, caller)
3. Also wrap `fetchUserData` / `mapFirestoreUser` with try/catch dp events to isolate doc parsing exceptions (e.g., Timestamps → toDate()) that only manifest on login doc (not signup written fresh doc).
4. Have user reproduce. Collect NDJSON log, correlate timestamps → reject/confirm each hypothesis.

## Evidence Log (POST-FIX phase: fill with pre-vs-post comparison)
### Pre-fix (reproduction)
TBD.
### Post-fix (after minimal patch)
TBD.
## Root Cause (TBD after evidence)
## Minimal Fix (TBD after evidence)
Files changed:
- TBD
## Post-Fix Verification Checklist
- [ ] Email/password signup
- [ ] Email/password login
- [ ] Page refresh preserves login
- [ ] Logout
- [ ] Google login (if available)
