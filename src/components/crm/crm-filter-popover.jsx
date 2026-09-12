"use client";

import React, { useEffect, useRef } from "react";
import { Filter, FilterX, X, Check } from "lucide-react";

export function CrmFilterPopover({
  isOpen,
  onClose,
  currentTab,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sourceFilter,
  onSourceFilterChange,
  valueRangeFilter,
  onValueRangeFilterChange,
  onClearAll,
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPartiesTab = currentTab === "Customers & Vendors" || currentTab === "Customers" || currentTab === "Vendors";
  const isLeadsTab = currentTab === "Leads";
  const isDealsTab = currentTab.startsWith("Deals");

  const activeFiltersCount = [
    typeFilter !== "All" ? 1 : 0,
    statusFilter !== "All" ? 1 : 0,
    categoryFilter !== "All" ? 1 : 0,
    sourceFilter !== "All" ? 1 : 0,
    valueRangeFilter !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1b1d26] border border-slate-200 dark:border-slate-800 shadow-2xl z-40 p-4 space-y-4 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Menu Box Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-blue-600 dark:text-blue-400" />
          <span className="font-extrabold text-slate-900 dark:text-white text-xs">Filter Options</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <X size={15} />
        </button>
      </div>

      {/* Menu Box Vertical Filter Controls */}
      <div className="space-y-3.5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        
        {/* 1. Party Type (For Customers & Vendors) */}
        {isPartiesTab && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Party Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "All", label: "All" },
                { id: "Customer", label: "Customer" },
                { id: "Vendor", label: "Vendor" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTypeFilterChange(t.id)}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                    typeFilter === t.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {typeFilter === t.id && <Check size={12} />}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Status & Pipeline Stage */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            {isLeadsTab || isDealsTab ? "Pipeline Stage" : "Account Status"}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Statuses & Stages</option>
            {isPartiesTab && (
              <>
                <option value="Active">Active Accounts</option>
                <option value="Inactive">Inactive Accounts</option>
                <option value="Archived">Archived Accounts</option>
              </>
            )}
            {(isLeadsTab || isDealsTab) && (
              <>
                <option value="New">New Prospect</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified Lead</option>
                <option value="Proposal">Proposal / Quote</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Closed Won</option>
                <option value="Lost">Closed Lost</option>
              </>
            )}
          </select>
        </div>

        {/* 3. Industry / Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Industry / Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Industries</option>
            <option value="Logistics">Logistics & Freight</option>
            <option value="Construction & Infra">Construction & Infra</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Raw Material Supplier">Raw Material Supplier</option>
            <option value="Consulting">Consulting Services</option>
            <option value="Tech Hardware">Tech & Hardware</option>
          </select>
        </div>

        {/* 5. Lead Source (Leads) */}
        {isLeadsTab && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Lead Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="All">All Sources</option>
              <option value="Direct Outreach">Direct Outreach</option>
              <option value="Inbound Web Inquiry">Inbound Web Inquiry</option>
              <option value="Trade Show Expo">Trade Show Expo</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
            </select>
          </div>
        )}

        {/* 6. Valuation Range */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Valuation Range
          </label>
          <select
            value={valueRangeFilter}
            onChange={(e) => onValueRangeFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Amounts</option>
            <option value="under_1lakh">Under ₹1,00,000</option>
            <option value="1lakh_5lakh">₹1,00,000 - ₹5,00,000</option>
            <option value="above_5lakh">Above ₹5,00,000</option>
          </select>
        </div>
      </div>

      {/* Menu Box Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
        >
          <FilterX size={13} />
          <span>Reset All</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
