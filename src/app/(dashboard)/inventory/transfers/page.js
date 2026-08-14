"use client";

import React from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { ArrowRightLeft, Truck, Clock } from "lucide-react";

export default function TransfersPage() {
  const transfers = [
    { id: "TRF-902", product: "HDPE Raw Pellets (Grade A)", from: "Mumbai Hub - A12", to: "Bangalore East - C01", qty: "50 Bags", carrier: "Express Logistics Truck #402", date: "24 Oct 2023", status: "In Transit" },
    { id: "TRF-881", product: "Industrial Gear Set X12", from: "Delhi West - B04", to: "Pune Plant - D02", qty: "120 Units", carrier: "VRL Logistics #190", date: "18 Oct 2023", status: "Completed" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Inter-Warehouse Stock Transfers" subtitle="Track stock transfer dispatches, transit status, and destination receipt confirmations." />
      <InventoryTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">TRANSFER ID</th>
                <th className="py-3 px-4">PRODUCT / ITEM</th>
                <th className="py-3 px-4">SOURCE &rarr; DESTINATION WAREHOUSE</th>
                <th className="py-3 px-4">QUANTITY</th>
                <th className="py-3 px-4">TRANSPORT CARRIER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {transfers.map((trf) => (
                <tr key={trf.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{trf.id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{trf.product}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {trf.from} <span className="text-blue-600 font-black">➔</span> {trf.to}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{trf.qty}</td>
                  <td className="py-3.5 px-4 text-slate-500">{trf.carrier}</td>
                  <td className="py-3.5 px-4 text-slate-500">{trf.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                      trf.status === "In Transit" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {trf.status}
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
