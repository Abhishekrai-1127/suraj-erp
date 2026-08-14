"use client";

import React from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { useInventoryProducts } from "@/hooks/use-inventory-store";
import { AlertTriangle, AlertOctagon, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";

export default function LowStockPage() {
  const { data: products = [] } = useInventoryProducts();

  const lowStockItems = products.filter(p => p.stock <= p.minReorder);

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Low Stock & Critical Reorder Alerts" subtitle="Monitor items near or below minimum reorder points requiring immediate replenishment." />
      <InventoryTabNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Below Reorder Point</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockItems.length} Products</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertOctagon size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Critical Zero Stock</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {lowStockItems.filter(p => p.stock === 0).length} Products
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">PRODUCT NAME</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">LOCATION</th>
                <th className="py-3 px-4 text-center">CURRENT STOCK</th>
                <th className="py-3 px-4 text-center">MIN REORDER POINT</th>
                <th className="py-3 px-4">DEFICIT STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {lowStockItems.map((prod) => (
                <tr key={prod.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{prod.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{prod.sku}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{prod.warehouse}</td>
                  <td className="py-3.5 px-4 text-center font-black text-rose-600">
                    {prod.stock} {prod.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                    {prod.minReorder} {prod.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                      prod.stock === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"
                    }`}>
                      {prod.stock === 0 ? "CRITICAL OUT OF STOCK" : "REORDER REQUIRED"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toast.success(`Reorder RFO created for ${prod.name}!`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition ml-auto"
                    >
                      <ShoppingBag size={13} />
                      <span>Generate RFO</span>
                    </button>
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
