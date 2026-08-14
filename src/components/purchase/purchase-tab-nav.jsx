"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Filter, Columns } from "lucide-react";

export default function PurchaseTabNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/purchase" },
    { name: "RFO", href: "/purchase/rfo" },
    { name: "Purchase Bills", href: "/purchase/bills" },
    { name: "Purchased Machinery", href: "/purchase/machinery" },
    { name: "Analytics", href: "/purchase/analytics" },
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar select-none bg-white dark:bg-slate-900 rounded-2xl px-4 shadow-2xs flex items-center justify-between gap-4">
      <nav className="flex items-center gap-6 min-w-max">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/purchase"
              ? pathname === "/purchase"
              : pathname?.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`py-3.5 px-1 text-xs font-extrabold transition-all relative border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>

      {/* Extra Action Pills */}
      <div className="hidden sm:flex items-center gap-2 py-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Filter size={13} />
          <span>Advanced Filters</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Columns size={13} />
          <span>Columns</span>
        </button>
      </div>
    </div>
  );
}
