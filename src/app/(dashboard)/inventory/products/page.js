"use client";

import React, { useState } from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { useInventoryProducts } from "@/hooks/use-inventory-store";
import { Search, Filter, Package, AlertTriangle, AlertOctagon } from "lucide-react";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useInventoryProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || prod.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getStockStatusBadge = (prod) => {
    if (prod.stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertOctagon size={12} />
          OUT OF STOCK
        </span>
      );
    }
    if (prod.stock <= prod.minReorder) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <AlertTriangle size={12} />
          LOW STOCK
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        IN STOCK
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Product Master Catalog" subtitle="Browse, search, and manage all inventory stock items across warehouses." />
      <InventoryTabNav />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Mechanical Parts">Mechanical Parts</option>
            <option value="Electrical">Electrical</option>
            <option value="Raw Polymers">Raw Polymers</option>
            <option value="Laser Optics">Laser Optics</option>
            <option value="Cutting Tools">Cutting Tools</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">PRODUCT / ITEM</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">WAREHOUSE</th>
                <th className="py-3 px-4 text-center">CURRENT STOCK</th>
                <th className="py-3 px-4 text-right">UNIT PRICE</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{prod.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{prod.sku}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{prod.warehouse}</td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                    {prod.stock} {prod.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                    ₹{prod.unitPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4">{getStockStatusBadge(prod)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
