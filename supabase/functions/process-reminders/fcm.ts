interface FCMMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
}

export async function sendPushNotification(message: FCMMessage) {
  const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY');

  if (!FIREBASE_SERVER_KEY) {
    throw new Error('Firebase Server Key missing');
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: message.token,
      notification: message.notification,
      data: message.data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.code === 'messaging/invalid-registration-token') {
      throw new Error('Invalid registration token');
    }
    throw new Error(`FCM API error: ${JSON.stringify(error)}`);
  }

  return response;
}

export function generateReminderNotification(scheduledTime: string, durationMinutes: number) {
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
