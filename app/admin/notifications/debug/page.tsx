"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NotificationsDebugPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    users: false,
    subscriptions: false
  });

  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      toast.success("Users fetched successfully");
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(prev => ({ ...prev, subscriptions: true }));
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
      toast.success("Subscriptions fetched successfully");
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast.error(`Failed to fetch subscriptions: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, subscriptions: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notifications Debug</h1>
        <p className="text-muted-foreground mt-2">
          View and debug notification data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users with Notification Preferences</CardTitle>
          <CardDescription>
            View users who have notification settings configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={fetchUsers} 
              disabled={loading.users}
            >
              {loading.users ? "Loading..." : "Fetch Users"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {users.length} users found
            </span>
          </div>
          
          {users.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Push</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">New Workouts</th>
                    <th className="p-2 text-left">Reminders</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2 text-sm">{user.id.substring(0, 8)}...</td>
                      <td className="p-2 text-sm">{user.email}</td>
                      <td className="p-2 text-sm">{user.push_notifications_enabled ? "✅" : "❌"}</td>
                      <td className="p-2 text-sm">{user.email_notifications_enabled ? "✅" : "❌"}</td>
                      <td className="p-2 text-sm">{user.new_workout_notifications ? "✅" : "❌"}</td>
                      <td className="p-2 text-sm">{user.workout_reminder_enabled ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No users found. Click "Fetch Users" to load data.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Subscriptions</CardTitle>
          <CardDescription>
            View registered push notification subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={fetchSubscriptions} 
              disabled={loading.subscriptions}
            >
              {loading.subscriptions ? "Loading..." : "Fetch Subscriptions"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {subscriptions.length} subscriptions found
            </span>
          </div>
          
          {subscriptions.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">User ID</th>
                    <th className="p-2 text-left">Endpoint</th>
                    <th className="p-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-t">
                      <td className="p-2 text-sm">{sub.id.substring(0, 8)}...</td>
                      <td className="p-2 text-sm">{sub.user_id.substring(0, 8)}...</td>
                      <td className="p-2 text-sm">{sub.endpoint.substring(0, 30)}...</td>
                      <td className="p-2 text-sm">{new Date(sub.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No subscriptions found. Click "Fetch Subscriptions" to load data.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 