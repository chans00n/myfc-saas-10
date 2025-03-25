"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DebugView() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasButtons, setHasButtons] = useState(false);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentage = (window.scrollY / scrollHeight) * 100;
      setScrollPercentage(Math.min(Math.round(percentage), 100));
      
      if (window.scrollY > 10) setHasScrolled(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Set a timeout to check if buttons are visible
    const timeout = setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      setHasButtons(buttons.length > 0);
    }, 1000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Micro Interactions Debug View</h1>
      
      <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md mb-8">
        <h2 className="text-lg font-bold">Diagnostics</h2>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>Scroll progress: {scrollPercentage}%</li>
          <li>Progress bar visibility: {hasScrolled ? "✅ Scrolled, should be visible" : "❌ Not scrolled yet"}</li>
          <li>Buttons present: {hasButtons ? "✅ Yes" : "❌ No"}</li>
          <li>Current window dimensions: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. Scroll Progress Indicator</h2>
        <p className="mb-2">There should be a <span className="text-red-600 font-bold">bright red 10px tall bar</span> at the very top of the page that fills as you scroll.</p>
        <div className="h-20 bg-red-100 flex items-center justify-center border border-red-300 mb-2">
          This represents the progress bar (at the very top of page)
        </div>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Scroll to Top
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">2. Button Touch Feedback</h2>
        <p className="mb-4">Buttons should slightly scale down when clicked:</p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => toast.success("Button pressed!")}>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. Toast Notifications</h2>
        <p className="mb-4">Click to see toast notifications:</p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => toast.success("Success message!")} variant="secondary">Show Success Toast</Button>
          <Button onClick={() => toast.error("Error message!")} variant="destructive">Show Error Toast</Button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">4. Pull to Refresh (Mobile Only)</h2>
        <p>This is only visible on mobile devices when you pull down on the screen.</p>
      </div>
      
      {/* Add lots of space to make the page very scrollable */}
      <div className="space-y-32">
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          Scroll down to see progress indicator work
        </div>
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          Keep scrolling...
        </div>
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          Almost there...
        </div>
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          You made it to the bottom!
        </div>
      </div>
    </div>
  );
} 