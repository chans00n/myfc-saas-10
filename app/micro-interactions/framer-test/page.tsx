"use client";

import { FramerScrollProgress } from "@/components/ui/framer-scroll-progress";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FramerTest() {
  const [isScrollable, setIsScrollable] = useState(false);

  // Check if the page has enough content to be scrollable
  useEffect(() => {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    setIsScrollable(documentHeight > windowHeight);
    
    console.log({
      documentHeight,
      windowHeight,
      isScrollable: documentHeight > windowHeight,
      difference: documentHeight - windowHeight
    });
    
    // Force-add a scrollable area if needed
    if (documentHeight <= windowHeight) {
      console.log("Page is not scrollable, adding extra content");
      const extraSpace = document.createElement('div');
      extraSpace.style.height = '2000px';
      document.body.appendChild(extraSpace);
      
      return () => {
        if (document.body.contains(extraSpace)) {
          document.body.removeChild(extraSpace);
        }
      };
    }
  }, []);

  return (
    <div className="relative">
      {/* Red progress bar at top of screen */}
      <FramerScrollProgress 
        color="#ff0000" 
        height={10} 
        zIndex={10000}
      />
      
      {/* Content */}
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Framer Motion Scroll Progress</h1>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-8">
          <h2 className="font-bold mb-2">Scroll Status:</h2>
          <p>Page is {isScrollable ? "scrollable ✅" : "not scrollable ❌"}</p>
          <p>Scroll down to see the red progress bar at the top move.</p>
        </div>
        
        <button
          onClick={() => {
            window.scrollTo({ top: 500, behavior: 'smooth' });
            toast.success("Scrolled down 500px");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded mb-6"
        >
          Scroll Down 500px
        </button>
        
        <div className="space-y-16">
          {/* Generate plenty of sections to ensure scrollability */}
          {Array.from({ length: 10 }).map((_, i) => (
            <section key={i} className="border rounded-lg p-8 bg-gray-50">
              <h2 className="text-2xl font-bold mb-4">Section {i + 1}</h2>
              <div className="h-40 flex items-center justify-center bg-gray-100 rounded">
                Content block {i + 1} - scroll position marker
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
} 