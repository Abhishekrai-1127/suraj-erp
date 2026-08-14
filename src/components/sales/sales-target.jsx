"use client";

import React from "react";
import { Target, TrendingUp, DollarSign } from "lucide-react";

export default function SalesTarget({
  targetAmount = 500000,
  currentRevenue = 410000,
}) {
  const percentage = Math.min(100, Math.round((currentRevenue / targetAmount) * 100));
  const remainingAmount = targetAmount - currentRevenue;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Monthly Sales Target
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              Q4 Target Run-rate
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
          {percentage}% Achieved
        </span>
      </div>

      {/* Figures Row */}
      <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-100 dark:border-slate-800 text-center">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Target
          </span>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            ₹{targetAmount.toLocaleString()}
          </span>
        </div>
        <div className="border-x border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Achieved
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            ₹{currentRevenue.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Remaining
          </span>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            ₹{remainingAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-extrabold">
          <span className="text-slate-700 dark:text-slate-300">Target Progress</span>
          <span className="text-blue-600 dark:text-blue-400">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Target Breakdown Footer */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1">
        <span>Invoiced: ₹325,100</span>
        <span>Booked Orders: ₹84,900</span>
      </div>
    </div>
  );
}
