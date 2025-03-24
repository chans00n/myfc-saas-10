'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function NotificationsTestPage() {
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [isLoading, setIsLoading] = useState({
    newWorkout: false,
    reminder: false,
  });
  const [results, setResults] = useState({
    newWorkout: null,
    reminder: null,
  });

  const sendNewWorkoutNotification = async () => {
    if (!workoutTitle) {
      toast.error('Workout title is required');
      return;
    }

    setIsLoading((prev) => ({ ...prev, newWorkout: true }));
    
    try {
      const response = await fetch('/api/notifications/new-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: workoutTitle,
          description: workoutDescription,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send new workout notifications');
      }
      
      setResults((prev) => ({ ...prev, newWorkout: data }));
      toast.success('New workout notifications sent successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send notifications');
    } finally {
      setIsLoading((prev) => ({ ...prev, newWorkout: false }));
    }
  };

  const sendWorkoutReminders = async () => {
    setIsLoading((prev) => ({ ...prev, reminder: true }));
    
    try {
      const response = await fetch('/api/notifications/workout-reminders', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send workout reminders');
      }
      
      setResults((prev) => ({ ...prev, reminder: data }));
      toast.success('Workout reminders sent successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send reminders');
    } finally {
      setIsLoading((prev) => ({ ...prev, reminder: false }));
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-bold">Notification Testing</h1>
      <p className="text-neutral-500 dark:text-neutral-400">
        Use this page to test the notification system. You can send new workout notifications 
        and workout reminders to users who have opted in.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>New Workout Notification</CardTitle>
            <CardDescription>
              Send a notification to users about a new workout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Workout Title</label>
              <Input 
                value={workoutTitle} 
                onChange={(e) => setWorkoutTitle(e.target.value)} 
                placeholder="Enter workout title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Workout Description</label>
              <Textarea 
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="Enter workout description (optional)"
                rows={3}
              />
            </div>
            <Button 
              onClick={sendNewWorkoutNotification} 
              disabled={isLoading.newWorkout}
              className="w-full"
            >
              {isLoading.newWorkout ? 'Sending...' : 'Send New Workout Notification'}
            </Button>

            {results.newWorkout && (
              <div className="mt-4">
                <Separator className="my-4" />
                <h3 className="text-sm font-medium mb-2">Results:</h3>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                  {JSON.stringify(results.newWorkout, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout Reminder</CardTitle>
            <CardDescription>
              Send workout reminder to users based on their preferred time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will send workout reminders to users who have set their reminder preference for the current hour.
            </p>
            
            <Button 
              onClick={sendWorkoutReminders} 
              disabled={isLoading.reminder}
              className="w-full"
            >
              {isLoading.reminder ? 'Sending...' : 'Send Workout Reminders'}
            </Button>

            {results.reminder && (
              <div className="mt-4">
                <Separator className="my-4" />
                <h3 className="text-sm font-medium mb-2">Results:</h3>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                  {JSON.stringify(results.reminder, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 