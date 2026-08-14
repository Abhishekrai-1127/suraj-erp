"use client";

import React from "react";
import {
  FilePlus,
  CircleDollarSign,
  Printer,
  Download,
  Clock,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function SalesDrawerContent({ customerData }) {
  const customer = customerData || {
    name: "Acme Corp Ltd",
    type: "Manufacturing & Dist.",
    initial: "A",
    balance: "₹42,120.00",
    overdueDays: 12,
  };

  const handleQuickAction = (actionName) => {
    toast.success(`${actionName} triggered`, {
      description: `Action applied for ${customer.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. ACTIVE CUSTOMER CONTEXT */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Active Customer Context
        </span>
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-md shadow-blue-600/30">
            {customer.initial}
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {customer.name}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {customer.type}
            </span>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickAction("Create Invoice")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center shadow-2xs group"
          >
            <FilePlus size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Create Invoice</span>
          </button>

          <button
            onClick={() => handleQuickAction("Receive Payment")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center shadow-2xs group"
          >
            <CircleDollarSign size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Receive Payment</span>
          </button>

          <button
            onClick={() => handleQuickAction("Print Document")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center shadow-2xs group"
          >
            <Printer size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Print</span>
          </button>

          <button
            onClick={() => handleQuickAction("Download PDF")}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center shadow-2xs group"
          >
            <Download size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Download PDF</span>
          </button>
        </div>
      </div>

      {/* 3. OUTSTANDING BALANCE CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-5 shadow-lg border border-slate-800 space-y-3">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400">Outstanding Balance</span>
          <div className="text-3xl font-black tracking-tight">{customer.balance}</div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold">
          <Clock size={13} />
          <span>Overdue by {customer.overdueDays} days</span>
        </div>
      </div>

      {/* 4. RECENT QUOTATIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Recent Quotations
          </span>
          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">QT-2024-118</div>
              <div className="text-[11px] text-slate-400 font-medium">15 May, 2024</div>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white">₹4,200.00</div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">QT-2024-105</div>
              <div className="text-[11px] text-slate-400 font-medium">10 May, 2024</div>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white">₹12,800.00</div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ORDERS */}
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Recent Orders
        </span>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">SO-2024-992</div>
              <div className="text-[11px] text-slate-400 font-medium">Ready for dispatch</div>
            </div>
          </div>

          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
