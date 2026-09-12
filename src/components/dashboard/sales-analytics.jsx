"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { getStoredDocuments, getDeletedDocumentIds } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";

// Custom tooltips matching theme
function CustomTooltip({ active, payload, label }) {
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
              {entry.name}: {formatCurrency(entry.value, 0)}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function SalesAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    const loadDocs = () => {
      const docs = getStoredDocuments();
      const deletedIds = getDeletedDocumentIds();
      setDocuments(docs.filter((d) => !deletedIds.includes(d.id || d.refNo)));
    };
    loadDocs();
    window.addEventListener("erp_document_created", loadDocs);
    window.addEventListener("storage", loadDocs);
    return () => {
      window.removeEventListener("erp_document_created", loadDocs);
      window.removeEventListener("storage", loadDocs);
    };
  }, []);

  // Generate dynamic 6-month series from real documents
  const { chartData, totalRevenue, totalPurchases, profitMargin } = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        Sales: 0,
        Purchases: 0,
      });
    }

    let revSum = 0;
    let purchSum = 0;

    documents.forEach((doc) => {
      const docDate = doc.date ? new Date(doc.date) : null;
      const amt = parseAmount(doc.amount || doc.grandTotal || doc.numericAmount);

      if (doc.type === "invoice" || doc.type === "order") {
        if ((doc.status || "").toLowerCase() !== "cancelled") {
          revSum += amt;
          if (docDate && !isNaN(docDate.getTime())) {
            const targetMonth = months.find(
              (m) => m.year === docDate.getFullYear() && m.monthIndex === docDate.getMonth()
            );
            if (targetMonth) {
              targetMonth.Sales += amt;
            }
          } else {
            // Assign to current active month if undated
            if (months[months.length - 1]) {
              months[months.length - 1].Sales += amt;
            }
          }
        }
      } else if (doc.type === "purchase_bill" || doc.type === "purchased_machinery") {
        purchSum += amt;
        if (docDate && !isNaN(docDate.getTime())) {
          const targetMonth = months.find(
            (m) => m.year === docDate.getFullYear() && m.monthIndex === docDate.getMonth()
          );
          if (targetMonth) {
            targetMonth.Purchases += amt;
          }
        } else {
          if (months[months.length - 1]) {
            months[months.length - 1].Purchases += amt;
          }
        }
      }
    });

    const margin = revSum > 0 ? (((revSum - purchSum) / revSum) * 100).toFixed(1) : "0.0";

    return {
      chartData: months,
      totalRevenue: revSum,
      totalPurchases: purchSum,
      profitMargin: margin,
    };
  }, [documents]);

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
              data={chartData}
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
                tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
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

      {/* Bottom KPI Bar dynamically calculated from real documents */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center select-none">
        <div className="flex flex-col px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Revenue</span>
          <span suppressHydrationWarning className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
            {formatCurrency(totalRevenue, 0)}
          </span>
        </div>
        <div className="flex flex-col border-x border-slate-100 dark:border-slate-800/80 px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Purchases</span>
          <span suppressHydrationWarning className="text-xs font-black text-slate-800 dark:text-white mt-0.5">
            {formatCurrency(totalPurchases, 0)}
          </span>
        </div>
        <div className="flex flex-col px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Margin</span>
          <span suppressHydrationWarning className={`text-xs font-black mt-0.5 ${Number(profitMargin) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {Number(profitMargin) >= 0 ? `+${profitMargin}%` : `${profitMargin}%`}
          </span>
        </div>
      </div>
    </Card>
  );
}
