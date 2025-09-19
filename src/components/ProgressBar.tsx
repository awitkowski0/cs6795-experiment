"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  showSteps?: boolean;
}

export function ProgressBar({ progress, showPercentage = true }: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);



  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-black">
              Survey Progress
            </span>
          </div>
          {showPercentage && (
            <span className="text-sm font-medium text-black">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
        
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}