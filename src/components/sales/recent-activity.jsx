"use client";

import React from "react";
import { FileText, CheckCircle2, ShoppingBag, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      title: "Invoice #INV-2023-4422 Created",
      subtitle: "INV-2023-4422 • ₹28,900.00 • Global Ent.",
      time: "10 mins ago",
      icon: FileText,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      id: 2,
      title: "Sales Order #SO-2023-0892 Approved",
      subtitle: "SO-2023-0892 • ₹8,500.00 • Lumina Mktg",
      time: "24 mins ago",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      id: 3,
      title: "Quotation #QT-2023-1004 Sent",
      subtitle: "QT-2023-1004 • ₹14,200.00 • Apex Corp",
      time: "1 hour ago",
      icon: ShoppingBag,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      id: 4,
      title: "Payment Received",
      subtitle: "Rec #4410 • ₹12,450.00 • Blue Note Café",
      time: "2 hours ago",
      icon: CreditCard,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
  ];

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

        <button
          onClick={() => toast.info("Opening complete Activity Audit Log...")}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Concise 4-Item Audit Stream */}
      <div className="space-y-3 flex-1">
        {activities.map((act) => {
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
        })}
      </div>
    </div>
  );
}
