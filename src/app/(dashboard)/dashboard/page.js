"use client";

import React from "react";
import StatCard from "@/components/dashboard/stat-card";
import SalesAnalytics from "@/components/dashboard/sales-analytics";
import LiquidityCard from "@/components/dashboard/liquidity-card";
import ProfitMargin from "@/components/dashboard/profit-margin";
import RecentOrders from "@/components/dashboard/recent-orders";
import LowStockAlert from "@/components/dashboard/low-stock-alert";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import { Banknote, Receipt, ShoppingBag, Wallet } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      {/* Header Title Section */}
      <div className="flex flex-col space-y-1 select-none">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-2xl">
          Dashboard Overview
        </h1>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Welcome back, Suraj Enterprises. Here's today's business overview.
        </p>
      </div>

      {/* Row 1: Stat Cards — data arrays = last 6 days of real values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value="₹4,82,900"
          badgeText="+12.5%"
          badgeVariant="orange"
          icon={Banknote}
          iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
          data={[310000, 275000, 390000, 428000, 362000, 482900]}
          barColor="#2563eb"
        />
        <StatCard
          title="Today's Expenses"
          value="₹1,24,050"
          badgeText="-3.2%"
          badgeVariant="red"
          icon={Receipt}
          iconBgClass="bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
          data={[98000, 142000, 115000, 160000, 128000, 124050]}
          barColor="#ef4444"
        />
        <StatCard
          title="Pending Orders"
          value="158"
          badgeText="24 New"
          badgeVariant="purple"
          icon={ShoppingBag}
          iconBgClass="bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
          data={[112, 134, 98, 145, 121, 158]}
          barColor="#94a3b8"
        />
        <StatCard
          title="Outstanding"
          value="₹12,45,000"
          badgeText="High Priority"
          badgeVariant="brown"
          icon={Wallet}
          iconBgClass="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
          data={[980000, 1050000, 890000, 1120000, 1380000, 1245000]}
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
