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
  Calendar,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Bell,
} from "lucide-react";
import { toast } from "sonner";



import { usePurchaseRecords } from "@/hooks/use-purchase-store";

export default function PurchaseOverviewPage() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const { data: purchaseRecords = [], isLoading } = usePurchaseRecords();

  const handleRowClick = (row) => {
    setSelectedVendor({
      name: row.vendor,
      type: "Industrial Supplier",
      initial: row.initials || "VN",
      balance: row.amount,
      overdueDays: 5,
    });
    setIsDrawerOpen(true);
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            PAID
          </span>
        );
      case "PARTIAL":
      case "PARTIALLY PAID":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            PARTIAL
          </span>
        );
      case "UNPAID":
      case "PENDING APPROVAL":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            {status}
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Dynamic KPI counts
  const activeRfosCount = purchaseRecords.filter(r => r.type === "rfo").length;
  const purchaseBillsCount = purchaseRecords.filter(r => r.type === "purchase_bill").length;
  const overdueCount = purchaseRecords.filter(r => r.status === "UNPAID").length;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <PurchaseHeader title="Purchase Overview" subtitle="High-level operational summary of vendor RFOs, purchase bills, and procurement performance." />

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
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Unpaid / Pending</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{overdueCount}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">STATUS</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Statuses</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Pending Approval</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">VENDOR</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>Search Vendor...</option>
              <option>Haas Automation India</option>
              <option>Apex Industrial Solutions</option>
              <option>Trumpf India Ltd</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">DATE RANGE</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-slate-900 dark:text-white text-center"
              />
              <span className="text-slate-400">to</span>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-slate-900 dark:text-white text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">RECORD TYPE</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Records</option>
              <option>Purchase Bills</option>
              <option>RFOs</option>
              <option>Purchased Machinery</option>
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
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3 px-4">RECORD ID</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">RECORD DATE</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">PAYMENT STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {purchaseRecords.length > 0 ? (
                purchaseRecords.map((row) => (
                  <tr
                    key={row.refNo || row.id}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">
                      {row.refNo || row.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {row.type?.replace("_", " ") || "Purchase"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">
                          {row.initials || "PB"}
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold">{row.vendor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.billDate || row.requestDate || row.purchaseDate || "Today"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.dueDate || row.targetDeliveryDate || "N/A"}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">{row.amount || row.cost || "₹0.00"}</td>
                    <td className="py-3.5 px-4">{getPaymentStatusBadge(row.status || row.paymentStatus || "UNPAID")}</td>
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

        {/* Footer Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          <span>Showing 1 to 5 of 142 entries</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <ChevronLeft size={16} />
            </button>
            <button className="h-7 w-7 rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">2</button>
            <button className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">3</button>
            <span>...</span>
            <button className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">29</button>
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards: Optimization Tip & Action Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
            <Lightbulb size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Optimization Tip</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              3 vendors have active RFOs open for responses. Review vendor order requests in the RFO tab before finalizing purchase bills.
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
              Bill PB-2023-9015 is 5 days past due date. Contact Global Tech Components for payment clearance.
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
