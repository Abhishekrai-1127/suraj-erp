"use client";

import React, { useState } from "react";
import PurchaseHeader from "@/components/purchase/purchase-header";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import { usePurchaseRecords } from "@/hooks/use-purchase-store";
import { FileQuestion, Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

export default function RfoPage() {
  const { data: rfoRecords = [], isLoading } = usePurchaseRecords("rfo");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRfos = rfoRecords.filter((rfo) => {
    const matchesSearch =
      (rfo.refNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rfo.vendor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rfo.department || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || rfo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            APPROVED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            <XCircle size={12} />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock size={12} />
            PENDING APPROVAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PurchaseHeader title="Request For Order (RFO)" subtitle="Manage procurement order requests, vendor requisitions, and department approval workflows." />
      <PurchaseTabNav />

      {/* RFO KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Pending Approval</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {rfoRecords.filter((r) => r.status === "PENDING APPROVAL").length}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Approved RFOs</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {rfoRecords.filter((r) => r.status === "APPROVED").length}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileQuestion size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Total Requisitions</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{rfoRecords.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search RFO ref no, vendor, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* RFO Records Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">RFO REF NO</th>
                <th className="py-3 px-4">VENDOR SUPPLIER</th>
                <th className="py-3 px-4">DEPARTMENT</th>
                <th className="py-3 px-4">REQUISITION DATE</th>
                <th className="py-3 px-4">TARGET DELIVERY</th>
                <th className="py-3 px-4">ESTIMATED AMOUNT</th>
                <th className="py-3 px-4">PRIORITY</th>
                <th className="py-3 px-4">APPROVAL STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredRfos.length > 0 ? (
                filteredRfos.map((rfo) => (
                  <tr key={rfo.refNo || rfo.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">{rfo.refNo || rfo.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rfo.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{rfo.department || "Toolroom"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{rfo.requestDate || "Today"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{rfo.targetDeliveryDate || "N/A"}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{rfo.amount || "₹0.00"}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        rfo.priority === "URGENT" ? "bg-rose-100 text-rose-700" : rfo.priority === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {rfo.priority || "NORMAL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(rfo.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-medium">
                    No RFO order requests found. Click "Create Purchase Record" above to submit a new RFO.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
