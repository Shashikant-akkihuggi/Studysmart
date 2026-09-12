/**
 * Backblaze B2 S3-compatible client (SERVER-SIDE ONLY)
 * 
 * CRITICAL: Never import this file into client components or browser code.
 * B2 credentials must remain server-side only.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate server-side environment variables
if (typeof window !== "undefined") {
    throw new Error(
        "b2-server.ts must never be imported into browser/client code. B2 credentials are server-side only."
    );
}

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;

if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME || !B2_ENDPOINT || !B2_REGION) {
    throw new Error(
        "Missing Backblaze B2 environment variables. Required: B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME, B2_ENDPOINT, B2_REGION"
    );
}

/**
 * S3-compatible B2 client
 * Uses S3 API to communicate with Backblaze B2
 */
export const b2Client = new S3Client({
    endpoint: B2_ENDPOINT,
    region: B2_REGION,
    credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
    },
    // Force path-style addressing for B2 compatibility
    forcePathStyle: true,
});

/**
 * Supported file types for uploads
 */
export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
] as const;

/**
 * Supported file extensions
 */
export const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
] as const;

/**
 * Maximum file size (50 MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Validate file metadata
 */
export function validateFileUpload(params: {
    filename: string;
    mimeType: string;
    size: number;
}): { valid: boolean; error?: string } {
    const { filename, mimeType, size } = params;

    // Validate filename
    if (!filename || filename.length > 255) {
        return { valid: false, error: "Invalid filename" };
    }

    // Validate file extension
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext as any)) {
        return {
            valid: false,
            error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
        return {
            valid: false,
            error: `Unsupported MIME type: ${mimeType}`,
        };
    }

    // Validate file size
    if (size <= 0 || size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024} MB`,
        };
    }

    return { valid: true };
}

/**
 * Sanitize filename for safe B2 object key
 */
export function sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    const basename = filename.replace(/^.*[\\\/]/, "");

    // Replace unsafe characters with underscores
    return basename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Generate B2 object key with proper structure
 * Pattern: users/{uid}/subjects/{subjectId}/materials/{materialId}/{safeFilename}
 */
export function generateObjectKey(params: {
    uid: string;
    subjectId: string;
    materialId: string;
    filename: string;
}): string {
    const { uid, subjectId, materialId, filename } = params;
    const safeFilename = sanitizeFilename(filename);
    return `users/${uid}/subjects/${subjectId}/materials/${materialId}/${safeFilename}`;
}

/**
 * Generate presigned PUT URL for client upload
 * Returns a URL that allows direct browser upload to B2
 */
export async function generatePresignedUploadUrl(params: {
    objectKey: string;
    mimeType: string;
    expiresIn?: number;
}): Promise<string> {
    const { objectKey, mimeType, expiresIn = 3600 } = params; // 1 hour default

    const command = new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: objectKey,
        ContentType: mimeType,
    });

    const presignedUrl = await getSignedUrl(b2Client, command, {
        expiresIn,
    });

    return presignedUrl;
}

/**
 * Get B2 bucket name (for Firestore metadata)
 */
export function getB2BucketName(): string {
    return B2_BUCKET_NAME!;
}
