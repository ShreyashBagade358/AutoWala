import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let auth: Auth;
let db: Firestore;

export const initFirebase = () => {
  if (app) return { app, auth, db };
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase credentials not configured, using mock mode');
    return { app: null, auth: null, db: null };
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  auth = getAuth(app);
  db = getFirestore(app);

  return { app, auth, db };
};

export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
