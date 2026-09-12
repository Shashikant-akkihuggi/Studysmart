/**
 * Firebase Admin SDK for server-side operations (SERVER-SIDE ONLY)
 * 
 * Used for verifying Firebase Auth ID tokens in API routes.
 * Never import this file into client components.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

// Ensure this runs server-side only
if (typeof window !== "undefined") {
    throw new Error(
        "firebase-admin.ts must never be imported into browser/client code."
    );
}

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

/**
 * Initialize Firebase Admin
 * Uses service account credentials from environment variables
 */
function initAdmin(): App {
    if (adminApp) {
        return adminApp;
    }

    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
        adminApp = existingApps[0];
        return adminApp;
    }

    // Firebase Admin requires service account credentials OR application default credentials
    // For Next.js, we'll use the Firebase project ID with application default credentials
    // The Firebase client SDK credentials can be reused for basic operations

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
        throw new Error(
            "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable"
        );
    }

    // Initialize with project ID only (works for Auth verification)
    // For production, you should use proper service account credentials
    adminApp = initializeApp({
        projectId,
    });

    return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 */
function getAdminAuth(): Auth {
    if (adminAuth) {
        return adminAuth;
    }

    const app = initAdmin();
    adminAuth = getAuth(app);
    return adminAuth;
}

/**
 * Verify Firebase ID token and return decoded token with UID
 * 
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(idToken: string): Promise<{
    uid: string;
    email?: string;
    emailVerified?: boolean;
}> {
    try {
        const auth = getAdminAuth();
        const decodedToken = await auth.verifyIdToken(idToken);

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
        };
    } catch (error: any) {
        console.error("Failed to verify ID token:", error.message);
        throw new Error("Invalid or expired authentication token");
    }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) {
        return null;
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
}
