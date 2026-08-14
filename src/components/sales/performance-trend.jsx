"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const trendData = [
  { month: "Jan", Sales: 120000, Collection: 95000, Profit: 35000 },
  { month: "Feb", Sales: 190000, Collection: 140000, Profit: 52000 },
  { month: "Mar", Sales: 160000, Collection: 155000, Profit: 48000 },
  { month: "Apr", Sales: 260000, Collection: 210000, Profit: 78000 },
  { month: "May", Sales: 220000, Collection: 195000, Profit: 62000 },
  { month: "Jun", Sales: 310000, Collection: 260000, Profit: 95000 },
  { month: "Jul", Sales: 280000, Collection: 245000, Profit: 84000 },
  { month: "Aug", Sales: 390000, Collection: 320000, Profit: 115000 },
  { month: "Sep", Sales: 370000, Collection: 340000, Profit: 108000 },
];

export default function PerformanceTrend() {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5 h-full flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Performance Trend
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Comparative analysis of Sales vs Collection vs Profit
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <span>Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Collection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />
            <span>Profit</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value) => (value === 0 ? "0" : `${value / 1000}k`)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="Sales"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#salesArea)"
            />
            <Line
              type="monotone"
              dataKey="Collection"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Profit"
              stroke="#b45309"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
