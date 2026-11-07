// Firebase web-app config (public identifiers; data is protected by firestore.rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyBGxQMN5rljGDsHiGHdfj2SUQoWCEc1uGg',
  authDomain: 'redlovebd-123.firebaseapp.com',
  projectId: 'redlovebd-123',
  storageBucket: 'redlovebd-123.firebasestorage.app',
  messagingSenderId: '760619137892',
  appId: '1:760619137892:web:1d19ca50939eeb51461871'
};
// While apiKey starts with "YOUR_" the app runs in DEMO MODE (local only).
export const isConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');
