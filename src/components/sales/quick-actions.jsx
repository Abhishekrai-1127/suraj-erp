"use client";

import React, { useState } from "react";
import {
  FilePlus,
  ShoppingBag,
  Receipt,
  CircleDollarSign,
  Printer,
  Download,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import QuickAddModal from "./quick-add-modal";

export default function QuickActions() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const actions = [
    { id: "quotation", title: "+ New Quotation", icon: FilePlus, primary: true },
    { id: "order", title: "+ New Sales Order", icon: ShoppingBag, primary: true },
    { id: "invoice", title: "+ Create Invoice", icon: Receipt, primary: true },
    { id: "payment", title: "Receive Payment", icon: CircleDollarSign, accent: "emerald" },
    { id: "print", title: "Print Invoice", icon: Printer, accent: "slate" },
    { id: "export", title: "Export Report", icon: Download, accent: "slate" },
  ];

  const handleActionClick = (act) => {
    if (act.id === "quotation" || act.id === "order" || act.id === "invoice" || act.id === "payment") {
      setIsQuickAddOpen(true);
    } else if (act.id === "print") {
      toast.success("Printing invoice batch queue...");
    } else if (act.id === "export") {
      toast.success("Exporting sales summary report to CSV & PDF...");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Zap size={15} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Quick Actions
          </span>
        </div>

        {/* Compact Action Buttons Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {actions.map((act) => {
            const Icon = act.icon;
            const isPrimary = act.primary;

            return (
              <button
                key={act.id}
                onClick={() => handleActionClick(act)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  isPrimary
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800 shadow-2xs"
                    : act.accent === "emerald"
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800 shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700"
                }`}
              >
                <Icon size={14} />
                <span>{act.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </>
  );
}
