"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SalesTabNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/sales" },
    { name: "Quotations", href: "/sales/quotations" },
    { name: "Sales Orders", href: "/sales/orders" },
    { name: "Invoices", href: "/sales/invoices" },
    { name: "Delivery Challans", href: "/sales/delivery-challans" },
    { name: "Payments", href: "/sales/payments" },
    { name: "Returns", href: "/sales/returns" },
    { name: "Analytics", href: "/sales/analytics" },
  ];

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar select-none bg-white dark:bg-slate-900 rounded-2xl px-4 shadow-2xs">
      <nav className="flex items-center gap-6 min-w-max">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/sales"
              ? pathname === "/sales"
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
    </div>
  );
}
