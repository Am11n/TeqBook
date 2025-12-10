"use client";

import React, { useEffect } from "react";

type LogoLoopProps = {
  logos: Array<{ emoji: string; alt: string }>;
  speed?: number;
  direction?: "left" | "right";
  logoHeight?: number;
  gap?: number;
  className?: string;
  fadeOut?: boolean;
  fadeOutColor?: string;
};

export function LogoLoop({
  logos,
  speed = 40,
  direction = "left",
  logoHeight = 24,
  gap = 24,
  className = "",
  fadeOut = true,
  fadeOutColor = "rgb(239, 246, 255)", // blue-50
}: LogoLoopProps) {
  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];
  const logoWidth = logoHeight + gap;
  const translateDistance = logos.length * logoWidth;
  const animationId = `logo-loop-${direction}-${translateDistance}`;

  useEffect(() => {
    // Inject keyframes dynamically
    const styleId = `logo-loop-style-${animationId}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes ${animationId} {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-${translateDistance}px);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [animationId, translateDistance]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {fadeOut && (
        <>
          <div
            className="absolute left-0 top-0 z-10 h-full w-16 pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${fadeOutColor}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 z-10 h-full w-16 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${fadeOutColor}, transparent)`,
            }}
          />
        </>
      )}
      <div
        className="flex items-center"
        style={{
          gap: `${gap}px`,
          animation: `${animationId} ${speed}s linear infinite`,
          width: "fit-content",
        }}
      >
        {duplicatedLogos.map((logo, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center shrink-0"
            style={{
              height: `${logoHeight}px`,
              width: `${logoHeight}px`,
              fontSize: `${logoHeight}px`,
              lineHeight: 1,
            }}
            aria-label={logo.alt}
          >
            {logo.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

