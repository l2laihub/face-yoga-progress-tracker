import React from 'react';
import { ScheduleManager } from '../components/scheduling/ScheduleManager';
import { ReminderPreferences } from '../components/scheduling/ReminderPreferences';
import AuthGuard from '../components/AuthGuard';

export const SchedulingPage: React.FC = () => {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Schedule & Reminders</h1>
        
        <div className="space-y-8">
          <ScheduleManager />
          <ReminderPreferences />
        </div>
      </div>
    </AuthGuard>
  );
};

export default SchedulingPage;
