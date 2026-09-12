"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().slice(0, 4);
      const items = docs.map((doc, idx) => {
        let icon = FileText;
        let iconBg = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
        let title = `Invoice #${doc.refNo} Created`;

        if (doc.type === "order") {
          icon = CheckCircle2;
          iconBg = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
          title = `Order #${doc.refNo} Processed`;
        } else if (doc.type === "quotation") {
          icon = ShoppingBag;
          iconBg = "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
          title = `Quotation #${doc.refNo} Generated`;
        } else if (doc.type === "payment") {
          icon = CreditCard;
          iconBg = "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
          title = `Payment Recorded`;
        }

        return {
          id: doc.refNo || idx,
          title,
          subtitle: `${doc.refNo} • ${doc.amount} • ${doc.customer}`,
          time: doc.date || "Recent",
          icon,
          iconBg,
        };
      });

      setActivities(items);
    };

    loadData();
    window.addEventListener("erp_document_created", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("erp_document_created", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recent Activity
          </h3>
          <p className="text-xs font-medium text-slate-400">
            Real-time audit log of sales transactions
          </p>
        </div>

        <Link
          href="/sales/invoices"
          className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Concise 4-Item Audit Stream */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {activities.length > 0 ? (
          activities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${act.iconBg}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 truncate">
                      {act.subtitle}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {act.time}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            No recent sales transactions recorded.
          </div>
        )}
      </div>
    </div>
  );
}
