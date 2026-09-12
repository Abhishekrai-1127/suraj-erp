"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  FilterX,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  ShoppingBag,
  Users2,
  Target,
  Briefcase,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { CrmFilterPopover } from "./crm-filter-popover";
import {
  useCrmCustomers,
  useCrmLeads,
  useCrmDeals,
  useDeleteCustomerMutation,
  useDeleteLeadMutation,
  useDeleteDealMutation,
} from "@/hooks/use-crm-store";

export function CustomersTable({
  activeTab = "Customers & Vendors",
  onTabChange,
  onSelectRecord,
  onEditRecord,
  onConvertLead,
}) {
  // Deals & Opportunities tab commented out per requirement
  const tabs = ["Customers & Vendors", "Leads"/*, "Deals / Opportunities"*/];

  const [currentTab, setCurrentTab] = useState(activeTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters State
  const [typeFilter, setTypeFilter] = useState("All"); // All, Customer, Vendor
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [valueRangeFilter, setValueRangeFilter] = useState("All");

  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeRowMenuId, setActiveRowMenuId] = useState(null);

  // TanStack Query Hooks & Mutations
  const { data: rawCustomers = [] } = useCrmCustomers();
  const { data: rawLeads = [] } = useCrmLeads();
  const { data: rawDeals = [] } = useCrmDeals();

  const deleteCustomerMutation = useDeleteCustomerMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const deleteDealMutation = useDeleteDealMutation();

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentTab(activeTab);
  }, [activeTab]);

  let records = [];
  if (currentTab === "Customers & Vendors" || currentTab === "Customers" || currentTab === "Vendors") {
    records = Array.isArray(rawCustomers) ? rawCustomers : [];
  } else if (currentTab === "Leads") {
    records = Array.isArray(rawLeads) ? rawLeads : [];
  } else if (currentTab.startsWith("Deals")) {
    records = Array.isArray(rawDeals) ? rawDeals : [];
  }

  useEffect(() => {
    const handleClickOutside = () => setActiveRowMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    setSelectedIds([]);
    handleClearAllFilters();
    if (onTabChange) onTabChange(tab);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSourceFilter("All");
    setValueRangeFilter("All");
  };

  const activeFiltersCount = [
    typeFilter !== "All" ? 1 : 0,
    statusFilter !== "All" ? 1 : 0,
    categoryFilter !== "All" ? 1 : 0,
    sourceFilter !== "All" ? 1 : 0,
    valueRangeFilter !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Filtered List logic
  const filteredRecords = records.filter((item) => {
    if (currentTab === "Customers & Vendors" || currentTab === "Customers" || currentTab === "Vendors") {
      if (typeFilter === "Customer" && item.type === "Vendor") return false;
      if (typeFilter === "Vendor" && item.type !== "Vendor") return false;
    }

    if (statusFilter !== "All") {
      const st = item.status || item.stage || "Active";
      if (st !== statusFilter) return false;
    }

    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    if (sourceFilter !== "All" && item.source !== sourceFilter) return false;

    if (valueRangeFilter !== "All") {
      const numericVal =
        item.numericOutstanding ||
        item.numericValue ||
        parseFloat(String(item.value || item.estimatedValue || item.outstanding || 0).replace(/[^0-9.]/g, "")) ||
        0;
      if (valueRangeFilter === "under_1lakh" && numericVal >= 100000) return false;
      if (valueRangeFilter === "1lakh_5lakh" && (numericVal < 100000 || numericVal > 500000)) return false;
      if (valueRangeFilter === "above_5lakh" && numericVal <= 500000) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.gst && item.gst.toLowerCase().includes(q)) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.customer && item.customer.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteRecord = (record, e) => {
    e.stopPropagation();
    if (currentTab === "Leads") {
      deleteLeadMutation.mutate(record.id);
    } else if (currentTab.startsWith("Deals")) {
      deleteDealMutation.mutate(record.id);
    } else {
      deleteCustomerMutation.mutate(record.id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      if (currentTab === "Leads") {
        deleteLeadMutation.mutate(id);
      } else if (currentTab.startsWith("Deals")) {
        deleteDealMutation.mutate(id);
      } else {
        deleteCustomerMutation.mutate(id);
      }
    });
    setSelectedIds([]);
  };

  const isDealsTab = currentTab.startsWith("Deals");
  const isLeadsTab = currentTab === "Leads";
  const isPartiesTab = !isDealsTab && !isLeadsTab;

  return (
    <div className="flex flex-col w-full h-full flex-1 justify-between min-h-[580px]">
      {/* 3 Primary Section Tabs */}
      <div className="flex items-center px-6 pt-4 border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive =
            currentTab === tab ||
            (tab === "Customers & Vendors" && (currentTab === "Customers" || currentTab === "Vendors")) ||
            (tab.startsWith("Deals") && currentTab.startsWith("Deals"));
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`pb-3 text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-b-2 border-transparent"
              }`}
            >
              {tab === "Customers & Vendors" && <Users2 size={16} />}
              {tab === "Leads" && <Target size={16} />}
              {tab.startsWith("Deals") && <Briefcase size={16} />}
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Top Search Bar & Popover Menu Box Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-[#1f212a]/50 gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${currentTab.toLowerCase()} by name, company, GST, email...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          {/* Filter Popover Menu Box Container (Normal Dropdown Menu Box) */}
          <div className="relative">
            <button
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                activeFiltersCount > 0
                  ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
            >
              <Filter size={14} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400 text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Anchored Normal Filter Dropdown Menu Box */}
            <CrmFilterPopover
              isOpen={isFilterPopoverOpen}
              onClose={() => setIsFilterPopoverOpen(false)}
              currentTab={currentTab}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              valueRangeFilter={valueRangeFilter}
              onValueRangeFilterChange={setValueRangeFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {(searchQuery || activeFiltersCount > 0) && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
            >
              <FilterX size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-xs animate-in fade-in duration-100"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredRecords.length}</strong> of {records.length} records
          </span>
        </div>
      </div>

      {/* Main Full-Width Data Table with Extended Clearance & Smooth Scroll */}
      <div className="w-full flex-1 overflow-x-auto min-h-[380px] pb-28 custom-scrollbar">
        <table className="w-full min-w-[850px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#1b1d26] border-b border-slate-200 dark:border-slate-800/80">
              <th className="py-3.5 pl-6 pr-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredRecords.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                {isDealsTab ? "Deal Opportunity Title" : isLeadsTab ? "Lead Prospect Name" : "Contact / Party Name"}
              </th>
              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Company Account</th>

              {isPartiesTab && (
                <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Party Type</th>
              )}

              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                {isLeadsTab ? "Lead Source" : isDealsTab ? "Win Probability" : "GSTIN / Tax ID"}
              </th>
              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Phone / Contact</th>
              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                {isLeadsTab || isDealsTab ? "Est. Value (₹)" : "Outstanding (₹)"}
              </th>
              <th className="py-3.5 px-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Status / Stage</th>
              <th className="py-3.5 pr-6 pl-4 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((row, index) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectRecord && onSelectRecord(row)}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/30 cursor-pointer transition group"
                >
                  <td className="py-3.5 pl-6 pr-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-extrabold text-xs shrink-0">
                        {row.name ? row.name.charAt(0) : row.title ? row.title.charAt(0) : "C"}
                      </div>
                      <div>
                        <div className="text-slate-900 dark:text-white font-extrabold group-hover:text-blue-600 transition">
                          {row.title || row.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">{row.email || row.role || "B2B Account"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.company || row.customer || "N/A"}</td>

                  {isPartiesTab && (
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          row.type === "Vendor"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                        }`}
                      >
                        {row.type || "Customer"}
                      </span>
                    </td>
                  )}

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{row.source || row.probability || row.gst || "N/A"}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.phone || "N/A"}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                    {row.outstanding || row.estimatedValue || row.value || "₹0.00"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                        row.status === "Active" || row.stage === "Won"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : row.stage === "Proposal" || row.stage === "Qualified"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {row.status || row.stage || "Active"}
                    </span>
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRowMenuId(activeRowMenuId === row.id ? null : row.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeRowMenuId === row.id && (
                        <div
                          className={`absolute right-0 ${
                            filteredRecords.length > 2 && index >= filteredRecords.length - 2
                              ? "bottom-full mb-1.5"
                              : "top-full mt-1.5"
                          } w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-1.5 font-semibold text-xs animate-in fade-in zoom-in-95 duration-100`}
                        >
                          <button
                            onClick={() => {
                              setActiveRowMenuId(null);
                              if (onSelectRecord) onSelectRecord(row);
                            }}
                            className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                          >
                            <Eye size={14} className="text-blue-500" />
                            <span>View Details</span>
                          </button>

                          {(isLeadsTab || isPartiesTab) && onConvertLead && (
                            <button
                              onClick={() => {
                                setActiveRowMenuId(null);
                                onConvertLead(row);
                              }}
                              className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                            >
                              <ShoppingBag size={14} className="text-emerald-500" />
                              <span>Create Sales Order</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveRowMenuId(null);
                              if (onEditRecord) onEditRecord(row);
                            }}
                            className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition border-t border-slate-100 dark:border-slate-800"
                          >
                            <Edit3 size={14} className="text-blue-600" />
                            <span>Edit Record</span>
                          </button>

                          <button
                            onClick={(e) => {
                              setActiveRowMenuId(null);
                              handleDeleteRecord(row, e);
                            }}
                            className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition"
                          >
                            <Trash2 size={14} />
                            <span>Delete Record</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  No matching records found in {currentTab}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 mt-auto shrink-0">
        <span className="text-xs font-semibold text-slate-500">
          Showing <strong className="font-bold text-slate-900 dark:text-white">{filteredRecords.length}</strong> records in {currentTab}
        </span>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 transition">
            <ChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold">1</button>
          <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-700 transition">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
