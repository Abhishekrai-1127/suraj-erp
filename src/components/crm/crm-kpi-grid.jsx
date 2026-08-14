"use client";

import React from "react";
import { Users2, Target, DollarSign, Wallet } from "lucide-react";

export function CrmKpiGrid({ customerCount, leadCount, totalPipelineValue, totalOutstanding }) {
  const cards = [
    {
      title: "Total Accounts",
      value: customerCount || 0,
      subtext: "Active Customers & Vendors",
      icon: Users2,
      color: "blue",
    },
    {
      title: "Active Leads & Opportunities",
      value: leadCount || 0,
      subtext: "In active sales pipeline",
      icon: Target,
      color: "emerald",
    },
    {
      title: "Pipeline Deal Value",
      value: `₹${(totalPipelineValue || 0).toLocaleString("en-IN")}`,
      subtext: "Total estimated value",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: "Total Outstanding Balance",
      value: `₹${(totalOutstanding || 0).toLocaleString("en-IN")}`,
      subtext: "Receivables from accounts",
      icon: Wallet,
      color: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex items-center justify-between transition hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                {card.subtext}
              </span>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold shrink-0">
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
