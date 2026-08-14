import React from "react";

export function CircularProgress({
  percentage = 0,
  size = 140,
  strokeWidth = 12,
  colorClass = "text-[#2563eb]",
  trackColorClass = "text-slate-100 dark:text-slate-800/80",
  gradientColors = ["#2563eb", "#3b82f6"],
  children,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const gradientId = `circle-progress-grad-${percentage}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        {/* Track circle */}
        <circle
          className={trackColorClass}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Indicator circle */}
        <circle
          className="transition-all duration-500 ease-out"
          stroke={`url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Central content */}
      <div className="absolute flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

