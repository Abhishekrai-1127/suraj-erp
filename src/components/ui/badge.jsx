import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Badge({ children, variant = "default", className, ...props }) {
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors duration-150 border";
  
  const variants = {
    default: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800",
    gray: "bg-slate-150 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    
    // Status and Trend variants matching mock colors
    orange: "bg-[#fff1ec] text-[#e05e38] border-[#ffe2d6] dark:bg-orange-950/20 dark:text-[#ff8f6b] dark:border-orange-900/30",
    red: "bg-[#fff0f0] text-[#dd3333] border-[#ffd6d6] dark:bg-red-950/20 dark:text-[#ff8888] dark:border-red-900/30",
    blue: "bg-[#eef2ff] text-[#2563eb] border-[#e0e7ff] dark:bg-blue-950/20 dark:text-[#60a5fa] dark:border-blue-900/30",
    purple: "bg-[#f5f3ff] text-[#7c3aed] border-[#ede9fe] dark:bg-purple-950/20 dark:text-[#a78bfa] dark:border-purple-900/30",
    brown: "bg-[#faf7f2] text-[#855e42] border-[#f3ebde] dark:bg-amber-950/10 dark:text-[#d4a373] dark:border-amber-900/20",
    
    // Custom aliases to match screenshot states
    shipped: "bg-[#fff1ec] text-[#e05e38] border-[#ffe2d6] dark:bg-orange-950/20 dark:text-[#ff8f6b] dark:border-orange-900/30",
    processing: "bg-[#eef2ff] text-[#2563eb] border-[#e0e7ff] dark:bg-blue-950/20 dark:text-[#60a5fa] dark:border-blue-900/30",
    draft: "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0] dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={cn(baseStyle, selectedVariant, className)} {...props}>
      {children}
    </span>
  );
}
