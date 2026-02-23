import React from "react";
import { View } from "react-native";

interface ProgressDotsProps {
  /** Total number of steps in the flow */
  totalSteps: number;
  /** Currently active step (0-indexed) */
  activeStep: number;
}

/**
 * Reusable progress-dot indicator.
 * The active step renders as an elongated pill; the rest as small circles.
 */
export default function ProgressDots({ totalSteps, activeStep }: ProgressDotsProps) {
  return (
    <View
      className="flex-row items-center justify-center gap-3 py-5"
      accessibilityRole="progressbar"
      accessibilityLabel={`Paso ${activeStep + 1} de ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${
            index === activeStep
              ? "w-8 bg-sos-bluegreen"
              : "w-2 bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </View>
  );
}
