import { messaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && messaging) {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
}

export function setupNotificationListener(callback) {
  if (!messaging) return;
  
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

export function showLocalNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png' });
  }
}
