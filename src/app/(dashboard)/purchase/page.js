"use client";

import React, { useState } from "react";
import PurchaseHeader from "@/components/purchase/purchase-header";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import {
  FileText,
  Truck,
  AlertTriangle,
  Banknote,
  Search,
  Filter,
  Lightbulb,
  Bell,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { usePurchaseRecords, useDeletePurchaseRecord } from "@/hooks/use-purchase-store";

export default function PurchaseOverviewPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data: purchaseRecords = [], isLoading } = usePurchaseRecords();
  const deleteRecordMutation = useDeletePurchaseRecord();

  const handleRowClick = (row) => {
    setSelectedVendor({
      name: row.vendor,
      type: "Industrial Supplier",
      initial: row.initials || (row.vendor || "V").charAt(0),
      balance: row.amount || row.cost || "₹0.00",
      overdueDays: (row.status || "").includes("UNPAID") ? 5 : 0,
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteRecord = (e, row) => {
    e.stopPropagation();
    const idToDelete = row.id || row.refNo || row.assetTag;
    deleteRecordMutation.mutate(idToDelete, {
      onSuccess: () => {
        toast.success(`Record ${row.refNo || row.assetTag || row.id} deleted successfully!`);
      },
      onError: (err) => {
        toast.error(`Failed to delete record: ${err?.message}`);
      },
    });
  };

  const getPaymentStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "PAID":
      case "APPROVED":
      case "OPERATIONAL":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            {s}
          </span>
        );
      case "PARTIAL":
      case "PARTIALLY PAID":
      case "UNDER MAINTENANCE":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {s}
          </span>
        );
      case "UNPAID":
      case "PENDING APPROVAL":
      case "CALIBRATION DUE":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            {s}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status || "DRAFT"}
          </span>
        );
    }
  };

  // Dynamic KPI counts
  const activeRfosCount = purchaseRecords.filter((r) => r.type === "rfo").length;
  const purchaseBillsCount = purchaseRecords.filter((r) => r.type === "purchase_bill").length;
  const pendingCount = purchaseRecords.filter(
    (r) => (r.status || "").includes("UNPAID") || (r.status || "").includes("PENDING")
  ).length;

  const filteredRecords = purchaseRecords.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (r.refNo || "").toLowerCase().includes(q) ||
      (r.assetTag || "").toLowerCase().includes(q) ||
      (r.vendor || "").toLowerCase().includes(q) ||
      (r.department || "").toLowerCase().includes(q) ||
      (r.name || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" || (r.status || "").toUpperCase() === statusFilter.toUpperCase();

    const matchesType =
      typeFilter === "ALL" || (r.type || "").toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingBill = purchaseRecords.find(
    (r) => r.type === "purchase_bill" && (r.status === "UNPAID" || r.status === "OVERDUE")
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <PurchaseHeader
        title="Purchase Overview"
        subtitle="High-level operational summary of vendor RFOs, purchase bills, and procurement performance."
      />

      {/* Sub Tab Navigation */}
      <PurchaseTabNav />

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Active RFOs</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{activeRfosCount}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Truck size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Purchase Bills</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{purchaseBillsCount}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Pending Action</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Banknote size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Total Records</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{purchaseRecords.length}</div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">SEARCH</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ref number, vendor, item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">RECORD TYPE</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Records</option>
              <option value="purchase_bill">Purchase Bills</option>
              <option value="rfo">RFOs (Requisitions)</option>
              <option value="purchased_machinery">Purchased Machinery</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">RECORD ID</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">RECORD DATE</th>
                <th className="py-3 px-4">DUE / TARGET</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    Loading purchase records...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((row) => (
                  <tr
                    key={row.refNo || row.assetTag || row.id}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">
                      {row.refNo || row.assetTag || row.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {row.type?.replace("_", " ") || "Purchase"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black">
                          {row.initials || (row.vendor || "V").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold">{row.vendor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.billDate || row.requestDate || row.purchaseDate || "Today"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.dueDate || row.targetDeliveryDate || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">
                      {row.amount || row.cost || (row.numericCost ? `₹${row.numericCost.toLocaleString("en-IN")}` : "₹0.00")}
                    </td>
                    <td className="py-3.5 px-4">{getPaymentStatusBadge(row.status || "UNPAID")}</td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteRecord(e, row)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    No purchase records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          <span>
            {filteredRecords.length > 0
              ? `Showing ${filteredRecords.length} of ${purchaseRecords.length} records`
              : "No records to display"}
          </span>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
            <Lightbulb size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Procurement Optimization</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {activeRfosCount > 0
                ? `${activeRfosCount} active RFOs awaiting vendor quotation and internal approval. Review them in the RFO tab.`
                : "All purchase requisitions are up to date."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Action Required</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {pendingBill
                ? `Bill ${pendingBill.refNo || pendingBill.id} (${pendingBill.vendor}) requires payment clearance.`
                : "All vendor accounts and bills are fully settled with zero payment escalations."}
            </p>
          </div>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Vendor & Purchase Overview">
        <SalesDrawerContent customerData={selectedVendor} />
      </Drawer>
    </div>
  );
}
