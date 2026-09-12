"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  Download,
  Plus,
  ChevronDown,
  SlidersHorizontal,
  Info,
  Search,
  X,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import QuickAddModal from "./quick-add-modal";
import SalesTabNav from "./sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "./sales-drawer-content";
import SalesFilterDrawer from "./sales-filter-drawer";
import { useDebounce } from "@/hooks/use-debounce";
import { useCrmCustomers } from "@/hooks/use-crm-store";
import { getStoredCrmCustomers } from "@/lib/crm-storage";
import { getStoredCustomers } from "@/lib/erp-storage";

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
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounce the search input for customer/vendor suggestions
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch live CRM parties (Customers & Vendors) with local storage fallbacks
  const { data: crmParties = [] } = useCrmCustomers();

  const allParties = useMemo(() => {
    const list = Array.isArray(crmParties) && crmParties.length > 0
      ? crmParties
      : [...getStoredCrmCustomers(), ...getStoredCustomers()];

    const map = new Map();
    list.forEach((p) => {
      const key = (p.name || p.company || "").toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, {
          id: p.id || key,
          name: p.name || p.company,
          company: p.company || p.name,
          type: p.type === "Vendor" ? "Vendor" : "Customer",
          category: p.category || "General",
          gst: p.gst || "",
          email: p.email || "",
          phone: p.phone || "",
        });
      }
    });
    return Array.from(map.values());
  }, [crmParties]);

  // Filter matching customers and vendors based on debounced search input
  const partySuggestions = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const q = debouncedSearch.toLowerCase().trim();
    return allParties
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.company?.toLowerCase().includes(q) ||
          p.gst?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [allParties, debouncedSearch]);

  // Outside click listener to dismiss suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {/* 1. Context Search Bar with Debounced Customer & Vendor Suggestions */}
            <div ref={searchContainerRef} className="relative min-w-[240px] sm:min-w-[320px]">
              <form onSubmit={handleSearchSubmit}>
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onChange={(e) => {
                    if (onSearchChange) onSearchChange(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  placeholder="Search orders, invoices, customers, vendors..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 transition shadow-2xs"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSearchChange) onSearchChange("");
                      setIsSuggestionsOpen(false);
                    }}
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

              {/* Debounced Suggestions Dropdown for Customers & Vendors */}
              {isSuggestionsOpen && debouncedSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-40 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 custom-scrollbar animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Customers & Vendors</span>
                    <span className="text-blue-500 font-bold">{partySuggestions.length} found</span>
                  </div>

                  {partySuggestions.length > 0 ? (
                    partySuggestions.map((party) => (
                      <div
                        key={party.id}
                        onClick={() => {
                          if (onSearchChange) onSearchChange(party.name);
                          setIsSuggestionsOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                              party.type === "Vendor"
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {party.type === "Vendor" ? <Building2 size={13} /> : <User size={13} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {party.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {party.company !== party.name ? party.company : party.category}
                              {party.gst ? ` • GST: ${party.gst}` : ""}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                            party.type === "Vendor"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {party.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-slate-400 text-center font-medium">
                      No matching customer or vendor found
                    </div>
                  )}
                </div>
              )}
            </div>

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
