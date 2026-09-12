# Backblaze B2 Integration - Implementation Complete ✅

## Overview
Integrated Backblaze B2 as the application's real file storage using the S3-compatible API. Files are uploaded directly from the browser to the private B2 bucket via presigned URLs, with metadata stored in Firestore.

## Architecture

### Flow Diagram
```
User selects file
    ↓
Validate file (client)
    ↓
Create material metadata (Firestore - optimistic)
    ↓
Request presigned upload URL (API endpoint)
    ├─ Verify Firebase Auth ID token
    ├─ Extract UID from token
    ├─ Generate B2 object key with UID
    └─ Return presigned URL
    ↓
Upload file directly to B2 (client → B2, not through server)
    ↓
Update material status in Firestore (uploaded/failed)
```

### Security Model
1. **Client never sees B2 credentials** - All B2 operations use server-side client
2. **UID derived from verified Firebase token** - Never trust client-provided UID
3. **Presigned URLs** expire after 1 hour
4. **Private bucket** - No public access to files
5. **Firestore rules** enforce UID-based ownership

## Files Changed

### New Files Created

#### 1. `src/lib/b2-server.ts` (SERVER-SIDE ONLY)
- S3-compatible B2 client configuration
- File validation (type, size, extension)
- Object key generation with UID
- Presigned URL generation
- **NEVER import into client components**

#### 2. `src/lib/firebase-admin.ts` (SERVER-SIDE ONLY)
- Firebase Admin SDK initialization
- ID token verification
- Bearer token extraction
- **NEVER import into client components**

#### 3. `src/lib/upload.ts` (CLIENT-SIDE)
- Browser upload utility
- XHR-based upload with progress tracking
- File validation before upload
- Upload result handling

#### 4. `src/app/api/materials/upload-url/route.ts`
- Next.js API route for presigned URL generation
- Firebase Auth token verification
- B2 object key generation
- Presigned URL generation
- **Server-side only - Node.js runtime**

#### 5. `.env.example`
- Template for environment variables
- Documents which vars are public vs server-only

### Modified Files

#### 1. `src/types/index.ts`
**Changes:**
- Updated `MaterialStatus` type: `"uploading" | "uploaded" | "processing" | "ready" | "failed"`
- Updated `Material` type with new fields:
  ```typescript
  {
    id: string;
    uid: string;  // Firebase UID (owner)
    name: string;
    originalFilename: string;
    category: MaterialCategory;
    type: string;
    mimeType: string;
    size: number;
    subject?: string;
    subjectId: string;
    status: MaterialStatus;
    b2Bucket: string;
    b2ObjectKey: string;
    uploadDate: Date;
    createdAt: Date;
    updatedAt: Date;
    errorMessage?: string;
  }
  ```

#### 2. `src/context/AppContext.tsx`
**Changes:**
- Removed demo data initialization
- Added `updateMaterialStatus()` function
- Made `addMaterial()` async, returns `materialId`
- Made `removeMaterial()` async with Firestore delete
- Added Firestore real-time listener for materials
- Added `MaterialStatus` import
- Updated context interface

#### 3. `src/components/pages/MaterialsPage.tsx`
**Changes:**
- Replaced fake upload with real B2 upload flow
- Added error handling and display
- Added upload progress support (logs to console)
- Removed `DemoBadge`
- Updated file handling to use `uploadFile()` utility
- Added Firestore metadata writing after successful upload

#### 4. `src/components/ui/Badge.tsx`
**Changes:**
- Updated `StatusBadge` to handle new statuses:
  - `uploaded` → Green "✓ Uploaded"
  - `ready` → Green "✓ Ready"
  - `processing` → Blue spinning "Processing…"

#### 5. `firestore.rules`
**Changes:**
- Enhanced materials collection rules:
  ```
  match /materials/{materialId} {
    allow read: if isAuthenticated() && ownsUid();
    allow create: if isAuthenticated() 
                  && request.resource.data.uid == request.auth.uid
                  && request.resource.data.keys().hasAll([required_fields]);
    allow update: if isAuthenticated() 
                  && resource.data.uid == request.auth.uid
                  && request.resource.data.uid == request.auth.uid;
    allow delete: if isAuthenticated() && resource.data.uid == request.auth.uid;
  }
  ```

## Packages Installed

```json
{
  "@aws-sdk/client-s3": "latest",
  "@aws-sdk/s3-request-presigner": "latest",
  "firebase-admin": "latest"
}
```

**Installation commands:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install firebase-admin --legacy-peer-deps
```

## API Routes Created

### POST `/api/materials/upload-url`

**Purpose:** Generate presigned upload URL for authenticated user

**Request Headers:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "filename": "example.pdf",
  "mimeType": "application/pdf",
  "size": 1234567,
  "subjectId": "theory-of-computation",
  "category": "notes"
}
```

