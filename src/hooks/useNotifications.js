import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestNotificationPermission, setupNotificationListener } from '../services/notificationService';
import { setupMemoryResurfacing, suggestDailyEntry } from '../utils/memoryResurfacing';

export function useNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    requestNotificationPermission();

    // Setup notification listener
    const unsubscribe = setupNotificationListener((payload) => {
      console.log('Notification received:', payload);
    });

    // Setup memory resurfacing
    const resurfacingInterval = setupMemoryResurfacing(user.uid);

    // Suggest daily entry (once per day)
    suggestDailyEntry();

    return () => {
      if (unsubscribe) unsubscribe();
      if (resurfacingInterval) clearInterval(resurfacingInterval);
    };
  }, [user]);
}
