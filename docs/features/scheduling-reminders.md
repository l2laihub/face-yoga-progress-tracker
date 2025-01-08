# Scheduling and Reminders

## Overview
The Scheduling and Reminders feature enables users to maintain a consistent face yoga practice routine by scheduling sessions and receiving timely reminders. This system helps users stay accountable and track their practice consistency.

## Key Features
- **Flexible Schedule Management**: Create and manage weekly practice schedules
- **Smart Reminders**: Customizable notifications before scheduled sessions
- **Quiet Hours**: Prevent notifications during specified time periods
- **Multiple Notification Methods**: Support for email and browser push notifications
- **Practice Tracking**: Integration with progress tracking and goal systems

## User Guide

### Setting Up a Schedule
1. Navigate to the Schedule page
2. Click "Add New Schedule"
3. Select:
   - Day(s) of the week
   - Start time
   - Duration
4. Save your schedule

### Configuring Reminders
1. Go to Reminder Settings
2. Choose your preferences:
   - Enable/disable reminders
   - Set reminder timing (e.g., 15 minutes before)
   - Select notification method (email/push)
   - Configure quiet hours

### Managing Schedules
- View all schedules in the Weekly Schedule Grid
- Edit or delete schedules as needed
- Toggle schedule activation status
- View upcoming sessions on the Dashboard

## Technical Implementation

### Database Schema

#### Practice Schedules
```sql
CREATE TABLE practice_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Reminder Preferences
```sql
CREATE TABLE reminder_preferences (
    user_id UUID REFERENCES auth.users PRIMARY KEY,
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_before_minutes INTEGER DEFAULT 15,
    notification_method TEXT DEFAULT 'email',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Reminder History
```sql
CREATE TABLE reminder_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    schedule_id UUID REFERENCES practice_schedules,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL, -- 'scheduled', 'missed_practice', 'streak_at_risk'
    delivery_status TEXT NOT NULL -- 'sent', 'failed', 'clicked'
);
```

### Component Architecture

#### Core Components
- `ScheduleManager.tsx`: Main scheduling interface
- `WeeklyScheduleGrid.tsx`: Visual schedule display
- `ScheduleForm.tsx`: Schedule creation/editing
- `TimeSlotPicker.tsx`: Time selection interface
- `ReminderSettings.tsx`: Reminder preference management
- `NotificationMethodSelector.tsx`: Notification method selection
- `QuietHoursSelector.tsx`: Quiet hours configuration

### State Management

The feature uses Zustand for state management:

```typescript
interface ScheduleStore {
  schedules: PracticeSchedule[];
  preferences: ReminderPreferences;
  upcomingSession: Session | null;
  
  // Actions
  addSchedule: (schedule: PracticeSchedule) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<PracticeSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<ReminderPreferences>) => Promise<void>;
}
```

### Notification System

#### Notification Methods
1. **Email Notifications**
   - HTML email templates
   - Scheduled delivery system
   - Click tracking

2. **Browser Push Notifications**
   - Service Worker integration
   - Real-time delivery
   - Offline support

#### Reminder Processing
- Schedule scanning service
- Notification queue system
- Delivery status tracking
- Quiet hours enforcement

## Integration Points

### Progress Tracking
- Scheduled sessions link to progress records
- Practice completion tracking
- Streak maintenance

### Goals System
- Schedule alignment with user goals
- Progress impact tracking
- Achievement integration

### Analytics Integration
- Schedule adherence metrics
- Reminder effectiveness tracking
- Practice time patterns
- Engagement impact analysis

## Configuration Options

### Schedule Settings
- Minimum session duration: 5 minutes
- Maximum sessions per day: 4
- Schedule granularity: 15 minutes

### Reminder Settings
- Minimum reminder time: 5 minutes before
- Maximum reminder time: 24 hours before
- Default reminder time: 15 minutes before
- Maximum quiet hours duration: 12 hours

## Analytics & Monitoring

### Key Metrics
1. **User Engagement**
   - Daily active users
   - Session completion rate
   - Streak maintenance rate

2. **Technical Performance**
   - Notification delivery success rate
   - Schedule processing latency
   - UI response time

3. **User Satisfaction**
   - Reminder click-through rate
   - Schedule adherence improvement
   - Feature usage retention

### Monitoring Points
- Notification delivery status
- Schedule processing performance
- Error rates and patterns
- User interaction patterns

## Troubleshooting

### Common Issues
1. **Missing Notifications**
   - Check quiet hours settings
   - Verify notification permissions
   - Check notification method settings

2. **Schedule Conflicts**
   - Review overlapping schedules
   - Check timezone settings
   - Verify schedule activation status

3. **Performance Issues**
   - Clear browser cache
   - Update notification preferences
   - Check internet connectivity

## Security Considerations

### Data Protection
- Encrypted schedule storage
- Secure notification delivery
- Privacy-focused analytics

### Access Control
- User-specific schedule isolation
- Authenticated API endpoints
- Rate-limited operations

## Future Enhancements

### Planned Features
1. Calendar integration (Google Calendar, iCal)
2. Social sharing of schedules
3. AI-powered schedule optimization
4. Advanced analytics dashboard
5. Mobile app notifications

### Development Status & Roadmap

#### Completed (Phase 1 & Partial Phase 2)
1. **Core Infrastructure**
   - Database schema implementation
   - Basic API endpoints
   - State management with Zustand
   - CRUD operations for schedules

2. **Basic UI Components**
   - Schedule management interface
   - Schedule creation/editing
   - Reminder preferences
   - Schedule widget

#### In Progress (Phase 2)
1. **Notification System**
   - Email notification implementation
   - Browser push notifications setup
   - Notification templates

#### Upcoming
1. **Phase 3: Integration Expansions** (Next)
   - Goals system integration
   - Progress tracking connection
   - Practice history linking

2. **Phase 4: Analytics & Optimization**
   - Usage analytics implementation
   - Performance monitoring
   - Schedule optimization features

3. **Phase 5: Platform Expansion**
   - Mobile app notifications
   - Calendar integrations (Google Calendar, iCal)
   - Social features