**Response (Success 200):**
```json
{
  "uploadUrl": "https://s3.us-east-005.backblazeb2.com/...",
  "objectKey": "users/{uid}/subjects/{subjectId}/materials/{materialId}/example.pdf",
  "materialId": "abc123...",
  "b2Bucket": "ai-study-assistant-files"
}
```

**Response (Error 401/400/500):**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `AUTH_MISSING` - No Authorization header
- `AUTH_INVALID` - Invalid/expired token
- `INVALID_BODY` - Malformed request body
- `MISSING_FIELDS` - Required fields missing
- `INVALID_FILE` - File validation failed
- `INTERNAL_ERROR` - Server error

## Environment Variables Required

### `.env.local` (User must add these)

```env
# Firebase (Already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAgqtXQJzqQZ_l2iKJjJHbcVgpZ8tEF8A4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-study-assistant-8dcfb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-study-assistant-8dcfb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-study-assistant-8dcfb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=9097092943
NEXT_PUBLIC_FIREBASE_APP_ID=1:9097092943:web:7fc9f4764aaecc7c22af3a

# Backblaze B2 (USER MUST ADD - SERVER-SIDE ONLY)
B2_KEY_ID=<your_b2_key_id>
B2_APPLICATION_KEY=<your_b2_application_key>
B2_BUCKET_NAME=ai-study-assistant-files
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
```

⚠️ **CRITICAL:** Never add B2 credentials to `NEXT_PUBLIC_*` variables. They are server-side only.

## Firestore Rule Changes

**Deployed:** ✅ Rules successfully deployed

**Materials Collection Rules:**
- ✅ Users can only read their own materials (`ownsUid()`)
- ✅ Create requires all mandatory fields
- ✅ Create enforces UID ownership
- ✅ Update preserves UID ownership
- ✅ Delete requires ownership

**Security Guarantees:**
- Users cannot access other users' material metadata
- Users cannot impersonate other UIDs
- Field-level validation enforced
- UID derived from verified Firebase token (server-side)

## B2 Integration Details

### Bucket Configuration
- **Name:** `ai-study-assistant-files`
- **Type:** Private (no public access)
- **Region:** us-east-005
- **Endpoint:** https://s3.us-east-005.backblazeb2.com
- **API:** S3-compatible

### Object Key Structure
```
users/{uid}/subjects/{subjectId}/materials/{materialId}/{safeFilename}
```

**Example:**
```
users/ezWfvc8xRMM8MMA1rkjNu8zmz2B3/subjects/theory-of-computation/materials/abc123def/TOC_Notes.pdf
```

**Benefits:**
- Easy to identify owner by UID
- Organized by subject
- Unique material ID prevents collisions
- Safe filename prevents path traversal

### File Validation

**Allowed Types:**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- PowerPoint (`.ppt`, `.pptx`)
- Text (`.txt`)
- Images (`.png`, `.jpg`, `.jpeg`, `.webp`)

**Limits:**
- **Max file size:** 50 MB
- **Min file size:** 1 byte
- **Filename length:** ≤ 255 characters

**Validation Locations:**
1. Client-side (before upload) - Fast feedback
2. Server-side (API endpoint) - Security enforcement

### Upload Process

1. **Client validates file**
   - Type, size, extension check
   - User feedback if invalid

2. **Client creates Firestore material doc**
   - Status: `uploading`
   - Optimistic UI update

3. **Client requests presigned URL**
   - Sends Firebase ID token
   - Server verifies token → extracts UID
   - Server generates B2 object key
   - Server returns presigned URL

4. **Client uploads directly to B2**
   - Uses XHR for progress tracking
   - Direct browser → B2 (no server proxy)
   - Presigned URL expires in 1 hour

5. **Client updates Firestore**
   - Write full metadata
   - Status: `uploaded` or `failed`
   - B2 object key stored

6. **Firestore real-time listener**
   - Updates UI automatically
   - Shows latest status

## Upload Test Results

### Manual Setup Required

**Before testing, user must:**

1. **Add B2 credentials to `.env.local`:**
   ```env
   B2_KEY_ID=<actual_key_id>
   B2_APPLICATION_KEY=<actual_application_key>
   B2_BUCKET_NAME=ai-study-assistant-files
   B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
   B2_REGION=us-east-005
   ```

2. **Restart Next.js dev server:**
   ```bash
   npm run dev
   ```

3. **Sign in to the application**

### Test Checklist

After adding credentials and restarting:

- [ ] **A. Email/Password Sign In**
  - Sign in with existing account
  - Navigate to Materials page

- [ ] **B. Google Sign In**
  - Sign in with Google account
  - Navigate to Materials page

