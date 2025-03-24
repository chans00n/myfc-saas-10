'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationPreferences {
  new_workout_notifications: boolean;
  new_workout_notification_time: string;
  workout_reminder_enabled: boolean;
  workout_reminder_time: string;
}

export function WorkoutNotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    new_workout_notifications: true,
    new_workout_notification_time: '08:00',
    workout_reminder_enabled: false,
    workout_reminder_time: '17:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user/notification-preferences');
        if (!response.ok) {
          throw new Error('Failed to fetch notification preferences');
        }
        const data = await response.json();
        setPreferences({
          new_workout_notifications: !!data.new_workout_notifications,
          new_workout_notification_time: data.new_workout_notification_time || '08:00',
          workout_reminder_enabled: !!data.workout_reminder_enabled,
          workout_reminder_time: data.workout_reminder_time || '17:00',
        });
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const savePreferences = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_workout_notifications: preferences.new_workout_notifications ? 1 : 0,
          new_workout_notification_time: preferences.new_workout_notification_time,
          workout_reminder_enabled: preferences.workout_reminder_enabled ? 1 : 0,
          workout_reminder_time: preferences.workout_reminder_time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      setSuccessMessage('Notification preferences saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNewWorkoutNotifications = (checked: boolean) => {
    setPreferences({
      ...preferences,
      new_workout_notifications: checked,
    });
    savePreferences();
  };

  const handleNewWorkoutTimeChange = (value: string) => {
    setPreferences({
      ...preferences,
      new_workout_notification_time: value,
    });
    savePreferences();
  };

  const handleToggleWorkoutReminder = (checked: boolean) => {
    setPreferences({
      ...preferences,
      workout_reminder_enabled: checked,
    });
    savePreferences();
  };

  const handleWorkoutReminderTimeChange = (value: string) => {
    setPreferences({
      ...preferences,
      workout_reminder_time: value,
    });
    savePreferences();
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4 animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 border-t border-neutral-200 dark:border-neutral-700 pt-5">
      <h3 className="font-medium text-lg text-neutral-800 dark:text-neutral-200">Workout Notifications</h3>
      
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* New Workout Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200">New Workout Alerts</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Get notified when a new workout is available
          </p>
        </div>
        <Switch 
          checked={preferences.new_workout_notifications} 
          onCheckedChange={handleToggleNewWorkoutNotifications}
          disabled={isSaving}
        />
      </div>
      
      {preferences.new_workout_notifications && (
        <div className="ml-6 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="newWorkoutTime" className="text-sm text-neutral-700 dark:text-neutral-300">
              Notification time:
            </Label>
            <Select 
              value={preferences.new_workout_notification_time} 
              onValueChange={handleNewWorkoutTimeChange}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]" id="newWorkoutTime">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00">6:00 AM</SelectItem>
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Workout Reminder */}
      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Daily Workout Reminder</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Receive a reminder to complete your workout
          </p>
        </div>
        <Switch 
          checked={preferences.workout_reminder_enabled} 
          onCheckedChange={handleToggleWorkoutReminder}
          disabled={isSaving}
        />
      </div>
      
      {preferences.workout_reminder_enabled && (
        <div className="ml-6 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="reminderTime" className="text-sm text-neutral-700 dark:text-neutral-300">
              Reminder time:
            </Label>
            <Select 
              value={preferences.workout_reminder_time} 
              onValueChange={handleWorkoutReminderTimeChange}
              disabled={isSaving}
            >
              <SelectTrigger className="w-[140px]" id="reminderTime">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
} 