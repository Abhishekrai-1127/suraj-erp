"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Package, CheckCircle2 } from "lucide-react";
import { getStoredInventoryProducts } from "@/hooks/use-inventory-store";

export default function LowStockAlert() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const checkStock = () => {
      const products = getStoredInventoryProducts();
      const lowStockItems = products
        .filter((p) => {
          const stock = Number(p.stock) || 0;
          const minStock = Number(p.minStock || p.reorderPoint || 10);
          return stock <= minStock || (p.status || "").toLowerCase().includes("low");
        })
        .slice(0, 3)
        .map((p) => {
          const val = Number(p.stock) || 0;
          const maxVal = Number(p.minStock || p.reorderPoint || 10) * 2;
          return {
            name: p.name,
            leftAmount: `${val} ${p.unit || "units"}`,
            reqAmount: `${p.minStock || p.reorderPoint || 10} ${p.unit || "units"}`,
            value: val,
            max: maxVal || 100,
            icon: Package,
            iconBg: "bg-red-50 text-red-500 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-900/30",
            progressBarColor: "bg-red-500 dark:bg-red-600",
            subtextStyle: "text-red-500 dark:text-red-400",
          };
        });

      setAlerts(lowStockItems);
    };

    checkStock();
    window.addEventListener("storage", checkStock);
    return () => window.removeEventListener("storage", checkStock);
  }, []);

  return (
    <Card className="flex flex-col h-[380px] justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
        Low Stock Alert
      </span>

      {/* Alert Items */}
      <CardContent className="space-y-4 p-0 flex-1 flex flex-col justify-center">
        {alerts.length > 0 ? (
          alerts.map((item, index) => (
            <div
              key={index}
              className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 dark:bg-slate-800/10 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 mb-3">
                {/* Icon */}
                <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${item.iconBg}`}>
                  <item.icon size={16} className="stroke-[2.2]" />
                </div>

                {/* Names and Limits */}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    <span className={`font-bold ${item.subtextStyle}`}>{item.leftAmount} left</span>
                    <span className="mx-1.5 text-slate-300 dark:text-slate-700">•</span>
                    Reorder: {item.reqAmount}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                value={item.value}
                max={item.max}
                color={item.progressBarColor}
                className="mt-2 h-1.5"
              />
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 size={32} className="text-emerald-500 stroke-[2]" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Optimal Stock Levels
            </span>
            <p className="text-[11px] text-slate-400 max-w-[200px]">
              No inventory items currently require immediate reordering.
            </p>
          </div>
        )}
      </CardContent>

      {/* CTAs */}
      <Link
        href="/purchase/rfo"
        className="w-full text-center bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 mt-4 active:scale-[0.99] block"
      >
        Procure Raw Materials
      </Link>
    </Card>
  );
}
