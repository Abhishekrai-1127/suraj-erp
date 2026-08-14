"use client";

import React from "react";
import { Search, Bell, Mail, Plus } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export default function Header() {
  return (
    <header className="h-[72px] min-h-[72px] bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-8 flex items-center justify-between select-none">
      {/* Search Input */}
      <div className="relative w-[380px]">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search invoices, customers, or reports.."
          className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
        />
      </div>

      {/* Action Icons and Buttons */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon with Indicator */}
        <button className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Mail Icon */}
        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <Mail size={18} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Quick Add Button */}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-150">
          <Plus size={16} className="stroke-[2.5]" />
          Quick Add
        </button>
      </div>
    </header>
  );
}
