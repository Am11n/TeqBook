"use client";

import { motion } from "framer-motion";
import type { OnboardingStep } from "@/lib/utils/onboarding/onboarding-utils";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  stepLabels: string[];
}

export function OnboardingProgress({ currentStep, stepLabels }: OnboardingProgressProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          Step {currentStep} of 3
        </span>
        <span className="text-[10px] text-slate-400">{stepLabels[currentStep - 1]}</span>
      </div>
      {/* Step indicators with circles and connectors */}
      <div className="flex items-center">
        {[1, 2, 3].map((step) => {
          const isActive = currentStep === step;
          const isCompleted = currentStep > step;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle indicator */}
              <motion.div
                className="relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: step * 0.1 }}
              >
                <div
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-blue-700 ring-2 ring-blue-700/30 ring-offset-2 ring-offset-white"
                      : isCompleted
                        ? "bg-slate-300"
                        : "bg-slate-200"
                  }`}
                />
              </motion.div>
              {/* Connector line */}
              {step < 3 && (
                <div className="flex-1 h-[2px] mx-2 relative -z-0">
                  <motion.div
                    className={`h-full rounded-full ${
                      isCompleted || currentStep > step ? "bg-slate-300" : "bg-slate-200"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.4, delay: step * 0.1 + 0.2 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

