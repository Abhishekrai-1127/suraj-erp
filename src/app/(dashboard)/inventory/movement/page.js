"use client";

import React, { useState } from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { useInventoryMovements } from "@/hooks/use-inventory-store";
import { Search, Filter, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";

export default function StockMovementPage() {
  const { data: movements = [] } = useInventoryMovements();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredMovements = movements.filter((mov) => {
    const matchesSearch =
      mov.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.warehouse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || mov.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMovementBadge = (type) => {
    switch (type) {
      case "STOCK IN":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            STOCK IN
          </span>
        );
      case "STOCK OUT":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            STOCK OUT
          </span>
        );
      case "TRANSFER":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            TRANSFER
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Stock Movement Audit Log" subtitle="Complete history of stock receipts, dispatches, and warehouse transfers." />
      <InventoryTabNav />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product, SKU, or warehouse location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Movement Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="STOCK IN">Stock In (Inflow)</option>
            <option value="STOCK OUT">Stock Out (Outflow)</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">MOVEMENT ID</th>
                <th className="py-3 px-4">PRODUCT / ITEM</th>
                <th className="py-3 px-4">WAREHOUSE</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">QUANTITY</th>
                <th className="py-3 px-4">DATE/TIME</th>
                <th className="py-3 px-4">USER</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{mov.id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{mov.productName}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{mov.warehouse}</td>
                  <td className="py-3.5 px-4">{getMovementBadge(mov.type)}</td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{mov.quantity}</td>
                  <td className="py-3.5 px-4 text-slate-500">{mov.dateTime}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{mov.user}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600">{mov.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
