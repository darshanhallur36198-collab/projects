import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (!messaging || !user) return;

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      toast(payload.notification?.body || 'New operational update received', {
        icon: '🔔',
        duration: 5000,
      });
    });

    return () => unsubscribe();
  }, [user]);

  const requestPermission = async () => {
    if (!messaging) return;

    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      
      if (status === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FCM_VAPID_KEY
        });
        
        if (token && user) {
          // Save token to Firestore
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          });
          console.log('FCM Token registered:', token);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return { permission, requestPermission };
}
