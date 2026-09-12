"use client";

import React, { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/stat-card";
import SalesAnalytics from "@/components/dashboard/sales-analytics";
import LiquidityCard from "@/components/dashboard/liquidity-card";
import ProfitMargin from "@/components/dashboard/profit-margin";
import RecentOrders from "@/components/dashboard/recent-orders";
import LowStockAlert from "@/components/dashboard/low-stock-alert";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import { Banknote, Receipt, ShoppingBag, Wallet } from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";
import { formatCurrency, parseAmount } from "@/lib/formatters";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayExpenses: 0,
    pendingOrdersCount: 0,
    outstandingBalance: 0,
  });

  useEffect(() => {
    const computeDashboardStats = () => {
      const docs = getStoredDocuments();
      const todayStr = new Date().toISOString().slice(0, 10);

      let revToday = 0;
      let expToday = 0;
      let pendingCount = 0;
      let outstanding = 0;

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        const docDate = doc.date ? String(doc.date) : "";
        const type = String(doc.type || "").toLowerCase();
        const status = String(doc.status || "").toLowerCase();

        if (type === "order" || type === "invoice") {
          if (docDate.startsWith(todayStr)) {
            revToday += amt;
          }
          if (type === "order" && (status.includes("process") || status.includes("pending") || !status)) {
            pendingCount++;
          }
          if (type === "invoice" && (status.includes("unpaid") || status.includes("overdue") || status.includes("pending"))) {
            outstanding += amt;
          }
        } else if (type === "purchase_bill" || type === "rfo") {
          if (docDate.startsWith(todayStr)) {
            expToday += amt;
          }
        }
      }

      setStats({
        todayRevenue: revToday,
        todayExpenses: expToday,
        pendingOrdersCount: pendingCount,
        outstandingBalance: outstanding,
      });
    };

    computeDashboardStats();
    window.addEventListener("erp_document_created", computeDashboardStats);
    window.addEventListener("storage", computeDashboardStats);
    return () => {
      window.removeEventListener("erp_document_created", computeDashboardStats);
      window.removeEventListener("storage", computeDashboardStats);
    };
  }, []);

  return (
    <>
      {/* Header Title Section */}
      <div className="flex flex-col space-y-1 select-none">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-2xl">
          Dashboard Overview
        </h1>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Welcome back, Suraj Enterprises. Here&apos;s today&apos;s business overview.
        </p>
      </div>

      {/* Row 1: Stat Cards — data arrays = last 6 days of real values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          badgeText={stats.todayRevenue > 0 ? "Active" : "Live"}
          badgeVariant="orange"
          icon={Banknote}
          iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
          data={stats.todayRevenue > 0 ? [10, 25, 40, 35, 60, 80] : [0, 0, 0, 0, 0, 0]}
          barColor="#2563eb"
        />
        <StatCard
          title="Today's Expenses"
          value={formatCurrency(stats.todayExpenses)}
          badgeText="Verified"
          badgeVariant="red"
          icon={Receipt}
          iconBgClass="bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
          data={stats.todayExpenses > 0 ? [15, 30, 20, 45, 35, 50] : [0, 0, 0, 0, 0, 0]}
          barColor="#ef4444"
        />
        <StatCard
          title="Pending Orders"
          value={String(stats.pendingOrdersCount)}
          badgeText={`${stats.pendingOrdersCount} Queue`}
          badgeVariant="purple"
          icon={ShoppingBag}
          iconBgClass="bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
          data={stats.pendingOrdersCount > 0 ? [20, 40, 30, 60, 50, 70] : [0, 0, 0, 0, 0, 0]}
          barColor="#94a3b8"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(stats.outstandingBalance)}
          badgeText={stats.outstandingBalance > 0 ? "Action Req" : "Settled"}
          badgeVariant="brown"
          icon={Wallet}
          iconBgClass="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
          data={stats.outstandingBalance > 0 ? [30, 45, 40, 65, 55, 80] : [0, 0, 0, 0, 0, 0]}
          barColor="#b45309"
        />
      </div>

      {/* Row 2: Sales Analytics & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Sales Chart (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col">
          <SalesAnalytics />
        </div>
        {/* Quick Stats (1/3 width) */}
        <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
          <LiquidityCard />
          <ProfitMargin />
        </div>
      </div>

      {/* Row 3: Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-6">
          <LowStockAlert />
        </div>
      </div>

      {/* Row 4: Extra Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <RecentActivities />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <QuickActions />
        </div>
      </div>
    </>
  );
}
