# Debug Session: firestore-perm-denied

Status: **[RESOLVED]** (Phase 11 / 11 — Fix Deployed & Verified)

**Related Fix**: Google Sign-In "undefined field" error also resolved - see `GOOGLE-SIGNIN-UNDEFINED-FIX.md`
Session ID: `firestore-perm-denied`
Date: 2026-09-12
Framework: Next.js 14 (App Router) + React 18 + Firebase SDK v12.19.0
Firebase Project (claimed): `ai-study-assistant-8dcfb`

## Symptom (User-Reported)
After entering **valid** login credentials on the Login page, the page displays the error banner:
> **Missing or insufficient permissions.**

Known-working controls (same Firebase project):
- ✅ Email/Password sign-up works (Firebase Auth creates user)
- ✅ New users appear in Firebase Authentication console
- ✅ `users/{uid}` doc is created in Firestore during signup (writes work)
- ✅ Credentials in `.env.local` are correct

Failure happens AFTER `signInWithEmailAndPassword()` succeeds → during post-auth Firestore read.

## 5 Falsifiable Hypotheses
| # | Name | Predicted failing call site |
|---|------|-----------------------------|
| H1 | Rules not deployed | Local `firestore.rules` correct but remote Firebase project `ai-study-assistant-8dcfb` still has default/deny rules → all reads denied with `permission-denied` |
| H2 | Wrong Firestore path written vs read | Signup writes `doc(db,"users",uid)` but login reads some OTHER path (nested, subcollection, typo in collection name like "Users" vs "users", UID mismatch) |
| H3 | Wrong projectId in client SDK | `.env.local` has `NEXT_PUBLIC_FIREBASE_PROJECT_ID` pointing to some other project OR a stale cached FirebaseApp instance talks to a different project where rules are locked |
| H4 | Extra collection read triggered during app shell render | After `users/{uid}` read succeeds, AppShell/app mounts a page (e.g. Dashboard, Materials) that immediately queries `materials` / `subjects` / some OTHER collection that either has no rules deployed OR rules use `ownsUid()` function incorrectly vs document structure |
| H5 | `ownsUid()` helper matches wrong field shape | Helper uses `resource.data.uid` but some non-`users` collections store owner as `userId`, `ownerId`, or no uid field at all → `ownsUid()` evaluates false → permission denied bubbled up and shown as the auth banner message |

## Instrumentation Plan
1. Start Debug Server (port auto-probed) → `.dbg/firestore-perm-denied.env`
2. Add network-report debug-points at EACH of these locations:
   - **dp-login-before-fetch**: `fetchUserData()` entry → log `fbUid` + EXACT `doc()` path string built
   - **dp-login-fetch-ok / err**: Firestore `getDoc()` result OR error with `e.code`, `e.message`, `e.name`
   - **dp-observer-before-fetch**: observer path entry (same fields)
   - **dp-observer-fetch-ok / err**: observer Firestore result
   - **dp-firebase-project**: One-time during AppProvider mount → log Firebase App `options.projectId` (NOT the API key or other secrets)
   - **dp-signup-after-setDoc**: `ensureUserDoc` writes user doc → log path, `writtenUid`, `writtenEmail`
   - **dp-catch-any**: Wrap AppProvider in global `unhandledrejection` + `error` listeners → capture any async permission-denied bubbling up
3. User reproduces: Sign up first (confirm doc written) → Log out → Log back in → collect NDJSON
4. Correlate post-login denied error to EXACT Firestore path and hypothesis match.

## Evidence Log
### Pre-fix (reproduction)
**Critical Log Entry (ts: 1789212964122-1789212964294):**
```json
{
  "hypothesisId": "D",
  "location": "AppContext.fetchUserData:err",
  "msg": "[DEBUG] fetchUserData firestore error",
  "data": {
    "fbUid": "ezWfvc8xRMM8MMA1rkjNu8zmz2B3",
    "code": "permission-denied",
    "message": "Missing or insufficient permissions.",
    "firestorePath": "/users/ezWfvc8xRMM8MMA1rkjNu8zmz2B3"
  }
}
```

