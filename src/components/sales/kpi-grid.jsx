"use client";

import React from "react";
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

const sparklineData = [
  { val: 12000 },
  { val: 15000 },
  { val: 14000 },
  { val: 18000 },
  { val: 21000 },
  { val: 24500 },
];

const miniBarData = [
  { val: 35 },
  { val: 50 },
  { val: 45 },
  { val: 75 },
  { val: 60 },
  { val: 90 },
];

export function PrimaryKpis() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Today's Sales */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Tag size={18} />
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
            <span>+12.4%</span>
            <TrendingUp size={14} />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Sales
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            ₹24,500.00
          </div>
        </div>

        {/* Soft green area sparkline */}
        <div className="h-8 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
            <span>+5.2%</span>
            <TrendingUp size={14} />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Monthly Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            ₹412,890.00
          </div>
        </div>

        {/* Mini bar chart sparkline */}
        <div className="h-8 w-full flex items-end justify-start gap-1 pt-1">
          {miniBarData.map((item, idx) => (
            <div
              key={idx}
              className={`w-full rounded-xs transition-all ${
                idx === miniBarData.length - 1 ? "bg-blue-600 dark:bg-blue-500" : "bg-blue-100 dark:bg-blue-950/60"
              }`}
              style={{ height: `${item.val}%` }}
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
            <span>88% Goal</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Payments Received
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            ₹325,100.00
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: "88%" }} />
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            Target: ₹370,000.00 this month
          </span>
        </div>
      </div>

      {/* 4. Invoice Due (Warning Style) */}
      <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:shadow-md h-full">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Receipt size={18} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40">
            <AlertCircle size={12} />
            <span>4 OVERDUE</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Invoices Due
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            ₹89,400.00
          </div>
        </div>

        <div className="rounded-lg bg-rose-100/70 dark:bg-rose-950/40 px-2.5 py-1 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 text-center tracking-wider border border-rose-200/60 dark:border-rose-900/40">
          ACTION REQUIRED • ₹45.2k High Risk
        </div>
      </div>
    </div>
  );
}

export function SecondaryKpis() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Secondary 1: Sales Growth % */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sales Growth %
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Annual Trajectory
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            +21.5%
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={15} />
            <span>+3.8% vs Q2</span>
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
          <span className="text-[10px] font-bold text-slate-400">vs ₹1,150 LY</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ₹1,420.50
          </div>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
            +₹270 (+23.5%)
          </span>
        </div>

        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Based on 289 completed customer orders
        </div>
      </div>

      {/* Secondary 3: Pending Quotations */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-3 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Quotations
          </span>
          <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
            24 Awaiting
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ₹156,000.00
          </div>
          <span className="text-xs font-bold text-slate-400">Est. Pipeline</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-amber-500 h-full rounded-full" style={{ width: "65%" }} />
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
