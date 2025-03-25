"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

// Self-contained Framer scroll progress component with no external dependencies
function StandaloneFramerProgress({
  color = "#ff0000",
  height = 4,
  zIndex = 50
}) {
  // Use Framer Motion's built-in scroll progress tracking
  const { scrollYProgress } = useScroll();
  
  // Apply spring physics for smooth animation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    mass: 1
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height,
        backgroundColor: color,
        scaleX,
        zIndex,
        transformOrigin: "0%"
      }}
    />
  );
}

export default function FramerStandalone() {
  const [isScrollable, setIsScrollable] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Simple toast notification
  const toast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

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
    <div style={{ position: "relative" }}>
      {/* Red progress bar at top of screen */}
      <StandaloneFramerProgress 
        color="#ff0000" 
        height={10} 
        zIndex={10000}
      />
      
      {/* Toast notification */}
      {showToast && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#333",
          color: "white",
          padding: "10px 20px",
          borderRadius: "4px",
          zIndex: 10001,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
        }}>
          {toastMessage}
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: "24px" }}>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: "bold", 
          marginBottom: "24px"
        }}>
          Standalone Framer Motion Scroll Progress
        </h1>
        
        <div style={{ 
          backgroundColor: "#fee2e2", 
          border: "1px solid #fecaca", 
          padding: "16px", 
          borderRadius: "8px", 
          marginBottom: "32px"
        }}>
          <h2 style={{ fontWeight: "bold", marginBottom: "8px" }}>Scroll Status:</h2>
          <p>Page is {isScrollable ? "scrollable ✅" : "not scrollable ❌"}</p>
          <p>Scroll down to see the red progress bar at the top move.</p>
        </div>
        
        <button
          onClick={() => {
            window.scrollTo({ top: 500, behavior: 'smooth' });
            toast("Scrolled down 500px");
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginBottom: "24px",
            cursor: "pointer"
          }}
        >
          Scroll Down 500px
        </button>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
          {/* Generate plenty of sections to ensure scrollability */}
          {Array.from({ length: 10 }).map((_, i) => (
            <section 
              key={i} 
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "32px",
                backgroundColor: "#f9fafb"
              }}
            >
              <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                Section {i + 1}
              </h2>
              <div style={{
                height: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px"
              }}>
                Content block {i + 1} - scroll position marker
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
} 