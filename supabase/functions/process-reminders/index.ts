import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { sendEmail, generateReminderEmail } from './email.ts';
import { sendPushNotification, generateReminderNotification } from './fcm.ts';

export async function processReminders() {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get current time in UTC
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentDayOfWeek = now.getUTCDay();

    // Fetch active schedules for the current day
    const { data: schedules, error: schedulesError } = await supabaseClient
      .from('practice_schedules')
      .select('*')
      .eq('day_of_week', currentDayOfWeek)
      .eq('is_active', true);

    if (schedulesError) throw schedulesError;

    // Process each schedule
    for (const schedule of schedules || []) {
      try {
        // Get user's reminder preferences
        const { data: preferences, error: preferencesError } = await supabaseClient
          .from('reminder_preferences')
          .select('*')
          .eq('user_id', schedule.user_id)
          .single();

        if (preferencesError || !preferences?.reminder_enabled) continue;

        // Check quiet hours
        if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
          const quietStart = new Date(`1970-01-01T${preferences.quiet_hours_start}Z`);
          const quietEnd = new Date(`1970-01-01T${preferences.quiet_hours_end}Z`);
          const currentTime = new Date(`1970-01-01T${currentHour}:${currentMinute}:00Z`);

          if (currentTime >= quietStart && currentTime <= quietEnd) {
            continue; // Skip if within quiet hours
          }
        }

        // Calculate if it's time to send reminder
        const scheduleTime = new Date(`1970-01-01T${schedule.start_time}Z`);
        const reminderTime = new Date(scheduleTime.getTime() - (preferences.reminder_before_minutes * 60 * 1000));
        const currentTime = new Date(`1970-01-01T${currentHour}:${currentMinute}:00Z`);

        if (Math.abs(currentTime.getTime() - reminderTime.getTime()) <= 60000) { // Within 1 minute
          // Check if reminder was already sent
          const { data: existingReminder } = await supabaseClient
            .from('reminder_history')
            .select('*')
            .eq('schedule_id', schedule.id)
            .eq('type', 'scheduled')
            .gte('sent_at', new Date(now.getTime() - 5 * 60000).toISOString()) // Within last 5 minutes
            .single();

          if (existingReminder) continue;

          // Get user's profile for email
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('email')
            .eq('user_id', schedule.user_id)
            .single();

          // Format time for display
          const formattedTime = scheduleTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          });

          // Send notifications based on preference
          const notificationPromises = [];

          if (preferences.notification_method === 'email' || preferences.notification_method === 'both') {
            const emailContent = generateReminderEmail(formattedTime, schedule.duration_minutes);
            if (profile?.email) {
              notificationPromises.push(
                sendEmail({
                  to: profile.email,
                  ...emailContent
                }).catch(error => console.error('Email notification failed:', error))
              );
            }
          }

          if (preferences.notification_method === 'push' || preferences.notification_method === 'both') {
            const { data: fcmTokens } = await supabaseClient
              .from('fcm_tokens')
              .select('token')
              .eq('user_id', schedule.user_id);

            const notification = generateReminderNotification(formattedTime, schedule.duration_minutes);

            for (const { token } of fcmTokens || []) {
              notificationPromises.push(
                sendPushNotification({
                  token,
                  ...notification
                }).catch(error => {
                  console.error('Push notification failed:', error);
                  // If token is invalid, remove it
                  if (error.message.includes('Invalid registration token')) {
                    return supabaseClient
                      .from('fcm_tokens')
                      .delete()
                      .eq('token', token);
                  }
                })
              );
            }
          }

          // Wait for all notifications to be sent
          await Promise.allSettled(notificationPromises);

          // Record reminder in history
          await supabaseClient
            .from('reminder_history')
            .insert({
              user_id: schedule.user_id,
              schedule_id: schedule.id,
              type: 'scheduled',
              delivery_status: 'sent'
            });
        }
      } catch (error) {
        console.error('Error processing schedule:', error);
        continue; // Continue with next schedule even if one fails
      }
    }

    return { message: 'Reminders processed successfully' };
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const result = await processReminders();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
