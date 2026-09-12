/**
 * Client-side file upload utilities for Backblaze B2
 */

import { auth } from "./firebase";
import type { MaterialCategory } from "@/types";

export interface UploadFileParams {
    file: File;
    category: MaterialCategory;
    subjectId: string;
    onProgress?: (progress: number) => void;
}

export interface UploadResult {
    success: boolean;
    materialId: string;
    objectKey: string;
    b2Bucket: string;
    error?: string;
    errorCode?: string;
}

/**
 * Upload a file to Backblaze B2 via presigned URL
 */
export async function uploadFile(params: UploadFileParams): Promise<UploadResult> {
    const { file, category, subjectId, onProgress } = params;

    try {
        // Get current user's ID token
        const user = auth.currentUser;
        if (!user) {
            return {
                success: false,
                materialId: "",
                objectKey: "",
                b2Bucket: "",
                error: "Not authenticated. Please sign in.",
                errorCode: "NOT_AUTHENTICATED",
            };
        }

        const idToken = await user.getIdToken();

        // Request presigned upload URL from API
        const uploadUrlResponse = await fetch("/api/materials/upload-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                subjectId,
                category,
            }),
        });

        if (!uploadUrlResponse.ok) {
            const errorData = await uploadUrlResponse.json().catch(() => ({}));
            return {
                success: false,
                materialId: "",
                objectKey: "",
                b2Bucket: "",
                error: errorData.error || "Failed to get upload URL",
                errorCode: errorData.code || "UPLOAD_URL_FAILED",
            };
        }

        const { uploadUrl, objectKey, materialId, b2Bucket } = await uploadUrlResponse.json();

        // Upload file directly to B2 using presigned URL
        const uploadResponse = await new Promise<{
            success: boolean;
            error?: string;
        }>((resolve) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    onProgress(progress);
                }
            });

            // Handle completion
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({ success: true });
                } else {
                    resolve({
                        success: false,
                        error: `Upload failed with status ${xhr.status}`,
                    });
                }
            });

            // Handle errors
            xhr.addEventListener("error", () => {
                resolve({
                    success: false,
                    error: "Network error during upload",
                });
            });

            xhr.addEventListener("abort", () => {
                resolve({
                    success: false,
                    error: "Upload cancelled",
                });
            });

            // Send PUT request to presigned URL
            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        });

        if (!uploadResponse.success) {
            return {
                success: false,
                materialId,
                objectKey,
                b2Bucket,
                error: uploadResponse.error || "Upload failed",
                errorCode: "B2_UPLOAD_FAILED",
            };
        }

        // Success!
        return {
            success: true,
            materialId,
            objectKey,
            b2Bucket,
        };
    } catch (error: any) {
        console.error("Upload error:", error);
        return {
            success: false,
            materialId: "",
            objectKey: "",
            b2Bucket: "",
            error: error.message || "Unexpected error during upload",
            errorCode: "UNEXPECTED_ERROR",
        };
    }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    const ALLOWED_TYPES = [
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
    ];

    if (!file) {
        return { valid: false, error: "No file selected" };
    }

    if (file.size === 0) {
        return { valid: false, error: "File is empty" };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB`,
        };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "Unsupported file type. Allowed: PDF, DOCX, PPTX, TXT, PNG, JPG",
        };
    }

    return { valid: true };
}
