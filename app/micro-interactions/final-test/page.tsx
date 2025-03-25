"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });
  
  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: "#ff0000",
        transformOrigin: "0%",
        zIndex: 10000,
        scaleX
      }}
    />
  );
}

export default function FinalTest() {
  const [lastAction, setLastAction] = useState("");
  const [debugInfo, setDebugInfo] = useState({});
  const contentRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Force the page to have scrollable content
  useEffect(() => {
    // Log scroll-related measurements
    const updateDebugInfo = () => {
      setDebugInfo({
        windowScrollY: window.scrollY,
        documentHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight,
        isScrollable: document.documentElement.scrollHeight > window.innerHeight,
        contentRefHeight: contentRef.current?.scrollHeight || 0,
        targetPosition: targetRef.current?.offsetTop || 0,
      });
    };
    
    // Call once on mount
    updateDebugInfo();
    
    // Set up listener for scroll events
    window.addEventListener("scroll", updateDebugInfo);
    window.addEventListener("resize", updateDebugInfo);
    
    // Force min height for scrollability
    if (contentRef.current) {
      contentRef.current.style.minHeight = "3000px";
    }
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", updateDebugInfo);
      window.removeEventListener("resize", updateDebugInfo);
    };
  }, []);
  
  // Different scroll methods
  const scrollWindow = () => {
    try {
      window.scrollTo({ top: 500, behavior: "smooth" });
      setLastAction("window.scrollTo({ top: 500, behavior: 'smooth' })");
    } catch (err) {
      console.error("Error using window.scrollTo:", err);
      setLastAction(`Error: ${err}`);
    }
  };
  
  const scrollByOffset = () => {
    try {
      window.scrollBy({ top: 200, behavior: "smooth" });
      setLastAction("window.scrollBy({ top: 200, behavior: 'smooth' })");
    } catch (err) {
      console.error("Error using window.scrollBy:", err);
      setLastAction(`Error: ${err}`);
    }
  };
  
  const scrollToElement = () => {
    try {
      if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth" });
        setLastAction("targetRef.scrollIntoView({ behavior: 'smooth' })");
      } else {
        setLastAction("Target element not found");
      }
    } catch (err) {
      console.error("Error using scrollIntoView:", err);
      setLastAction(`Error: ${err}`);
    }
  };
  
  const jumpToLocation = () => {
    try {
      window.location.href = "#target-section";
      setLastAction("window.location.href = '#target-section'");
    } catch (err) {
      console.error("Error using location.href:", err);
      setLastAction(`Error: ${err}`);
    }
  };
  
  return (
    <div ref={contentRef}>
      {/* Progress bar */}
      <ProgressBar />
      
      {/* Fixed debug panel */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 10001,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "4px",
        maxWidth: "400px",
        fontSize: "14px",
        fontFamily: "monospace"
      }}>
        <h3 style={{ margin: "0 0 10px 0" }}>Debug Info</h3>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Last action: {lastAction || "None"}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
          Final Scroll Test
        </h1>
        
        <div style={{ 
          backgroundColor: "#e6f7ff", 
          border: "1px solid #91d5ff",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          <p>This page tests multiple methods of scrolling. Check the debug panel in the top right.</p>
        </div>
        
        {/* Scroll buttons */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px",
          marginBottom: "30px" 
        }}>
          <button 
            onClick={scrollWindow}
            style={{
              backgroundColor: "#1677ff",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Method 1: window.scrollTo(500)
          </button>
          
          <button 
            onClick={scrollByOffset}
            style={{
              backgroundColor: "#52c41a",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Method 2: window.scrollBy(200)
          </button>
          
          <button 
            onClick={scrollToElement}
            style={{
              backgroundColor: "#fa8c16",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Method 3: element.scrollIntoView()
          </button>
          
          <button 
            onClick={jumpToLocation}
            style={{
              backgroundColor: "#722ed1",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Method 4: window.location.href = "#anchor"
          </button>
          
          <a 
            href="#target-section"
            style={{
              backgroundColor: "#eb2f96",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              textDecoration: "none",
              textAlign: "center"
            }}
          >
            Method 5: Standard HTML Anchor Link
          </a>
        </div>
        
        {/* Spacer to ensure scrollability */}
        <div style={{ height: "500px", background: "#f0f0f0", marginBottom: "20px" }}>
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "24px",
            color: "#999" 
          }}>
            Scroll past this spacer...
          </div>
        </div>
        
        {/* Target section */}
        <div 
          id="target-section" 
          ref={targetRef} 
          style={{ 
            padding: "30px", 
            backgroundColor: "#f6ffed", 
            border: "1px solid #b7eb8f",
            borderRadius: "4px"
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
            Target Section
          </h2>
          <p>This is the target section that the scroll buttons should navigate to.</p>
        </div>
        
        {/* Extra content to ensure scrollability */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            style={{ 
              height: "400px", 
              marginTop: "20px",
              background: i % 2 === 0 ? "#f9f0ff" : "#fff0f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#999",
              borderRadius: "4px"
            }}
          >
            Extra Section {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
} 