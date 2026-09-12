"use client";

import React from "react";
import { Filter, FilterX, Users2, Target, Briefcase, ChevronRight, X } from "lucide-react";

export function CrmVerticalFilters({
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
  onCloseMobile,
}) {
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
    <div className="w-full lg:w-64 min-w-[250px] bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-5 text-xs font-semibold shrink-0">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
          <Filter size={16} className="text-blue-600 dark:text-blue-400" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black">
              {activeFiltersCount} Active
            </span>
          )}
        </div>

        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Vertical Filter Groups Stack */}
      <div className="space-y-5">
        
        {/* 1. Party Type (For Customers & Vendors) */}
        {isPartiesTab && (
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Party Type
            </label>
            <div className="flex flex-col space-y-1 bg-white dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {[
                { id: "All", label: "All Business Parties" },
                { id: "Customer", label: "Customers Only" },
                { id: "Vendor", label: "Vendors Only" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTypeFilterChange(t.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition ${
                    typeFilter === t.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{t.label}</span>
                  {typeFilter === t.id && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Status & Pipeline Stage */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            {isLeadsTab || isDealsTab ? "Pipeline Stage" : "Account Status"}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
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
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Industry / Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
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

        {/* 5. Lead Source (Only for Leads) */}
        {isLeadsTab && (
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Lead Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => onSourceFilterChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
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

        {/* 6. Value / Receivables Range */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Valuation Range
          </label>
          <select
            value={valueRangeFilter}
            onChange={(e) => onValueRangeFilterChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="All">All Values</option>
            <option value="under_1lakh">Under ₹1,00,000</option>
            <option value="1lakh_5lakh">₹1,00,000 - ₹5,00,000</option>
            <option value="above_5lakh">Above ₹5,00,000</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Action */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition active:scale-95 border border-rose-200/60 dark:border-rose-900/40"
        >
          <FilterX size={15} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
}
