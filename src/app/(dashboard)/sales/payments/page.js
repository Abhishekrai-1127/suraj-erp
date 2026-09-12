"use client";

import React, { useState, useEffect } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import QuickAddModal from "@/components/sales/quick-add-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { Plus, Filter, Search, Edit3 } from "lucide-react";
import { getStoredDocuments, getDeletedDocumentIds } from "@/lib/erp-storage";
import { normalizeSalesDocStatus } from "@/services/sales-api";

const initialPayments = [];

export default function PaymentsPage() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [storedPayments, setStoredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = () => {
      const deletedIds = getDeletedDocumentIds();
      const docs = getStoredDocuments().filter(
        (d) => d.type === "payment" && !deletedIds.includes(d.id || d.refNo)
      );
      setStoredPayments(
        docs.map((d) => ({
          id: d.refNo || d.id,
          customer: d.customer,
          date: d.date || d.paymentDate,
          paymentMethod: d.paymentMethod || d.method || "Bank Transfer",
          amount: d.amount,
          status: normalizeSalesDocStatus(d.status, "payment") || "PAID",
        }))
      );
    };
    loadData();
    window.addEventListener("erp_document_created", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("erp_document_created", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const allPayments = [...storedPayments, ...initialPayments];

  const filteredPayments = allPayments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Payments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Customer Payments
          </h1>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
        >
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      <SalesTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search payment reference, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Showing {filteredPayments.length} of {allPayments.length} Payments
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">PAYMENT REF</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">PAYMENT DATE</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 text-blue-600 font-extrabold font-mono">{row.id}</td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{row.customer}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.date}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{row.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-black">{row.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setEditingPayment(row)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                    >
                      <Edit3 size={13} className="text-blue-600" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-xs">
                  No payment records found. Click &quot;Record Payment&quot; to record one.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <EditDocumentModal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        document={editingPayment}
      />
    </div>
  );
}
