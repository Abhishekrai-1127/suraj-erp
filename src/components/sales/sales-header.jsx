"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  Plus,
  ChevronDown,
  SlidersHorizontal,
  Info,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import QuickAddModal from "./quick-add-modal";
import SalesTabNav from "./sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "./sales-drawer-content";
import SalesFilterDrawer from "./sales-filter-drawer";

export default function SalesHeader({
  searchQuery = "",
  onSearchChange,
  selectedPeriod = "This Month",
  onPeriodChange,
  appliedFilters,
  onApplyFilters,
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");

  const periods = ["Today", "This Week", "This Month", "This Quarter", "This Year"];

  const handleExport = () => {
    toast.success("Sales Report exported successfully!", {
      description: "PDF and CSV summaries have been downloaded.",
    });
  };

  const openDrawer = (pos) => {
    setDrawerPosition(pos);
    setIsDrawerOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching sales records for "${searchQuery}"...`);
    }
  };

  const activeFiltersCount =
    (appliedFilters?.selectedStatus?.length > 0 && !appliedFilters.selectedStatus.includes("all") ? 1 : 0) +
    (appliedFilters?.selectedRegion && appliedFilters.selectedRegion !== "all" ? 1 : 0) +
    (appliedFilters?.selectedRep && appliedFilters.selectedRep !== "all" ? 1 : 0) +
    (appliedFilters?.minAmount ? 1 : 0) +
    (appliedFilters?.maxAmount ? 1 : 0);

  return (
    <>
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          {/* Left Side: Title & Subtitle */}
          <div className="space-y-1 select-none">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Sales</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sales Management
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              Manage quotations, sales orders, invoices, deliveries, payments and customer sales lifecycle with precision and real-time insights.
            </p>
          </div>

          {/* Right Side Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 1. Context Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] sm:min-w-[280px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search quotations, sales orders, invoices..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 transition shadow-2xs"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded pointer-events-none">
                  ⌘K
                </span>
              )}
            </form>

            {/* 2. Filters Drawer Trigger ("Filters") */}
            <button
              onClick={() => openDrawer("left")}
              title="Open Filters & Controls Panel"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition active:scale-95 shadow-2xs ${
                activeFiltersCount > 0
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* 3. Details Drawer Trigger ("Details") */}
            <button
              onClick={() => openDrawer("right")}
              title="Open Sales Details Panel"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95"
            >
              <Info size={15} className="text-slate-500 dark:text-slate-400" />
              <span>Details</span>
            </button>

            {/* 4. Date Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition"
              >
                <Calendar size={15} className="text-slate-500 dark:text-slate-400" />
                <span>{selectedPeriod}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isPeriodMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        onPeriodChange && onPeriodChange(period);
                        setIsPeriodMenuOpen(false);
                        toast.info(`Filtered data by ${period}`);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition ${
                        selectedPeriod === period
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Export Report Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95"
            >
              <Download size={15} className="text-slate-500 dark:text-slate-400" />
              <span>Export</span>
            </button>

            {/* 6. Quick Add Button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 shrink-0"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Universal Sales Tab Navigation */}
        <SalesTabNav />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Universal Side Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position={drawerPosition}
        title={drawerPosition === "left" ? "Filters & Controls" : "Sales Overview Details"}
        size="md"
      >
        {drawerPosition === "left" ? (
          <SalesFilterDrawer
            initialFilters={appliedFilters}
            onApplyFilters={onApplyFilters}
            onClose={() => setIsDrawerOpen(false)}
          />
        ) : (
          <SalesDrawerContent />
        )}
      </Drawer>
    </>
  );
}
