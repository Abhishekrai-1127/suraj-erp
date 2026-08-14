"use client";

import React from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { FolderTree, Package, Layers } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    { name: "Mechanical Parts", count: 4250, value: "₹1.4M", description: "Gears, bearings, shafts, fasteners, and heavy hardware" },
    { name: "Electrical", count: 1890, value: "₹850K", description: "Copper wiring, relays, contactors, fuses, and control panels" },
    { name: "Raw Polymers", count: 3200, value: "₹920K", description: "HDPE pellets, polypropylene granules, and resin materials" },
    { name: "Laser Optics", count: 450, value: "₹640K", description: "Fiber lenses, protective windows, nozzles, and mirrors" },
    { name: "Cutting Tools", count: 2692, value: "₹390K", description: "Carbide inserts, milling cutters, drill bits, and taps" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Product Categories" subtitle="Organize inventory master items by structural category classification." />
      <InventoryTabNav />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.name} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold">
                <FolderTree size={20} />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">{cat.value} Valuation</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{cat.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>{cat.count.toLocaleString()} Items</span>
              <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Manage Category →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
