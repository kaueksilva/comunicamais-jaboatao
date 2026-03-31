import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

export function initFirebase() {
  if (!admin.apps.length) {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        // Preferred for local/dev without JSON file: keep credentials in env vars.
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else if (serviceAccountPath) {
        const resolvedPath = path.resolve(serviceAccountPath);

        if (!fs.existsSync(resolvedPath)) {
          throw new Error(`Arquivo não encontrado: ${resolvedPath}`);
        }

        const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Fallback for environments with ADC configured (Cloud Run, GCE, or gcloud auth application-default login).
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
      }

      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      console.error(
        'Defina FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY no .env,\n' +
        'ou use FIREBASE_SERVICE_ACCOUNT_PATH,\n' +
        'ou configure ADC com "gcloud auth application-default login".'
      );
      process.exit(1); // Encerra se não conseguir autenticar
    }
  }
}

// Lazy getters — only evaluated after initFirebase() is called
export const getFirestore = () => admin.firestore();
export const getAuth = () => admin.auth();
