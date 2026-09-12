"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, MessageSquare, ExternalLink, Filter, X, Search, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { getStoredDocuments } from "@/lib/erp-storage";
import EditDocumentModal from "@/components/sales/edit-document-modal";

const initialTransactions = [];

export default function RecentTransactions({
  searchQuery = "",
  selectedPeriod = "This Month",
  activeStage = "ALL",
  appliedFilters = null,
  onClearFilters,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [openRowMenu, setOpenRowMenu] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [storedDocs, setStoredDocs] = useState([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setStoredDocs(getStoredDocuments());
    const handleUpdate = () => {
      setStoredDocs(getStoredDocuments());
    };
    window.addEventListener("erp_document_created", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("erp_document_created", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const allTransactions = [...storedDocs, ...initialTransactions];

  // Dynamic filtering engine
  const filteredData = allTransactions.filter((item) => {
    // 1. Type Filter Pill ("All", "Orders", "Invoices")
    if (activeFilter === "Orders" && item.type !== "order") return false;
    if (activeFilter === "Invoices" && item.type !== "invoice") return false;

    // 2. Search Query filter (matches RefNo, Customer Name, Category, Status)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.refNo.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 3. Active Pipeline Stage Filter
    if (activeStage && activeStage !== "ALL") {
      const stageMap = {
        LEAD: ["LEAD", "DRAFT"],
        QUOTATION: ["QUOTATION", "PENDING APPROVAL"],
        APPROVED: ["APPROVED", "COMPLETED"],
        "SALES ORDER": ["order", "IN PROGRESS"],
        PRODUCTION: ["PRODUCTION"],
        READY: ["READY"],
        DISPATCHED: ["DISPATCHED", "COMPLETED"],
      };

      const validStatuses = stageMap[activeStage] || [activeStage];
      const match = validStatuses.some(
        (s) =>
          item.status.toUpperCase().includes(s.toUpperCase()) ||
          item.type.toUpperCase().includes(s.toUpperCase())
      );
      if (!match) return false;
    }

    // 4. Drawer Filter State
    if (appliedFilters) {
      if (
        appliedFilters.selectedStatus &&
        appliedFilters.selectedStatus.length > 0 &&
        !appliedFilters.selectedStatus.includes("all")
      ) {
        const matchesStatus = appliedFilters.selectedStatus.some((st) =>
          item.status.toLowerCase().includes(st.toLowerCase())
        );
        if (!matchesStatus) return false;
      }

      if (appliedFilters.minAmount && item.numericAmount < Number(appliedFilters.minAmount)) {
        return false;
      }
      if (appliedFilters.maxAmount && item.numericAmount > Number(appliedFilters.maxAmount)) {
        return false;
      }
    }

    return true;
  });

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    activeStage !== "ALL" ||
    (appliedFilters &&
      ((appliedFilters.selectedStatus?.length > 0 && !appliedFilters.selectedStatus.includes("all")) ||
        appliedFilters.minAmount ||
        appliedFilters.maxAmount ||
        appliedFilters.selectedRegion !== "all" ||
        appliedFilters.selectedRep !== "all"));

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            COMPLETED
          </span>
        );
      case "IN PROGRESS":
      case "PRODUCTION":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            {status}
          </span>
        );
      case "PENDING APPROVAL":
      case "QUOTATION":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {status}
          </span>
        );
      case "OVERDUE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-rose-100/70 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            OVERDUE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
      {/* Table Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {filteredData.length} of {initialTransactions.length} records
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
          {["All", "Orders", "Invoices"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === filter
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {isFilteringActive && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs font-bold text-slate-700 dark:text-slate-300 flex-wrap">
          <Filter size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Active Filters:</span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          {activeStage !== "ALL" && (
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Stage: {activeStage}
            </span>
          )}
          {appliedFilters?.selectedRegion && appliedFilters.selectedRegion !== "all" && (
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              Region: {appliedFilters.selectedRegion.toUpperCase()}
            </span>
          )}
          <button
            onClick={() => onClearFilters && onClearFilters()}
            className="ml-auto text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <X size={13} />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        {filteredData.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">REF NO.</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
              {filteredData.map((row, index) => (
                <tr
                  key={row.refNo}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* REF NO. */}
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-bold">
                    {row.refNo}
                  </td>

                  {/* CUSTOMER */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">
                        {row.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-bold">{row.customer}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{row.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {row.date}
                  </td>

                  {/* AMOUNT */}
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-extrabold">
                    {row.amount}
                  </td>

                  {/* STATUS */}
                  <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>

                  {/* ACTIONS */}
                  <td className="py-3.5 px-4 text-right relative">
                    <button
                      onClick={() => setOpenRowMenu(openRowMenu === index ? null : index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openRowMenu === index && (
                      <div className="absolute right-4 mt-1 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-20 text-left">
                        <button
                          onClick={() => {
                            toast.info(`Viewing details for ${row.refNo}`);
                            setOpenRowMenu(null);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setEditingDoc(row);
                            setOpenRowMenu(null);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800"
                        >
                          <Edit3 size={13} />
                          <span>Edit Record</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Search className="mx-auto text-slate-300 dark:text-slate-600" size={32} />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No transactions match your active filters
            </div>
            <p className="text-xs text-slate-400">
              Try adjusting your search keywords, period filter, or active drawer configuration.
            </p>
            <button
              onClick={() => onClearFilters && onClearFilters()}
              className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          onClick={() => toast.info("Opening all sales transactions database...")}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          <span>View All Transactions</span>
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Floating Assistant / Support Bubble */}
      <button
        onClick={() => toast.info("Sales AI Assistant active. Ask anything about your sales pipeline!")}
        className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
        title="Sales AI Assistant"
      >
        <MessageSquare size={24} className="fill-white/20" />
      </button>

      <EditDocumentModal
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        document={editingDoc}
      />
    </div>
  );
}
