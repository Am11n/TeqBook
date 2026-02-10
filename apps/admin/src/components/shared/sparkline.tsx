"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

type SparklineProps = {
  /** Array of numeric data points */
  data: number[];
  /** Width of the SVG (default: 80) */
  width?: number;
  /** Height of the SVG (default: 24) */
  height?: number;
  /** Stroke color override. If not set, auto-detects from trend. */
  color?: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * Lightweight inline SVG sparkline.
 * Renders a polyline from a number[] array.
 * Auto-colors green (uptrend) or red (downtrend) based on first vs last value.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} className={className} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y = padding + innerHeight - ((value - min) / range) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const isUptrend = data[data.length - 1] >= data[0];
  const strokeColor = color ?? (isUptrend ? "#16a34a" : "#dc2626");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
