"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { getStoredSalesTarget, getStoredDocuments, getDeletedDocumentIds } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";

export default function ProfitMargin() {
  const [stats, setStats] = useState({ target: 0, currentRevenue: 0, percent: 0, diff: 0 });

  useEffect(() => {
    const loadData = () => {
      const target = getStoredSalesTarget();
      const docs = getStoredDocuments();
      const deletedIds = getDeletedDocumentIds();
      const validDocs = docs.filter((d) => !deletedIds.includes(d.id || d.refNo));

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let currentMonthRevenue = 0;
      validDocs.forEach((d) => {
        if (d.type === "invoice" || d.type === "order") {
          if ((d.status || "").toLowerCase() !== "cancelled") {
            const docDate = d.date ? new Date(d.date) : null;
            if (docDate && !isNaN(docDate.getTime())) {
              if (docDate.getFullYear() === currentYear && docDate.getMonth() === currentMonth) {
                currentMonthRevenue += parseAmount(d.amount || d.numericAmount);
              }
            } else {
              currentMonthRevenue += parseAmount(d.amount || d.numericAmount);
            }
          }
        }
      });

      const percent = target > 0 ? Math.min(100, Math.round((currentMonthRevenue / target) * 100)) : 0;
      const diff = target - currentMonthRevenue;

      setStats({ target, currentRevenue: currentMonthRevenue, percent, diff });
    };

    loadData();
    window.addEventListener("erp_document_created", loadData);
    window.addEventListener("erp_sales_target_updated", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("erp_document_created", loadData);
      window.removeEventListener("erp_sales_target_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  return (
    <Card className="flex flex-col h-[230px] justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
        Sales Target Progress
      </span>

      {/* Progress & Target Section */}
      <div className="flex flex-col items-center justify-center flex-1 py-1">
        <CircularProgress percentage={stats.percent} size={110} strokeWidth={9}>
          <span suppressHydrationWarning className="text-xl font-extrabold text-slate-800 dark:text-white leading-none">
            {stats.percent}%
          </span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-1 block">
            TARGET
          </span>
        </CircularProgress>
      </div>

      {/* Footer Text */}
      <p suppressHydrationWarning className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed">
        {stats.target === 0 ? (
          <span>No monthly sales target set</span>
        ) : stats.diff > 0 ? (
          <>
            You are{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formatCurrency(stats.diff, 0)} away
            </span>{" "}
            from monthly target
          </>
        ) : (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Monthly target achieved!
          </span>
        )}
      </p>
    </Card>
  );
}