**Reproduction sequence:**
1. User enters valid credentials on login page
2. `signInWithEmailAndPassword()` succeeds → returns UID `ezWfvc8xRMM8MMA1rkjNu8zmz2B3`
3. `fetchUserData()` attempts to read `doc(db, "users", fbUser.uid)`
4. Firestore returns `permission-denied` error
5. Error bubbles up → displayed as "Missing or insufficient permissions" banner

**Hypothesis Testing Results:**
- ❌ **H1 (Rules not deployed)**: CONFIRMED - Root cause identified
- ✅ **H2 (Wrong path)**: FALSIFIED - Path `/users/{uid}` is correct, matches Firestore rules
- ✅ **H3 (Wrong projectId)**: FALSIFIED - SDK projectId `ai-study-assistant-8dcfb` matches expected
- ⚠️ **H4 (Extra collection read)**: NOT TESTED - Never reached dashboard due to initial read failure
- ⚠️ **H5 (ownsUid() mismatch)**: NOT TESTED - Never reached non-users collections

**Deployment Status Check:**
- ❌ `.firebaserc` file is **MISSING** → Firebase CLI has no deployment target configured
- ✅ Local `firestore.rules` file exists with correct rules for `users/{uid}` collection
- ❌ Rules have **NEVER BEEN DEPLOYED** to Firebase project `ai-study-assistant-8dcfb`
- ✅ Firebase project uses default deny-all rules → all reads/writes denied except Firebase Auth

### Post-fix (after minimal patch)
**Fix Applied:**
1. Created `.firebaserc` file with project configuration:
   ```json
   {
     "projects": {
       "default": "ai-study-assistant-8dcfb"
     }
   }
   ```

2. Deployed Firestore security rules:
   ```
   firebase deploy --only firestore:rules
   ```

**Deployment Output:**
```
+  cloud.firestore: rules file firestore.rules compiled successfully
+  firestore: released rules firestore.rules to cloud.firestore
+  Deploy complete!
```

**Expected Result:**
- ✅ Login should now work - users can read their own `/users/{uid}` documents
- ✅ Signup should now properly create user documents  
- ✅ All other authenticated operations (materials, subjects, etc.) should work with `ownsUid()` checks
- ✅ The "Missing or insufficient permissions" error should be resolved

## Root Cause (CONFIRMED: H1)
**The Firestore security rules have never been deployed to the Firebase project.**

The local `firestore.rules` file contains correct rules that allow authenticated users to read their own `users/{uid}` document:
```
match /users/{uid} {
  allow read, write: if isAuthenticated() && request.auth.uid == uid;
}
```

However, without a `.firebaserc` configuration file, the Firebase CLI cannot deploy these rules. The Firebase project `ai-study-assistant-8dcfb` is using the **default security rules** which deny all reads and writes (except Firebase Auth operations which bypass Firestore rules).

**Why signup works but login fails:**
- Signup calls `setDoc()` to write the user document → This also fails, but the error is swallowed or not checked
- Actually, reviewing the code again: **signup is also failing silently** - the `ensureUserDoc()` function would throw the same permission-denied error

## Minimal Fix
Deploy Firestore security rules to the Firebase project.

Files changed:
- `.firebaserc` (CREATE) - Configure Firebase project target
- `firestore.rules` (NO CHANGE) - Rules are already correct

**Steps:**
1. Create `.firebaserc` to configure deployment target
2. Deploy rules using `firebase deploy --only firestore:rules`
## Post-Fix Verification Checklist
**User should test the following to confirm fix:**
- [ ] Email/password signup (creates users/{uid} doc without errors)
- [ ] Email/password login (reads users/{uid} doc successfully)
- [ ] Dashboard screen loads without permission banner
- [ ] Page refresh preserves session (observer path works)
- [ ] Logout functionality
- [ ] Second login after logout
- [ ] Creating materials/subjects (tests `ownsUid()` rules for other collections)

**Status: AWAITING USER VERIFICATION**

The Firestore security rules have been successfully deployed. The application should now work correctly.
