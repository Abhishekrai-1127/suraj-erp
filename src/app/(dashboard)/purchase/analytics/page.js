"use client";

import React, { useState } from "react";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import { Download, TrendingUp, ShieldCheck, Clock, PiggyBank, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const monthlySpendData = [
  { month: "Jan", Spend: 280000, Budget: 300000 },
  { month: "Feb", Spend: 340000, Budget: 320000 },
  { month: "Mar", Spend: 310000, Budget: 310000 },
  { month: "Apr", Spend: 420000, Budget: 380000 },
  { month: "May", Spend: 390000, Budget: 400000 },
  { month: "Jun", Spend: 480000, Budget: 450000 },
];

const categoryDistribution = [
  { name: "Raw Materials", value: 48, color: "#2563eb" },
  { name: "Consumables", value: 25, color: "#0284c7" },
  { name: "Fixed Assets", value: 12, color: "#ea580c" },
];

const vendorConcentration = [
  { name: "SteelCorp Global", value: 42, color: "#2563eb" },
  { name: "Tech Logistics Inc.", value: 28, color: "#0284c7" },
  { name: "BuildMaster Co.", value: 18, color: "#b45309" },
  { name: "Others (12 vendors)", value: 12, color: "#cbd5e1" },
];

const vendorRankings = [
  { name: "SteelCorp Global", spend: "$1,850,000", leadTime: "5.2 Days", compliance: "98%", score: "A+", status: "PREFERRED" },
  { name: "Tech Logistics Inc.", spend: "$980,000", leadTime: "7.8 Days", compliance: "92%", score: "A", status: "ACTIVE" },
  { name: "BuildMaster Co.", spend: "$420,000", leadTime: "12.5 Days", compliance: "81%", score: "C-", status: "WATCHLIST" },
];

export default function PurchaseAnalyticsPage() {
  const [period, setPeriod] = useState("Monthly");

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Reports</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Purchase Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Advanced reporting on procurement spending, vendor performance, and category distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["Monthly", "Quarterly", "Yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  period === p ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => toast.success("Exporting Purchase Analytics PDF...")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            <Download size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <PurchaseTabNav />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL SPEND</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">$4,284,500</div>
            <span className="text-[11px] text-slate-400 font-medium">Compared to $3.8M last month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <PiggyBank size={20} />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Target 8%</span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">SAVINGS ACHIEVED</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">$312,000</div>
            <span className="text-[11px] text-slate-400 font-medium">7.4% average negotiation margin</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">-1.8 Days</span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AVG. LEAD TIME</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">8.4 Days</div>
            <span className="text-[11px] text-slate-400 font-medium">Optimized from 10.2 days</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">2 Alert</span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">COMPLIANCE RATE</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">94.2%</div>
            <span className="text-[11px] text-slate-400 font-medium">2 Contract violations this month</span>
          </div>
        </div>
      </div>

      {/* Row 2: Purchases vs Budget & Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Monthly Purchases vs Budget
              </h2>
              <p className="text-xs text-slate-400 font-medium">Real-time expenditure tracking against forecast</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold select-none">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Actual Spend</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Budgeted</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }} />
                <Area type="monotone" dataKey="Spend" stroke="#2563eb" strokeWidth={3} fill="#2563eb" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Category Donut */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Purchase Category
          </h2>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {categoryDistribution.map((entry, idx) => (
                    <Cell key={`cell-cat-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">54.2M</span>
              <span className="text-[10px] text-slate-400 font-bold">Total</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-extrabold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Products & Vendor Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Top Products by Value
          </h2>
          <div className="space-y-3">
            {[
              { name: "Industrial Lubricant XL", val: "$124k" },
              { name: "Heavy Duty Motor Controller", val: "$92k" },
              { name: "Safety Gear Bulk Pack", val: "$75k" },
              { name: "Precision Bearings", val: "$58k" },
            ].map((prod) => (
              <div key={prod.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{prod.name}</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{prod.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Concentration */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vendor Concentration
          </h2>
          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vendorConcentration} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {vendorConcentration.map((entry, idx) => (
                    <Cell key={`cell-vc-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-slate-900 dark:text-white">42%</span>
              <span className="text-[10px] text-slate-400 font-bold">Max Share</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Vendor Performance Ranking */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Vendor Performance Ranking
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">VENDOR NAME</th>
                <th className="py-3 px-4">TOTAL SPEND</th>
                <th className="py-3 px-4">LEAD TIME</th>
                <th className="py-3 px-4">COMPLIANCE</th>
                <th className="py-3 px-4">SCORE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {vendorRankings.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{row.name}</td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">{row.spend}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.leadTime}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.compliance}</td>
                  <td className="py-3.5 px-4 text-blue-600 font-extrabold">{row.score}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                        row.status === "PREFERRED"
                          ? "bg-blue-100 text-blue-700"
                          : row.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
