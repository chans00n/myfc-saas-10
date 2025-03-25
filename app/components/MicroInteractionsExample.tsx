"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PageTransition } from "@/components/ui/page-transition";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

export function MicroInteractionsExample() {
  const [refreshCount, setRefreshCount] = useState(0);
  
  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshCount(prev => prev + 1);
    toast.success("Refreshed successfully!");
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 space-y-12">
          <h1 className="text-3xl font-bold">Micro Interactions Examples</h1>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Touch Feedback on Buttons</h2>
            <p className="mb-4">Buttons now have a subtle scale animation when tapped:</p>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Page Transitions</h2>
            <p className="mb-4">Page content smoothly fades in when navigating:</p>
            <Card>
              <CardHeader>
                <CardTitle>Page Transition Demo</CardTitle>
                <CardDescription>
                  Content fades in smoothly when the page loads or when navigating between routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This entire page is wrapped in a PageTransition component.</p>
              </CardContent>
            </Card>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
            <p className="mb-4">Display elegant toast notifications:</p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => toast.success("Success notification!")}
                variant="secondary"
              >
                Show Success Toast
              </Button>
              <Button 
                onClick={() => toast.error("Error notification!")}
                variant="destructive"
              >
                Show Error Toast
              </Button>
              <Button 
                onClick={() => toast.info("Info notification!")}
                variant="outline"
              >
                Show Info Toast
              </Button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Pull to Refresh (Mobile Only)</h2>
            <p className="mb-4">On mobile devices, pull down to refresh this content:</p>
            <PullToRefresh onRefresh={handleRefresh}>
              <Card>
                <CardHeader>
                  <CardTitle>Pull to Refresh Demo</CardTitle>
                  <CardDescription>On mobile, pull down to refresh</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Refresh count: {refreshCount}</p>
                  <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                    This works best on actual mobile devices.
                  </p>
                </CardContent>
              </Card>
            </PullToRefresh>
          </section>
          
          {/* Add empty space to make the page scrollable */}
          <div className="h-[50vh]"></div>
        </div>
      </PageTransition>
    </Suspense>
  );
} 