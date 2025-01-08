import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Failed to get notification permission:', error);
    return null;
  }
}

// Handle incoming messages when app is in foreground
export function onMessageListener(callback: (payload: MessagePayload) => void) {
  return onMessage(messaging, callback);
}

// Function to format reminder message
export function formatReminderMessage(scheduledTime: string, durationMinutes: number) {
  return {
    notification: {
      title: 'Face Yoga Practice Reminder',
      body: `Your ${durationMinutes}-minute practice session starts at ${scheduledTime}`,
    },
    data: {
      type: 'practice_reminder',
      scheduledTime,
      durationMinutes: durationMinutes.toString(),
    },
  };
}
