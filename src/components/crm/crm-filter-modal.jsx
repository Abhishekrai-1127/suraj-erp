"use client";

import React from "react";
import { Filter, FilterX, X, ChevronRight, Check } from "lucide-react";

export function CrmFilterModal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1b1d26] w-full max-w-md sm:max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amazon-style Popup Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Filter size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Filter {currentTab}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Refine records by type, stage, & industry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Popup Vertical Filter Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-xs font-semibold">
          
          {/* 1. Party Type (For Customers & Vendors) */}
          {isPartiesTab && (
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Party Type Filter
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "All", label: "All Parties" },
                  { id: "Customer", label: "Customers" },
                  { id: "Vendor", label: "Vendors" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTypeFilterChange(t.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      typeFilter === t.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    {typeFilter === t.id && <Check size={13} />}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Status & Pipeline Stage */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {isLeadsTab || isDealsTab ? "Pipeline Stage" : "Account Status"}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Industry / Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Lead Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => onSourceFilterChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Valuation Range
            </label>
            <select
              value={valueRangeFilter}
              onChange={(e) => onValueRangeFilterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Amounts</option>
              <option value="under_1lakh">Under ₹1,00,000</option>
              <option value="1lakh_5lakh">₹1,00,000 - ₹5,00,000</option>
              <option value="above_5lakh">Above ₹5,00,000</option>
            </select>
          </div>
        </div>

        {/* Popup Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <FilterX size={14} />
            <span>Reset All Filters</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-sm"
          >
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
