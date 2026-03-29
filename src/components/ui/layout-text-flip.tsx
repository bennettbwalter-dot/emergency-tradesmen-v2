"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text,
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}: {
  text?: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Find the longest word to set a stable width
  const longestWord = React.useMemo(() => {
    return words.reduce((a, b) => (a.length > b.length ? a : b), "");
  }, [words]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <>
      {text && (
        <motion.span
          layoutId="subtext"
          className="text-lg font-bold tracking-tight text-foreground drop-shadow-lg md:text-2xl"
        >
          {text}
        </motion.span>
      )}

      {/* Container with stable width based on longest word - Mobile Optimized */}
      <div className="relative inline-block h-auto w-auto max-w-[90vw] md:max-w-none overflow-hidden rounded-md border border-gold/20 bg-card px-2 py-1 font-sans text-lg font-bold tracking-tight text-gold shadow-sm ring shadow-gold/10 ring-gold/10 drop-shadow-lg md:text-2xl align-bottom">
        {/* Invisible spacer to set dimensions */}
        <span className="opacity-0 pointer-events-none select-none whitespace-normal text-center md:whitespace-nowrap block">
          {longestWord}
        </span>

        {/* Absolute positioned animating text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentIndex}
              initial={{ y: -40, filter: "blur(10px)", opacity: 0 }}
              animate={{
                y: 0,
                filter: "blur(0px)",
                opacity: 1
              }}
              exit={{ y: 40, filter: "blur(10px)", opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              className={cn("inline-block absolute inset-0 flex items-center justify-center whitespace-normal md:whitespace-nowrap text-center")}
            >
              {words[currentIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
