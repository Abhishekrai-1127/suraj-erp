"use client";

import React from "react";
import { AlertTriangle, Clock, Truck, ShieldAlert, CheckCircle2, ArrowUpRight, Bell } from "lucide-react";
import { toast } from "sonner";

export default function AlertsPanel() {
  const alerts = [
    {
      id: "credit-limit",
      level: "Critical",
      title: "2 customers exceeded credit limit",
      subtitle: "Apex Corp Solutions & Lumina Marketing (₹42,120 outstanding)",
      badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
      icon: ShieldAlert,
      iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
      actionLabel: "Review Credit",
      action: () => toast.error("Opening Credit Assessment dashboard for Apex Corp & Lumina"),
    },
    {
      id: "delayed-deliveries",
      level: "Warning",
      title: "3 delayed deliveries",
      subtitle: "Shipments DC-2023-0891, DC-2023-0885 delayed in transit",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
      icon: Truck,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      actionLabel: "Track Shipping",
      action: () => toast.warning("Tracking delayed dispatch shipments via logistics carrier API"),
    },
    {
      id: "expiring-quotations",
      level: "Notice",
      title: "5 quotations expire today",
      subtitle: "₹38,500.00 total estimated deal volume awaiting client signature",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
      icon: Clock,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      actionLabel: "Follow Up",
      action: () => toast.info("Opening 5 expiring quotations to send automated reminders"),
    },
    {
      id: "payment-received",
      level: "Information",
      title: "Payment of ₹12,450.00 received",
      subtitle: "Wire transfer processed for Blue Note Café (Inv #INV-2023-4410)",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      actionLabel: "View Receipt",
      action: () => toast.success("Opening payment receipt #4410 details"),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <Bell size={17} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Needs Attention
            </h3>
            <p className="text-xs font-medium text-slate-400">
              Operational alerts categorized by severity
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
          {alerts.length} Action Items
        </span>
      </div>

      {/* Alert Cards Stack */}
      <div className="space-y-3 flex-1">
        {alerts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition gap-3"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon size={18} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${item.badgeColor}`}>
                      {item.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={item.action}
                className="self-end sm:self-center shrink-0 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-3 py-1.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/70 transition"
              >
                <span>{item.actionLabel}</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
