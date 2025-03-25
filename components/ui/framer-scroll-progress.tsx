"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface FramerScrollProgressProps {
  color?: string;
  height?: number;
  zIndex?: number;
  className?: string;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export function FramerScrollProgress({
  color = "#ff0000",
  height = 4,
  zIndex = 50,
  className,
  springConfig = {
    stiffness: 300,
    damping: 30,
    mass: 1
  }
}: FramerScrollProgressProps) {
  // Use Framer Motion's built-in scroll progress tracking
  const { scrollYProgress } = useScroll();
  
  // Apply spring physics for smooth animation
  const scaleX = useSpring(scrollYProgress, springConfig);

  return (
    <motion.div
      className={cn("fixed top-0 left-0 right-0 origin-left", className)}
      style={{
        height,
        backgroundColor: color,
        scaleX,
        zIndex,
        transformOrigin: "0%"
      }}
    />
  );
} 