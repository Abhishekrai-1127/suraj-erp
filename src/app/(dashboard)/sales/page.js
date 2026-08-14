"use client";

import React, { useState } from "react";
import SalesHeader from "@/components/sales/sales-header";
import QuickActions from "@/components/sales/quick-actions";
import { PrimaryKpis, SecondaryKpis } from "@/components/sales/kpi-grid";
import PerformanceTrend from "@/components/sales/performance-trend";
import SalesTarget from "@/components/sales/sales-target";
import PipelineLifecycle from "@/components/sales/pipeline-lifecycle";
import AlertsPanel from "@/components/sales/alerts-panel";
import RecentActivity from "@/components/sales/recent-activity";
import RecentTransactions from "@/components/sales/recent-transactions";

export default function SalesPage() {
  // Unified Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [activeStage, setActiveStage] = useState("ALL");
  const [appliedFilters, setAppliedFilters] = useState(null);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPeriod("This Month");
    setActiveStage("ALL");
    setAppliedFilters(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header & Tab Navigation Section */}
      <SalesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        appliedFilters={appliedFilters}
        onApplyFilters={setAppliedFilters}
      />

      {/* 2. Compact Enterprise Quick Actions Toolbar */}
      <QuickActions />

      {/* 3. Primary KPI Metrics (4 Prominent Cards) */}
      <PrimaryKpis />

      {/* 4. High-Priority Performance Chart & Target Widget (Positioned Higher) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2">
          <PerformanceTrend />
        </div>
        <div className="lg:col-span-1">
          <SalesTarget />
        </div>
      </div>

      {/* 5. Actionable Sales Pipeline Lifecycle */}
      <PipelineLifecycle activeStage={activeStage} onStageSelect={setActiveStage} />

      {/* 6. Actionable Alerts & Audit Feed (Equal Row Height Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2">
          <AlertsPanel />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* 7. Secondary KPI Metrics */}
      <SecondaryKpis />

      {/* 8. Recent Transactions Database with Live Filtering */}
      <RecentTransactions
        searchQuery={searchQuery}
        selectedPeriod={selectedPeriod}
        activeStage={activeStage}
        appliedFilters={appliedFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Console Footer */}
      <div className="text-center pt-3 pb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Enterprise ERP - Global Sales Management Console. v2.4.1 Build 20231012
      </div>
    </div>
  );
}
