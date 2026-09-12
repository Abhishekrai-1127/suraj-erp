"use client";

import React, { useState, useEffect } from "react";
import { Target, Pencil, TrendingUp, Sparkles } from "lucide-react";
import { getStoredDocuments, getStoredSalesTarget } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";
import SetSalesTargetModal from "./set-sales-target-modal";

export default function SalesTarget() {
  const [stats, setStats] = useState({
    targetAmount: 0,
    isTargetSet: false,
    currentRevenue: 0,
    invoicedTotal: 0,
    bookedOrdersTotal: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
  }).format(new Date());

  useEffect(() => {
    const calculateSalesProgress = () => {
      const docs = getStoredDocuments();
      let invoiced = 0;
      let booked = 0;

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        if (doc.type === "invoice") {
          invoiced += amt;
        } else if (doc.type === "order") {
          booked += amt;
        }
      }

      const totalAchieved = invoiced + booked;
      // Retrieve persistent user-defined target for the active month
      const storedTarget = getStoredSalesTarget();
      const isTargetConfigured = Boolean(storedTarget.isSet && storedTarget.targetAmount > 0);

      setStats({
        targetAmount: isTargetConfigured ? storedTarget.targetAmount : 0,
        isTargetSet: isTargetConfigured,
        currentRevenue: totalAchieved,
        invoicedTotal: invoiced,
        bookedOrdersTotal: booked,
      });
    };

    calculateSalesProgress();
    window.addEventListener("erp_document_created", calculateSalesProgress);
    window.addEventListener("erp_sales_target_updated", calculateSalesProgress);
    window.addEventListener("storage", calculateSalesProgress);

    return () => {
      window.removeEventListener("erp_document_created", calculateSalesProgress);
      window.removeEventListener("erp_sales_target_updated", calculateSalesProgress);
      window.removeEventListener("storage", calculateSalesProgress);
    };
  }, []);

  const percentage =
    stats.isTargetSet && stats.targetAmount > 0
      ? Math.min(100, Math.round((stats.currentRevenue / stats.targetAmount) * 100))
      : 0;
  const remainingAmount = stats.isTargetSet
    ? Math.max(0, stats.targetAmount - stats.currentRevenue)
    : 0;
  const isGoalReached = stats.isTargetSet && stats.targetAmount > 0 && stats.currentRevenue >= stats.targetAmount;

  return (
    <>
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
                {currentMonthName} Run-rate
              </span>
            </div>
          </div>

          {/* Target Status / Action Badge */}
          <div className="flex items-center gap-2">
            {stats.isTargetSet ? (
              <div className="flex items-center gap-1.5">
                <span
                  suppressHydrationWarning
                  className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                    isGoalReached
                      ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-blue-100/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                  }`}
                >
                  {isGoalReached && <Sparkles size={12} />}
                  {isGoalReached ? "Goal Reached! 🎉" : `${percentage}% Achieved`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Target"
                  aria-label="Edit Target"
                >
                  <Pencil size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100/70 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Target Not Set</span>
                <span className="text-[10px] underline ml-0.5">Set</span>
              </button>
            )}
          </div>
        </div>

        {/* Figures Row */}
        <div className="grid grid-cols-3 gap-2 py-1 border-y border-slate-100 dark:border-slate-800 text-center items-center">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Target
            </span>
            {stats.isTargetSet ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="group inline-flex items-center gap-1 text-sm font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Click to edit target"
              >
                <span suppressHydrationWarning>{formatCurrency(stats.targetAmount)}</span>
                <Pencil size={11} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Set Target +
              </button>
            )}
          </div>
          <div className="border-x border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Achieved
            </span>
            <span suppressHydrationWarning className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.currentRevenue)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Remaining
            </span>
            <span suppressHydrationWarning className="text-sm font-black text-slate-900 dark:text-white">
              {stats.isTargetSet ? formatCurrency(remainingAmount) : "--"}
            </span>
          </div>
        </div>

        {/* Progress or Setup Prompt */}
        {stats.isTargetSet ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <TrendingUp size={13} className="text-blue-500" />
                Target Progress
              </span>
              <span
                suppressHydrationWarning
                className={isGoalReached ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-blue-600 dark:text-blue-400"}
              >
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-3 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                No Target Configured
              </span>
              <span className="text-[11px] font-medium text-slate-400 block">
                Define goal for {currentMonthName} to track progress.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <Target size={13} />
              Set Target
            </button>
          </div>
        )}

        {/* Target Breakdown Footer */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1 border-t border-slate-100/80 dark:border-slate-800/60">
          <span suppressHydrationWarning>
            Invoiced: {formatCurrency(stats.invoicedTotal)}
          </span>
          <span suppressHydrationWarning>
            Booked Orders: {formatCurrency(stats.bookedOrdersTotal)}
          </span>
        </div>
      </div>

      {/* Target Setting / Editing Modal */}
      <SetSalesTargetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentTarget={stats.targetAmount}
        isTargetSet={stats.isTargetSet}
        currentRevenue={stats.currentRevenue}
        invoicedTotal={stats.invoicedTotal}
        bookedOrdersTotal={stats.bookedOrdersTotal}
      />
    </>
  );
}

