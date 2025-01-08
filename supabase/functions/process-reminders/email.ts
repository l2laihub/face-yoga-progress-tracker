interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(data: EmailData) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL');

  if (!RESEND_API_KEY || !SENDER_EMAIL) {
    throw new Error('Resend configuration missing');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: SENDER_EMAIL,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return response;
}

export function generateReminderEmail(scheduledTime: string, durationMinutes: number) {
  const subject = 'Your Face Yoga Practice Reminder';
  
  const text = `
    Your face yoga practice session is coming up!
    
    Time: ${scheduledTime}
    Duration: ${durationMinutes} minutes
    
    Remember to:
    - Find a quiet, comfortable space
    - Have a mirror ready if needed
    - Keep water nearby
    - Take deep breaths and stay relaxed
    
    See you in practice!
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2b6cb0;">Your Face Yoga Practice Reminder</h2>
      
      <p style="font-size: 16px;">Your face yoga practice session is coming up!</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">
          <strong>Time:</strong> ${scheduledTime}<br>
          <strong>Duration:</strong> ${durationMinutes} minutes
        </p>
      </div>
      
      <h3 style="color: #4a5568;">Remember to:</h3>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 8px;">✨ Find a quiet, comfortable space</li>
        <li style="margin-bottom: 8px;">🪞 Have a mirror ready if needed</li>
        <li style="margin-bottom: 8px;">💧 Keep water nearby</li>
        <li style="margin-bottom: 8px;">🧘‍♀️ Take deep breaths and stay relaxed</li>
      </ul>
      
      <p style="font-size: 18px; color: #2b6cb0; margin-top: 30px;">See you in practice!</p>
    </body>
    </html>
  `.trim();

  return { subject, text, html };
}
