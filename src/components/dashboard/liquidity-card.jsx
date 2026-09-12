"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, PiggyBank } from "lucide-react";
import { getStoredDocuments, getDeletedDocumentIds } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";

export default function LiquidityCard() {
  const [balances, setBalances] = useState({ cash: 0, bank: 0 });

  useEffect(() => {
    const loadBalances = () => {
      const docs = getStoredDocuments();
      const deletedIds = getDeletedDocumentIds();
      const validDocs = docs.filter((d) => !deletedIds.includes(d.id || d.refNo));

      let paidRevenue = 0;
      validDocs.forEach((d) => {
        if (d.type === "invoice") {
          const status = (d.status || "").toLowerCase();
          if (status === "paid" || status === "completed") {
            paidRevenue += parseAmount(d.amount || d.numericAmount);
          }
        }
      });

      // Split collected liquidity into bank balance (90%) and cash petty balance (10%)
      const bank = Math.round(paidRevenue * 0.9);
      const cash = Math.round(paidRevenue * 0.1);

      setBalances({ cash, bank });
    };

    loadBalances();
    window.addEventListener("erp_document_created", loadBalances);
    window.addEventListener("storage", loadBalances);
    return () => {
      window.removeEventListener("erp_document_created", loadBalances);
      window.removeEventListener("storage", loadBalances);
    };
  }, []);

  const liquidityItems = [
    {
      label: "Cash Balance",
      value: formatCurrency(balances.cash, 2),
      icon: PiggyBank,
      bgClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Bank Balance",
      value: formatCurrency(balances.bank, 2),
      icon: Landmark,
      bgClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <Card className="flex-1">
      <div className="flex flex-col space-y-4">
        {/* Card Header */}
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Total Liquidity
        </span>

        {/* Liquidity Items List */}
        <CardContent className="space-y-3 p-0">
          {liquidityItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition duration-150"
            >
              <div className="flex items-center gap-3.5">
                {/* Icon Circle */}
                <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${item.bgClass}`}>
                  <item.icon size={18} className="stroke-[2]" />
                </div>
                {/* Label */}
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {item.label}
                </span>
              </div>
              {/* Value */}
              <span suppressHydrationWarning className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </div>
    </Card>
  );
}
