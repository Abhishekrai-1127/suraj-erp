"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ShieldAlert, CheckCircle2, Bell, FileText } from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const computeAlerts = () => {
      const docs = getStoredDocuments();
      const generatedAlerts = [];

      const overdueInvoices = docs.filter(
        (d) => d.type === "invoice" && (d.isOverdue || (d.status || "").toLowerCase().includes("overdue"))
      );
      if (overdueInvoices.length > 0) {
        generatedAlerts.push({
          id: "overdue-invoices",
          level: "Critical",
          title: `${overdueInvoices.length} overdue invoice(s) require payment follow-up`,
          subtitle: overdueInvoices.map((i) => `${i.refNo} (${i.customer})`).join(", "),
          badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
          icon: ShieldAlert,
          iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
          actionLabel: "View Invoices",
          href: "/sales/invoices",
        });
      }

      const pendingOrders = docs.filter(
        (d) => d.type === "order" && (d.status || "").toLowerCase().includes("process")
      );
      if (pendingOrders.length > 0) {
        generatedAlerts.push({
          id: "pending-orders",
          level: "Notice",
          title: `${pendingOrders.length} sales order(s) currently in process`,
          subtitle: pendingOrders.map((o) => `${o.refNo} (${o.customer})`).join(", "),
          badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
          icon: FileText,
          iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
          actionLabel: "View Orders",
          href: "/sales/orders",
        });
      }

      const draftQuotations = docs.filter(
        (d) => d.type === "quotation" && (d.status || "").toLowerCase().includes("draft")
      );
      if (draftQuotations.length > 0) {
        generatedAlerts.push({
          id: "draft-quotations",
          level: "Warning",
          title: `${draftQuotations.length} draft quotation(s) awaiting completion`,
          subtitle: draftQuotations.map((q) => `${q.refNo} (${q.customer})`).join(", "),
          badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
          icon: Clock,
          iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
          actionLabel: "Review Quotes",
          href: "/sales/quotations",
        });
      }

      setAlerts(generatedAlerts);
    };

    computeAlerts();
    window.addEventListener("erp_document_created", computeAlerts);
    window.addEventListener("storage", computeAlerts);
    return () => {
      window.removeEventListener("erp_document_created", computeAlerts);
      window.removeEventListener("storage", computeAlerts);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
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

        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100/80 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
          {alerts.length} Action Items
        </span>
      </div>

      {/* Alert Cards Stack */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {alerts.length > 0 ? (
          alerts.map((item) => {
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

                <Link
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition self-start sm:self-center shrink-0"
                >
                  {item.actionLabel}
                </Link>
              </div>
            );
          })
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 size={32} className="text-emerald-500 stroke-[2]" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              All Systems Nominal
            </span>
            <p className="text-[11px] text-slate-400 max-w-[280px]">
              No active operational bottlenecks, credit limits exceeded, or overdue accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

