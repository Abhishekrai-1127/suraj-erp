"use client";

import React, { useState } from "react";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import PurchaseAddModal from "@/components/purchase/purchase-add-modal";
import { Filter, Plus, MoreVertical, FileText } from "lucide-react";
import { toast } from "sonner";

const billsData = [
  {
    id: "BILL-2024-001",
    vendor: "Tech Hub Solutions",
    billDate: "Oct 12, 2023",
    dueDate: "Oct 26, 2023",
    amount: "₹4,250.60",
    balance: "₹0.00",
    status: "PAID",
  },
  {
    id: "BILL-2024-002",
    vendor: "NexGen Materials",
    billDate: "Oct 14, 2023",
    dueDate: "Oct 28, 2023",
    amount: "₹12,800.00",
    balance: "₹10,800.00",
    status: "OVERDUE",
  },
  {
    id: "BILL-2024-003",
    vendor: "Global Freight Co.",
    billDate: "Oct 18, 2023",
    dueDate: "Nov 01, 2023",
    amount: "₹850.40",
    balance: "₹425.20",
    status: "PARTIAL",
  },
  {
    id: "BILL-2024-004",
    vendor: "Skylight Agencies",
    billDate: "Oct 20, 2023",
    dueDate: "Nov 10, 2023",
    amount: "₹3,100.00",
    balance: "₹3,100.00",
    status: "UNPAID",
  },
];

export default function PurchaseBillsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleRowClick = (bill) => {
    setSelectedVendor({
      name: bill.vendor,
      type: "Material Supplier",
      initial: bill.vendor.charAt(0),
      balance: bill.balance !== "₹0.00" ? bill.balance : "₹10,800.00",
      overdueDays: bill.status === "OVERDUE" ? 14 : 0,
    });
    setIsDrawerOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            PAID
          </span>
        );
      case "OVERDUE":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            OVERDUE
          </span>
        );
      case "PARTIAL":
      case "PARTIALLY PAID":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            PARTIAL
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="space-y-1 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Purchase Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Purchase Bills
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            Track and process vendor invoices, raw item bills, and payment terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      <PurchaseTabNav />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL BILLS</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{billsData.length}</div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1">Live active bills</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">UNPAID BILLS</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {billsData.filter(b => b.status === "UNPAID" || b.status === "OVERDUE").length}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">Action required priority</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">PAID BILLS</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {billsData.filter(b => b.status === "PAID").length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL VENDORS</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {new Set(billsData.map(b => b.vendor)).size}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">Active firm partnerships</span>
        </div>
      </div>

      {/* Bills Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">BILL NO.</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">BILL DATE</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {billsData.length > 0 ? (
                billsData.map((row) => (
                  <tr
                    key={row.refNo || row.id}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">{row.refNo || row.id}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{row.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.billDate || "Today"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.dueDate || "N/A"}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">{row.amount}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRowClick(row)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                    No purchase bills found. Click "Create Bill" above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Vendor & Bill Details">
        <SalesDrawerContent customerData={selectedVendor} />
      </Drawer>

      <PurchaseAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} initialTab="bill" />
    </div>
  );
}
