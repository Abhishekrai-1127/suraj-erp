"use client";

import React, { useState, useEffect } from "react";
import { Target, X, Check, RotateCcw, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { saveSalesTarget, resetSalesTarget } from "@/lib/erp-storage";
import { formatCurrency, formatCompactNumber, parseAmount } from "@/lib/formatters";

const TARGET_PRESETS = [
  { label: "₹5 Lakh", value: 500000 },
  { label: "₹10 Lakh", value: 1000000 },
  { label: "₹25 Lakh", value: 2500000 },
  { label: "₹50 Lakh", value: 5000000 },
  { label: "₹1 Crore", value: 10000000 },
];

/**
 * Interactive modal allowing sales managers to set, modify, or reset monthly sales targets.
 * Keyed by calendar month to prevent target leakage across financial quarters.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility flag
 * @param {Function} props.onClose - Modal dismissal callback
 * @param {number} props.currentTarget - Currently saved target (0 if not set)
 * @param {boolean} props.isTargetSet - Whether user has explicitly saved a target
 * @param {number} props.currentRevenue - Current sales achieved in the month (invoiced + booked)
 * @param {number} props.invoicedTotal - Total invoiced revenue this month
 * @param {number} props.bookedOrdersTotal - Total booked orders revenue this month
 */
export default function SetSalesTargetModal({
  isOpen,
  onClose,
  currentTarget = 0,
  isTargetSet = false,
  currentRevenue = 0,
  invoicedTotal = 0,
  bookedOrdersTotal = 0,
}) {
  const [inputValue, setInputValue] = useState("");
  const currentMonthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Populate or reset input value when modal opens
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      setInputValue(currentTarget > 0 ? String(currentTarget) : "");
    }
  }, [isOpen, currentTarget]);

  // Handle ESC key listener for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numericTarget = parseAmount(inputValue);
  const projectedPercentage =
    numericTarget > 0
      ? Math.min(100, Math.round((currentRevenue / numericTarget) * 100))
      : 0;
  const remainingNeeded = Math.max(0, numericTarget - currentRevenue);
  const isGoalReached = numericTarget > 0 && currentRevenue >= numericTarget;

  const handlePresetClick = (val) => {
    setInputValue(String(val));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (numericTarget <= 0) {
      toast.error("Please enter a valid target amount greater than zero.");
      return;
    }

    saveSalesTarget(numericTarget);
    toast.success(`Monthly target set to ${formatCurrency(numericTarget)} for ${currentMonthName}!`);
    onClose();
  };

  const handleReset = () => {
    resetSalesTarget();
    toast.info(`Monthly sales target cleared for ${currentMonthName}.`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isTargetSet ? "Edit Monthly Sales Target" : "Set Monthly Sales Target"}
              </h2>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Performance Target for <span className="font-semibold text-slate-600 dark:text-slate-300">{currentMonthName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Current Month Progress Banner */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Current Achieved ({currentMonthName})
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(currentRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-1 border-t border-blue-100/60 dark:border-blue-950/40">
              <span>Invoiced: {formatCurrency(invoicedTotal)}</span>
              <span>Booked Orders: {formatCurrency(bookedOrdersTotal)}</span>
            </div>
          </div>

          {/* Target Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="1000"
                required
                autoFocus
                placeholder="e.g. 1000000"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            {numericTarget > 0 && (
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pl-1">
                Equivalent: {formatCurrency(numericTarget)} ({formatCompactNumber(numericTarget)})
              </p>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Target Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    numericTarget === preset.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Projection Analysis */}
          {numericTarget > 0 && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-500" />
                  Projected Goal Completion
                </span>
                <span
                  className={`font-black ${
                    isGoalReached
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {projectedPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isGoalReached
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                  style={{ width: `${projectedPercentage}%` }}
                />
              </div>

              {/* Status Message */}
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                {isGoalReached ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles size={12} /> Target already achieved with current monthly sales!
                  </span>
                ) : (
                  <span>Remaining needed: {formatCurrency(remainingNeeded)}</span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              {isTargetSet && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <RotateCcw size={13} />
                  Clear Target
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={numericTarget <= 0}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <Check size={14} />
                Save Target
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
