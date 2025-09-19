"use client";

import { useEffect, useState } from "react";

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  showSteps?: boolean;
}

const SURVEY_STEPS = [
  { name: "Consent", percentage: 2 },
  { name: "Demographics", percentage: 5 },
  { name: "Challenge 1", percentage: 15 },
  { name: "Challenge 2", percentage: 35 },
  { name: "Challenge 3", percentage: 55 },
  { name: "Challenge 4", percentage: 75 },
  { name: "Challenge 5", percentage: 95 },
  { name: "Complete", percentage: 100 },
];

export function ProgressBar({ progress, showPercentage = true, showSteps = false }: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getCurrentStep = () => {
    for (let i = SURVEY_STEPS.length - 1; i >= 0; i--) {
      if (progress >= SURVEY_STEPS[i].percentage) {
        return SURVEY_STEPS[i];
      }
    }
    return SURVEY_STEPS[0];
  };

  const currentStep = getCurrentStep();

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
          {/* Background bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Progress bar */}
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