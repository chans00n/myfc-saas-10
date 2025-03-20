import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-500">
          Welcome to your facial fitness dashboard.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Today's Workout</h3>
          <p className="text-neutral-500 mb-4">Your daily facial fitness routine</p>
          <div className="aspect-video bg-neutral-100 rounded-md mb-4 flex items-center justify-center text-neutral-400">
            Video Thumbnail
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">Jawline Sculpt</div>
              <div className="text-sm text-neutral-500">15 min • Medium</div>
            </div>
            <button className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm">
              Start
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Progress</h3>
          <p className="text-neutral-500 mb-4">Your fitness streak</p>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">7</div>
            <div className="text-sm text-neutral-500">Days in a row</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-md bg-neutral-800"
              />
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-2">Achievements</h3>
          <p className="text-neutral-500 mb-4">Your latest badges</p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-full bg-neutral-100 flex items-center justify-center"
              >
                🏆
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 