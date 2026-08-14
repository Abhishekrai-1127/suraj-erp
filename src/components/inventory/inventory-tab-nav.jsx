"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InventoryTabNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: "/inventory" },
    { label: "Products", href: "/inventory/products" },
    { label: "Categories", href: "/inventory/categories" },
    { label: "Warehouses", href: "/inventory/warehouses" },
    { label: "Stock Movement", href: "/inventory/movement" },
    { label: "Transfers", href: "/inventory/transfers" },
    { label: "Low Stock", href: "/inventory/low-stock", badge: "12" },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto custom-scrollbar shrink-0">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/inventory" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold transition-all relative whitespace-nowrap ${
              isActive
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-extrabold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white leading-none">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
