"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", Sales: 170000, Purchases: 95000 },
  { name: "Feb", Sales: 260000, Purchases: 155000 },
  { name: "Mar", Sales: 220000, Purchases: 180000 },
  { name: "Apr", Sales: 360000, Purchases: 120000 },
  { name: "May", Sales: 310000, Purchases: 110000 },
  { name: "Jun", Sales: 482900, Purchases: 224000 },
];

export default function SalesAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom tooltips matching theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-3 rounded-xl shadow-lg">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p
                key={index}
                className="text-[11px] font-medium"
                style={{ color: entry.color }}
              >
                {entry.name}: ₹{entry.value.toLocaleString("en-IN")}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full justify-between">
      <CardHeader className="flex flex-row items-start justify-between mb-1">
        <div className="flex flex-col">
          <CardTitle>Sales Analytics</CardTitle>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Comparison between Monthly Sales & Purchases
          </span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition duration-150 font-medium">
          Last 6 Months
          <ChevronDown size={14} />
        </button>
      </CardHeader>

      <CardContent className="flex-1 w-full mt-1 min-h-[260px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              barGap={5}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#855e42" stopOpacity={1} />
                  <stop offset="100%" stopColor="#a16207" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800/50"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--foreground-secondary)", fontSize: 11, fontWeight: 550 }}
              />
              <YAxis
                width={55}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
                tick={{ fill: "var(--foreground-secondary)", fontSize: 11, fontWeight: 550 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "currentColor", className: "text-slate-500/5 dark:text-slate-400/5" }}
              />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingTop: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--foreground-secondary)",
                }}
              />
              <Bar
                name="Sales"
                dataKey="Sales"
                fill="url(#salesGrad)"
                radius={[4, 4, 0, 0]}
                barSize={8}
              />
              <Bar
                name="Purchases"
                dataKey="Purchases"
                fill="url(#purchaseGrad)"
                radius={[4, 4, 0, 0]}
                barSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Skeleton Loader */
          <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/10 rounded-xl animate-pulse">
            <span className="text-xs text-slate-400 font-medium">Loading sales data...</span>
          </div>
        )}
      </CardContent>

      {/* Bottom KPI Bar to fill space and match right column */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center select-none">
        <div className="flex flex-col px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">H1 Total Revenue</span>
          <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5">₹18,02,900</span>
        </div>
        <div className="flex flex-col border-x border-slate-100 dark:border-slate-800/80 px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">H1 Purchases</span>
          <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5">₹8,84,000</span>
        </div>
        <div className="flex flex-col px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Profit Margin</span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+51.0%</span>
        </div>
      </div>
    </Card>
  );
}
