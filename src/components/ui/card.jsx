import React from "react";

// Inline helper for class merge since it's simple
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