- [ ] **C. Upload Small PDF**
  - Select a small PDF file (< 5 MB)
  - Choose category (e.g., "Notes")
  - Choose subject
  - Drag and drop or click to browse
  - **Expected:** File shows "Uploading…" → "Uploaded"

- [ ] **D. Verify in B2 Bucket**
  - Go to Backblaze B2 console
  - Open `ai-study-assistant-files` bucket
  - Navigate to `users/{your_uid}/subjects/.../materials/...`
  - **Expected:** File exists with correct path

- [ ] **E. Verify in Firestore**
  - Go to Firebase Console → Firestore
  - Open `materials` collection
  - Find your document
  - **Expected:** Document exists with:
    - ✅ Correct `uid` (your Firebase UID)
    - ✅ `b2Bucket`: "ai-study-assistant-files"
    - ✅ `b2ObjectKey`: Full path with your UID
    - ✅ `status`: "uploaded"

- [ ] **F. Verify UID Ownership**
  - Sign out
  - Sign in as **different** user
  - Navigate to Materials
  - **Expected:** Only see own materials (not other user's)

- [ ] **G. Verify B2 Object Path**
  - Check B2 object key contains correct UID
  - **Expected:** Path starts with `users/{your_actual_uid}/...`

- [ ] **H. Page Refresh**
  - Refresh the Materials page
  - **Expected:** Uploaded materials still appear

- [ ] **I. Delete Material**
  - Click delete button on a material
  - **Expected:** Material removed from Firestore
  - **Note:** B2 file NOT deleted (cleanup TBD)

- [ ] **J. Upload Invalid File**
  - Try uploading `.exe` or file > 50 MB
  - **Expected:** Error message displayed

## Known Limitations & Future Work

### Current Limitations

1. **B2 file deletion not implemented**
   - Deleting material from Firestore doesn't delete B2 file
   - B2 files accumulate (orphaned files)
   - **Future:** Implement B2 deletion API or lifecycle policy

2. **No AI processing yet**
   - Status remains "uploaded" (not "processing" → "ready")
   - AI extraction/OCR not implemented
   - **Future:** Separate milestone for AI integration

3. **No download functionality**
   - Cannot download uploaded files from UI
   - **Future:** Generate presigned GET URLs for download

4. **No file preview**
   - Cannot preview PDFs/images in browser
   - **Future:** Thumbnail generation, PDF viewer

5. **Sequential upload only**
   - Files uploaded one at a time
   - **Future:** Parallel uploads with queue

6. **Fixed subject list**
   - Subject dropdown is hardcoded
   - **Future:** Dynamic subjects from user's subjects array

### Security Considerations

✅ **Implemented:**
- Server-side token verification
- UID derived from verified token (never client-provided)
- Private B2 bucket
- Firestore rules enforce ownership
- Presigned URL expiration
- File type and size validation

⚠️ **To Consider:**
- Rate limiting on upload API endpoint
- Virus scanning for uploaded files
- Content policy enforcement
- Backup/disaster recovery for B2 data

## Troubleshooting

### Error: "Missing Backblaze B2 environment variables"
**Cause:** B2 credentials not in `.env.local`
**Fix:** Add B2_KEY_ID and B2_APPLICATION_KEY to `.env.local`, restart server

### Error: "Invalid or expired authentication token"
**Cause:** Not signed in or session expired
**Fix:** Sign in again

### Error: "Unsupported file type"
**Cause:** File type not in allowed list
**Fix:** Use PDF, DOCX, PPTX, TXT, PNG, JPG, or WEBP

### Error: "File too large"
**Cause:** File exceeds 50 MB limit
**Fix:** Compress file or split into smaller files

### Error: "Upload failed with status 403"
**Cause:** B2 credentials invalid or bucket permissions insufficient
**Fix:** Verify B2 key has Read/Write permissions on bucket

### Materials not appearing after upload
**Cause:** Firestore listener not subscribed
**Fix:** Check browser console for Firestore errors, verify rules deployed

### Can see other users' materials
**Cause:** Firestore rules not deployed correctly
**Fix:** Run `firebase deploy --only firestore:rules`

## Next Steps

1. **User adds B2 credentials to `.env.local`**
2. **User restarts dev server:** `npm run dev`
3. **User tests upload flow** (follow test checklist above)
4. **User verifies B2 + Firestore integration**

After successful testing:
- AI document processing (PDF extraction, OCR)
- File download with presigned GET URLs
- File preview/thumbnail generation
- B2 file deletion on material delete
- Upload queue with parallel uploads

---

**Implementation Status:** ✅ **COMPLETE**

**Files Ready for Testing:** All files created and configured

**User Action Required:**
1. Add B2_KEY_ID and B2_APPLICATION_KEY to `.env.local`
2. Restart development server
3. Test upload flow

**Report any issues with detailed error messages and browser console logs.**
