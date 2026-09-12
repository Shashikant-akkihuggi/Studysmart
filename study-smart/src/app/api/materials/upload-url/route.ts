/**
 * API Route: Generate presigned upload URL for Backblaze B2
 * POST /api/materials/upload-url
 * 
 * Authenticates user via Firebase ID token and returns a presigned URL
 * for direct browser upload to B2.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, extractBearerToken } from "@/lib/firebase-admin";
import {
    validateFileUpload,
    generateObjectKey,
    generatePresignedUploadUrl,
    getB2BucketName,
} from "@/lib/b2-server";
import { uid } from "@/lib/utils";

export const runtime = "nodejs"; // Ensure Node.js runtime for Firebase Admin

interface UploadUrlRequest {
    filename: string;
    mimeType: string;
    size: number;
    subjectId: string;
    category?: string;
}

interface UploadUrlResponse {
    uploadUrl: string;
    objectKey: string;
    materialId: string;
    b2Bucket: string;
}

interface ErrorResponse {
    error: string;
    code?: string;
}

/**
 * POST handler for upload URL generation
 */
export async function POST(request: NextRequest) {
    try {
        // Diagnostic: Check environment variables
        console.log("[DEBUG] Environment check:", {
            B2_KEY_ID_present: !!process.env.B2_KEY_ID,
            B2_APPLICATION_KEY_present: !!process.env.B2_APPLICATION_KEY,
            B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
            B2_ENDPOINT: process.env.B2_ENDPOINT,
            B2_REGION: process.env.B2_REGION,
            NODE_ENV: process.env.NODE_ENV,
        });

        // Extract and verify Firebase ID token
        const authHeader = request.headers.get("Authorization");
        const idToken = extractBearerToken(authHeader);

        if (!idToken) {
            return NextResponse.json<ErrorResponse>(
                { error: "Missing authentication token", code: "AUTH_MISSING" },
                { status: 401 }
            );
        }

        // Verify token and extract UID (NEVER trust client-provided UID)
        let uid: string;
        try {
            const decoded = await verifyIdToken(idToken);
            uid = decoded.uid;
            console.log("[DEBUG] Token verified, UID:", uid.substring(0, 8) + "...");
        } catch (error: any) {
            console.error("[DEBUG] Token verification failed:", error.message);
            return NextResponse.json<ErrorResponse>(
                { error: "Invalid authentication token", code: "AUTH_INVALID" },
                { status: 401 }
            );
        }

        // Parse request body
        let body: UploadUrlRequest;
        try {
            body = await request.json();
            console.log("[DEBUG] Request body parsed:", {
                filename: body.filename,
                mimeType: body.mimeType,
                size: body.size,
                subjectId: body.subjectId,
            });
        } catch (error) {
            console.error("[DEBUG] Body parse failed:", error);
            return NextResponse.json<ErrorResponse>(
                { error: "Invalid request body", code: "INVALID_BODY" },
                { status: 400 }
            );
        }

        const { filename, mimeType, size, subjectId } = body;

        // Validate required fields
        if (!filename || !mimeType || !size || !subjectId) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: "Missing required fields: filename, mimeType, size, subjectId",
                    code: "MISSING_FIELDS",
                },
                { status: 400 }
            );
        }

        // Validate file metadata
        console.log("[DEBUG] Validating file metadata...");
        const validation = validateFileUpload({ filename, mimeType, size });
        if (!validation.valid) {
            console.error("[DEBUG] File validation failed:", validation.error);
            return NextResponse.json<ErrorResponse>(
                { error: validation.error || "Invalid file", code: "INVALID_FILE" },
                { status: 400 }
            );
        }

        // Generate unique material ID (used in both Firestore and B2 object key)
        const materialId = uid();
        console.log("[DEBUG] Material ID generated:", materialId);

        // Generate B2 object key with authenticated UID
        const objectKey = generateObjectKey({
            uid, // UID from verified token, never from client
            subjectId,
            materialId,
            filename,
        });
        console.log("[DEBUG] Object key generated:", objectKey);

        // Generate presigned upload URL (1 hour expiration)
        console.log("[DEBUG] Generating presigned URL...");
        try {
            const uploadUrl = await generatePresignedUploadUrl({
                objectKey,
                mimeType,
                expiresIn: 3600, // 1 hour
            });
            console.log("[DEBUG] Presigned URL generated successfully");

            // Return upload URL and metadata
            const response: UploadUrlResponse = {
                uploadUrl,
                objectKey,
                materialId,
                b2Bucket: getB2BucketName(),
            };

            return NextResponse.json(response, { status: 200 });
        } catch (presignError: any) {
            console.error("[DEBUG] Presigned URL generation failed:", {
                error: presignError.message,
                code: presignError.code,
                name: presignError.name,
                stack: presignError.stack,
            });
            throw presignError;
        }
    } catch (error: any) {
        console.error("[ERROR] Upload URL generation error:", {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        });

        // Don't expose internal errors to client
        return NextResponse.json<ErrorResponse>(
            {
                error: "Failed to generate upload URL",
                code: "INTERNAL_ERROR",
            },
            { status: 500 }
        );
    }
}
