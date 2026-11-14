import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : undefined;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  // If service account credentials exist in env, use cert
  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Fallback for GCP managed environments / emulators or project ID inference
  return initializeApp({
    projectId: projectId || "lost-it-found-it-se6la",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let _app: App | null = null;
function app(): App {
  if (!_app) _app = getAdminApp();
  return _app;
}

let _db: Firestore | null = null;
function db(): Firestore {
  if (!_db) _db = getFirestore(app());
  return _db;
}

let _storage: Storage | null = null;
function storage(): Storage {
  if (!_storage) _storage = getStorage(app());
  return _storage;
}

let _auth: Auth | null = null;
function auth(): Auth {
  if (!_auth) {
    // Dynamic import to prevent eager jwks-rsa/jose loading
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase-admin/auth");
    _auth = getAuth(app());
  }
  return _auth!;
}

export const adminApp = new Proxy({} as App, {
  get: (_, prop) => (app() as unknown as Record<string | symbol, unknown>)[prop],
});

export const adminDb = new Proxy({} as Firestore, {
  get: (_, prop) => (db() as unknown as Record<string | symbol, unknown>)[prop],
});

export const adminStorage = new Proxy({} as Storage, {
  get: (_, prop) => (storage() as unknown as Record<string | symbol, unknown>)[prop],
});

export const adminAuth = new Proxy({} as Auth, {
  get: (_, prop) => (auth() as unknown as Record<string | symbol, unknown>)[prop],
});

export { getAdminApp };
export default adminApp;
