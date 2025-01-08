import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { useUpcomingSessions } from '../../hooks/useUpcomingSessions';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ScheduleWidget: React.FC = () => {
  const { sessions, loading, error } = useUpcomingSessions(3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="text-red-500">Error loading schedule: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Upcoming Practice Sessions
          </h3>
          <Link
            to="/schedule"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm"
          >
            Manage Schedule
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const timeUntil = session.nextOccurrence.getTime() - new Date().getTime();
              const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
              const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
              const isToday = session.nextOccurrence.toDateString() === new Date().toDateString();
              const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === session.nextOccurrence.toDateString();

              let timeDescription = '';
              if (isToday) {
                if (hoursUntil > 0) {
                  timeDescription = `In ${hoursUntil}h ${minutesUntil}m`;
                } else {
                  timeDescription = `In ${minutesUntil}m`;
                }
              } else if (isTomorrow) {
                timeDescription = 'Tomorrow';
              } else {
                timeDescription = DAYS_OF_WEEK[session.day_of_week];
              }

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {new Date(`1970-01-01T${session.start_time}Z`).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {timeDescription} • {session.duration_minutes} minutes
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No upcoming sessions</p>
              <Link
                to="/schedule"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm mt-2 inline-block"
              >
                Schedule a practice session
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
