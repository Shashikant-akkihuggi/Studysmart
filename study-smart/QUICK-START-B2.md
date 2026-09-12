# Quick Start: Backblaze B2 Integration

## ⚡ 3-Step Setup

### Step 1: Add B2 Credentials

Edit `.env.local` and add your Backblaze B2 credentials:

```env
B2_KEY_ID=your_actual_key_id_here
B2_APPLICATION_KEY=your_actual_application_key_here
B2_BUCKET_NAME=ai-study-assistant-files
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
```

⚠️ **Important:** Do NOT commit `.env.local` to git. It contains secrets.

### Step 2: Restart Server

```bash
npm run dev
```

The server must be restarted to load the new environment variables.

### Step 3: Test Upload

1. Open http://localhost:3000
2. Sign in (email/password or Google)
3. Navigate to **Materials** page
4. Drag and drop a PDF file (or click to browse)
5. Watch the upload progress
6. File should show "Uploaded" status

## ✅ Verify Success

### In Browser
- Material appears in the list
- Status shows "Uploaded" (green checkmark)
- No error messages

### In Firestore Console
1. Go to Firebase Console → Firestore
2. Open `materials` collection
3. Find your document
4. Check:
   - ✅ `uid` = your Firebase UID
   - ✅ `b2Bucket` = "ai-study-assistant-files"
   - ✅ `b2ObjectKey` = Full path with your UID
   - ✅ `status` = "uploaded"

### In Backblaze B2 Console
1. Go to Backblaze B2 Console
2. Open `ai-study-assistant-files` bucket
3. Browse to: `users/{your-uid}/subjects/.../materials/.../filename.pdf`
4. File should exist

## 🚨 Troubleshooting

### "Missing Backblaze B2 environment variables"
- ❌ B2 credentials not in `.env.local`
- ✅ Add B2_KEY_ID and B2_APPLICATION_KEY
- ✅ Restart server: `npm run dev`

### "Invalid or expired authentication token"
- ❌ Not signed in
- ✅ Sign in to the app first

### "Unsupported file type"
- ❌ File type not allowed
- ✅ Use: PDF, DOCX, PPTX, TXT, PNG, JPG

### "File too large"
- ❌ File exceeds 50 MB
- ✅ Compress or split the file

### Upload succeeds but file not in B2
- ❌ Wrong B2 credentials
- ✅ Verify B2_KEY_ID and B2_APPLICATION_KEY
- ✅ Check key has Read/Write permissions on bucket

## 📁 Supported File Types

| Type | Extensions | Max Size |
|------|-----------|----------|
| PDF | `.pdf` | 50 MB |
| Word | `.doc`, `.docx` | 50 MB |
| PowerPoint | `.ppt`, `.pptx` | 50 MB |
| Text | `.txt` | 50 MB |
| Images | `.png`, `.jpg`, `.jpeg`, `.webp` | 50 MB |

## 🔒 Security Notes

- ✅ B2 credentials are **server-side only**
- ✅ Never exposed to browser
- ✅ Presigned URLs expire in 1 hour
- ✅ Firestore rules enforce UID ownership
- ✅ Private B2 bucket (no public access)

## 📚 Full Documentation

See `B2-INTEGRATION-COMPLETE.md` for complete technical details.

---

**Status:** Ready for testing after adding credentials to `.env.local`
