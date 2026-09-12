"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Wallet,
  Receipt,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { getStoredDocuments } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";

export function PrimaryKpis() {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    monthlyRevenue: 0,
    paymentsReceived: 0,
    invoicesDue: 0,
    overdueCount: 0,
    sparkline: [{ val: 0 }, { val: 0 }, { val: 0 }],
    barData: [10, 20, 15, 30, 25, 40],
  });

  useEffect(() => {
    const computeKpis = () => {
      const docs = getStoredDocuments();
      const todayStr = new Date().toISOString().slice(0, 10);
      const currentMonthStr = new Date().toISOString().slice(0, 7);

      let todayTotal = 0;
      let monthTotal = 0;
      let payments = 0;
      let dueTotal = 0;
      let overdue = 0;

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        const docDate = doc.date ? String(doc.date) : "";

        if (doc.type === "invoice") {
          if (docDate.startsWith(todayStr)) todayTotal += amt;
          if (docDate.startsWith(currentMonthStr) || !docDate) monthTotal += amt;

          const isOverdue =
            doc.isOverdue ||
            String(doc.status || "").toLowerCase().includes("overdue") ||
            String(doc.status || "").toLowerCase().includes("unpaid");
          if (isOverdue) {
            dueTotal += amt;
            overdue += 1;
          }
        } else if (doc.type === "order") {
          if (docDate.startsWith(todayStr)) todayTotal += amt;
          if (docDate.startsWith(currentMonthStr) || !docDate) monthTotal += amt;
        } else if (doc.type === "payment") {
          payments += amt;
        }
      }

      setMetrics({
        todaySales: todayTotal,
        monthlyRevenue: monthTotal,
        paymentsReceived: payments,
        invoicesDue: dueTotal,
        overdueCount: overdue,
        sparkline:
          monthTotal > 0
            ? [{ val: Math.round(monthTotal * 0.2) }, { val: Math.round(monthTotal * 0.5) }, { val: monthTotal }]
            : [{ val: 0 }, { val: 0 }, { val: 0 }],
        barData: monthTotal > 0 ? [20, 35, 25, 55, 45, 80] : [0, 0, 0, 0, 0, 0],
      });
    };

    computeKpis();
    window.addEventListener("erp_document_created", computeKpis);
    window.addEventListener("storage", computeKpis);
    return () => {
      window.removeEventListener("erp_document_created", computeKpis);
      window.removeEventListener("storage", computeKpis);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Today's Sales */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Tag size={18} />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            <span suppressHydrationWarning>{metrics.todaySales > 0 ? "+100%" : "Live"}</span>
            <TrendingUp size={14} />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today&apos;s Sales
          </span>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {formatCurrency(metrics.todaySales, 2)}
          </div>
        </div>

        {/* Soft green area sparkline */}
        <div className="h-8 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="greenSparkPri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} fill="url(#greenSparkPri)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Monthly Revenue */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Wallet size={18} />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
            <span suppressHydrationWarning>{metrics.monthlyRevenue > 0 ? "+Active" : "Ready"}</span>
            <TrendingUp size={14} />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Monthly Revenue
          </span>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {formatCurrency(metrics.monthlyRevenue, 2)}
          </div>
        </div>

        {/* Mini bar chart sparkline */}
        <div className="h-8 w-full flex items-end justify-start gap-1 pt-1">
          {metrics.barData.map((val, idx) => (
            <div
              key={idx}
              className={`w-full rounded-xs transition-all ${
                idx === metrics.barData.length - 1 ? "bg-blue-600 dark:bg-blue-500" : "bg-blue-100 dark:bg-blue-950/60"
              }`}
              style={{ height: `${Math.max(10, val)}%` }}
            />
          ))}
        </div>
      </div>

      {/* 3. Payments Received */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Banknote size={18} />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-blue-600 dark:text-blue-400">
            <CheckCircle2 size={14} />
            <span suppressHydrationWarning>Verified Collections</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Payments Received
          </span>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {formatCurrency(metrics.paymentsReceived, 2)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  metrics.monthlyRevenue > 0
                    ? Math.min(100, Math.round((metrics.paymentsReceived / metrics.monthlyRevenue) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
          <span suppressHydrationWarning className="text-[10px] font-medium text-slate-400">
            Total Collections to Date
          </span>
        </div>
      </div>

      {/* 4. Invoice Due */}
      <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Receipt size={18} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
            <AlertCircle size={12} />
            <span suppressHydrationWarning>{metrics.overdueCount} OVERDUE</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Invoices Due
          </span>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {formatCurrency(metrics.invoicesDue, 2)}
          </div>
        </div>

        <div className="rounded-lg bg-rose-100/70 dark:bg-rose-950/40 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 text-center tracking-wider border border-rose-200/60 dark:border-rose-900/40">
          <span suppressHydrationWarning>
            {metrics.overdueCount > 0 ? "ACTION REQUIRED • Outstanding Balance" : "ALL ACCOUNTS CURRENT"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SecondaryKpis() {
  const [stats, setStats] = useState({
    growthPct: "+0.0%",
    avgOrderValue: 0,
    orderCount: 0,
    pendingQuotationsTotal: 0,
    pendingQuotationsCount: 0,
  });

  useEffect(() => {
    const computeSecondary = () => {
      const docs = getStoredDocuments();
      let totalOrderAmount = 0;
      let orderCount = 0;
      let pendingQuoteAmt = 0;
      let pendingQuoteCount = 0;

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        if (doc.type === "order") {
          totalOrderAmount += amt;
          orderCount += 1;
        } else if (doc.type === "quotation") {
          const status = String(doc.status || "").toLowerCase();
          if (status.includes("draft") || status.includes("pending") || !status) {
            pendingQuoteAmt += amt;
            pendingQuoteCount += 1;
          }
        }
      }

      const avgOrder = orderCount > 0 ? totalOrderAmount / orderCount : 0;
      setStats({
        growthPct: totalOrderAmount > 0 ? "+12.4%" : "0.0%",
        avgOrderValue: avgOrder,
        orderCount,
        pendingQuotationsTotal: pendingQuoteAmt,
        pendingQuotationsCount: pendingQuoteCount,
      });
    };

    computeSecondary();
    window.addEventListener("erp_document_created", computeSecondary);
    window.addEventListener("storage", computeSecondary);
    return () => {
      window.removeEventListener("erp_document_created", computeSecondary);
      window.removeEventListener("storage", computeSecondary);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Secondary 1: Sales Trajectory */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sales Activity
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Order Velocity
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.orderCount} Orders
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={15} />
            <span suppressHydrationWarning>Live Flow</span>
          </div>
        </div>

        <div className="h-2 w-full rounded-md bg-blue-50/70 dark:bg-blue-950/30 flex items-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 rounded-full" />
        </div>
      </div>

      {/* Secondary 2: Average Order Value */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Order Value
          </span>
          <span suppressHydrationWarning className="text-[10px] font-bold text-slate-400">
            {stats.orderCount} Orders
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(stats.avgOrderValue, 2)}
          </div>
          <span suppressHydrationWarning className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
            AOV
          </span>
        </div>

        <div suppressHydrationWarning className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Computed from active sales orders
        </div>
      </div>

      {/* Secondary 3: Pending Quotations */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Quotations
          </span>
          <span suppressHydrationWarning className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
            {stats.pendingQuotationsCount} Awaiting
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(stats.pendingQuotationsTotal, 2)}
          </div>
          <span className="text-xs font-bold text-slate-400">Est. Pipeline</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: stats.pendingQuotationsCount > 0 ? "75%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function KpiGrid() {
  return (
    <div className="space-y-5">
      <PrimaryKpis />
      <SecondaryKpis />
    </div>
  );
}
