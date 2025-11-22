"use client";

import "@/components/loader.css";
import { useState, useEffect, useRef } from "react";

export default function Loading() {
  const letters = "CODEBOUNCE".split("");
  const [lowercaseIndices, setLowercaseIndices] = useState<Set<number>>(new Set());
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const delayBetweenLetters = 300;
    const totalDuration = letters.length * delayBetweenLetters + 500; // Extra time before reset
    
    const animateWave = () => {
      // Clear any existing timeouts
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      
      // Convert letters to lowercase sequentially
      letters.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setLowercaseIndices((prev) => new Set(prev).add(index));
        }, index * delayBetweenLetters);
        timeoutRefs.current.push(timeout);
      });
      
      // Reset all letters back to uppercase after wave completes
      const resetTimeout = setTimeout(() => {
        setLowercaseIndices(new Set());
      }, totalDuration);
      timeoutRefs.current.push(resetTimeout);
    };
    
    // Start the first wave
    animateWave();
    
    // Repeat the wave animation
    const interval = setInterval(animateWave, totalDuration);
    
    return () => {
      clearInterval(interval);
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black">
      <div className="flex items-center justify-center mb-8">
        {letters.map((letter, index) => {
          const isLowercase = lowercaseIndices.has(index);
          const displayLetter = isLowercase ? letter.toLowerCase() : letter;
          
          return (
            <span
              key={index}
              className={`font-pixelated text-4xl sm:text-5xl md:text-6xl text-white logo-shadow-main lowercase-transition ${
                isLowercase ? "settled" : ""
              }`}
            >
              {displayLetter === " " ? "\u00A0" : displayLetter}
            </span>
          );
        })}
      </div>
      <div className="w-64 sm:w-80">
        <div className="loading-bar"></div>
      </div>
    </div>
  );
}
