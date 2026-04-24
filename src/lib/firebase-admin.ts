import admin from 'firebase-admin';

let admin_app: admin.app.App | null = null;

export function getAdmin() {
  if (!admin_app) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountVar) {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. FCM will not work.');
      // Return a mock or throw if strictness preferred
      throw new Error('FIREBASE_SERVICE_ACCOUNT missing');
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin_app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Admin:', e);
      throw e;
    }
  }
  return admin_app;
}

export { admin };
export default { getAdmin, admin };
