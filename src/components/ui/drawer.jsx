"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({
  isOpen,
  onClose,
  position = "right",
  title = "Details",
  size = "md",
  children,
}) {
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  }[size] || "max-w-md";

  const isLeft = position === "left";
  const positionClasses = isLeft ? "left-0" : "right-0";
  const paddingClass = isLeft ? "pr-4 sm:pr-10" : "pl-4 sm:pl-10";
  const borderClass = isLeft ? "border-r" : "border-l";
  const slideAnimation = isLeft
    ? "animate-in slide-in-from-left duration-250"
    : "animate-in slide-in-from-right duration-250";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 ${positionClasses} flex max-w-full ${paddingClass}`}>
        <div
          className={`w-full ${sizeClasses} transform bg-white dark:bg-slate-900 shadow-2xl ${borderClass} border-slate-200/80 dark:border-slate-800 flex flex-col justify-between ${slideAnimation}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              aria-label="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
