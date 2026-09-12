"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getStoredDocuments } from "@/lib/erp-storage";
import { parseAmount, formatCurrency } from "@/lib/formatters";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PerformanceTrend() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(() =>
    MONTH_NAMES.slice(0, 9).map((month) => ({
      month,
      Sales: 0,
      Collection: 0,
      Profit: 0,
    }))
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);

    const computeTrend = () => {
      const docs = getStoredDocuments();
      const currentYear = new Date().getFullYear();
      const monthlyMap = {};

      for (let i = 0; i < 9; i++) {
        monthlyMap[i] = { month: MONTH_NAMES[i], Sales: 0, Collection: 0, Profit: 0 };
      }

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        if (!amt) continue;

        let monthIndex = new Date().getMonth();
        if (doc.date) {
          const parsedDate = new Date(doc.date);
          if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() === currentYear) {
            monthIndex = parsedDate.getMonth();
          }
        }

        if (monthlyMap[monthIndex]) {
          if (doc.type === "order" || doc.type === "invoice") {
            monthlyMap[monthIndex].Sales += amt;
            // Est. Gross profit roughly 25% of sales
            monthlyMap[monthIndex].Profit += Math.round(amt * 0.25);
          }
          if (doc.type === "payment" || (doc.type === "invoice" && String(doc.status || "").toLowerCase().includes("paid"))) {
            monthlyMap[monthIndex].Collection += amt;
          }
        }
      }

      setData(Object.values(monthlyMap));
    };

    computeTrend();
    window.addEventListener("erp_document_created", computeTrend);
    window.addEventListener("storage", computeTrend);
    return () => {
      window.removeEventListener("erp_document_created", computeTrend);
      window.removeEventListener("storage", computeTrend);
    };
  }, []);

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
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                tickFormatter={(value) => (value === 0 ? "0" : `₹${value >= 1000 ? Math.round(value / 1000) + "k" : value}`)}
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
                formatter={(value) => [formatCurrency(value), ""]}
              />
              <Area
                type="monotone"
                dataKey="Sales"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesArea)"
              />
              <Area
                type="monotone"
                dataKey="Collection"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="Profit"
                stroke="#b45309"
                strokeWidth={2}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
            Loading performance trend...
          </div>
        )}
      </div>
    </div>
  );
}
