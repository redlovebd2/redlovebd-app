import { isConfigured } from '../firebase-config.js';
// Firebase is loaded lazily so demo mode stays small and never touches the network.
export const loadBackend = async () => isConfigured
  ? (await import('./firebase.js')).backend
  : (await import('./local.js')).backend;
