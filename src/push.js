import { PUSH_URL } from './push-config.js';

export const pushEnabled = () => !!PUSH_URL && !!window.Capacitor?.isNativePlatform?.();

/* Ask permission, get the phone's FCM token and hand it to the backend. Never throws. */
export async function startPush(B, onTap) {
  if (!pushEnabled()) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    let p = await PushNotifications.checkPermissions();
    if (p.receive === 'prompt' || p.receive === 'prompt-with-rationale') p = await PushNotifications.requestPermissions();
    if (p.receive !== 'granted') return;
    await PushNotifications.removeAllListeners();
    PushNotifications.addListener('registration', (t) => { B.saveDeviceToken(t.value).catch(() => {}); });
    PushNotifications.addListener('registrationError', (e) => console.warn('push reg', e));
    PushNotifications.addListener('pushNotificationActionPerformed', () => { try { onTap && onTap(); } catch {} });
    await PushNotifications.register();
  } catch (e) { console.warn('push', e); }
}
