import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function ProgressBar({ value, max = 100, color = "bg-primary", className, ...props }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden", className)} {...props}>
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
