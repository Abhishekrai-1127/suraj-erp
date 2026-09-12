"use client";

import React, { useState } from "react";
import { Filter, RotateCcw, Check, Calendar, Tag, DollarSign, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SalesFilterDrawer({ initialFilters, onApplyFilters, onClose }) {
  const [dateRange, setDateRange] = useState(initialFilters?.dateRange || "this-month");
  const [selectedStatus, setSelectedStatus] = useState(initialFilters?.selectedStatus || ["all"]);
  const [selectedRegion, setSelectedRegion] = useState(initialFilters?.selectedRegion || "all");
  const [minAmount, setMinAmount] = useState(initialFilters?.minAmount || "");
  const [maxAmount, setMaxAmount] = useState(initialFilters?.maxAmount || "");

  const handleStatusToggle = (status) => {
    if (status === "all") {
      setSelectedStatus(["all"]);
      return;
    }
    let newStatus = selectedStatus.filter((s) => s !== "all");
    if (newStatus.includes(status)) {
      newStatus = newStatus.filter((s) => s !== status);
    } else {
      newStatus.push(status);
    }
    if (newStatus.length === 0) newStatus = ["all"];
    setSelectedStatus(newStatus);
  };

  const handleReset = () => {
    setDateRange("this-month");
    setSelectedStatus(["all"]);
    setSelectedRegion("all");
    setMinAmount("");
    setMaxAmount("");
    if (onApplyFilters) {
      onApplyFilters(null);
    }
    toast.info("Filters reset to default");
  };

  const handleApply = () => {
    const filterState = {
      dateRange,
      selectedStatus,
      selectedRegion,
      minAmount,
      maxAmount,
    };
    if (onApplyFilters) {
      onApplyFilters(filterState);
    }
    if (onClose) {
      onClose();
    }
    toast.success("Sales filters applied", {
      description: `Filtering active results by region: ${selectedRegion.toUpperCase()}, period: ${dateRange}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
          <Filter size={15} className="text-blue-600 dark:text-blue-400" />
          <span>Active Filter Configuration</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
        >
          <RotateCcw size={13} />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Date Range Filter */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <Calendar size={14} className="text-slate-400" />
          <span>Time Horizon</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "today", label: "Today" },
            { id: "this-week", label: "This Week" },
            { id: "this-month", label: "This Month" },
            { id: "this-quarter", label: "This Quarter" },
            { id: "ytd", label: "Year to Date" },
            { id: "custom", label: "Custom Range" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition text-left border ${
                dateRange === item.id
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400"
                  : "bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Document / Order Status */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <Tag size={14} className="text-slate-400" />
          <span>Lifecycle Status</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Statuses" },
            { id: "quotation", label: "Quotation Pending" },
            { id: "approved", label: "Approved" },
            { id: "in-process", label: "In Process" },
            { id: "overdue", label: "Overdue Invoices" },
            { id: "completed", label: "Completed" },
          ].map((status) => {
            const isSelected = selectedStatus.includes(status.id);
            return (
              <button
                key={status.id}
                onClick={() => handleStatusToggle(status.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {isSelected && <Check size={13} className="stroke-[3]" />}
                <span>{status.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sales Region */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <Globe size={14} className="text-slate-400" />
          <span>Geographic Region</span>
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Global (All Regions)</option>
          <option value="na">North America</option>
          <option value="emea">Europe, Middle East & Africa (EMEA)</option>
          <option value="apac">Asia-Pacific (APAC)</option>
          <option value="latam">Latin America</option>
        </select>
      </div>


      {/* 5. Transaction Value Range */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          <DollarSign size={14} className="text-slate-400" />
          <span>Transaction Amount Range</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min ($)"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max ($)"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <button
          onClick={handleApply}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 transition active:scale-95 text-center"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
