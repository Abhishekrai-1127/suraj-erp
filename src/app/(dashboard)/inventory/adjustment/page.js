"use client";

import React from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { SlidersHorizontal, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function StockAdjustmentPage() {
  const adjustments = [
    { id: "ADJ-2023-09", product: "Fiber Laser Optic Lens 50mm", warehouse: "Mumbai Hub - A04", qty: "-2 Pcs", reason: "Damaged during physical stock count verification", date: "24 Oct 2023", user: "Auditor Account", status: "Approved" },
    { id: "ADJ-2023-08", product: "Carbide Cutting Inserts (PVD)", warehouse: "Pune Plant - D02", qty: "-10 Boxes", reason: "Expired coating warranty batch return", date: "20 Oct 2023", user: "S. Kulkarni", status: "Approved" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Stock Adjustment & Audit Log" subtitle="Reconcile inventory count discrepancies, damaged goods, and audit adjustments." />
      <InventoryTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">ADJUSTMENT ID</th>
                <th className="py-3 px-4">PRODUCT / ITEM</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4">QTY CHANGE</th>
                <th className="py-3 px-4">REASON / DISCREPANCY</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{adj.id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{adj.product}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{adj.warehouse}</td>
                  <td className="py-3.5 px-4 font-black text-rose-600">{adj.qty}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{adj.reason}</td>
                  <td className="py-3.5 px-4 text-slate-500">{adj.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {adj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
