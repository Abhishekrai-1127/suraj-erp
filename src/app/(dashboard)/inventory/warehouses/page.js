"use client";

import React from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import { DEFAULT_WAREHOUSES } from "@/hooks/use-inventory-store";
import { Warehouse, MapPin, User, Layers, ShieldCheck, Box } from "lucide-react";

export default function WarehousesPage() {
  const mainWarehouse = DEFAULT_WAREHOUSES[0];

  const bays = [
    { name: "Bay A - Raw Materials Storage", capacity: "92%", items: "HDPE Pellets, Metal Sheets, Bar Stocks", status: "High Occupancy", color: "border-blue-500" },
    { name: "Bay B - Machined Components", capacity: "78%", items: "Gear Sets, Shafts, Flanges, Bushings", status: "Optimal", color: "border-amber-500" },
    { name: "Bay C - Finished Goods", capacity: "85%", items: "Assembled Machines, Packed Orders", status: "Optimal", color: "border-emerald-500" },
    { name: "Bay D - Toolroom & Laser Optics", capacity: "65%", items: "Carbide Inserts, Laser Lenses, Spares", status: "Normal", color: "border-slate-400" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <InventoryHeader title="Warehouse Management" subtitle="Single central factory warehouse layout, bay capacities, and material allocation." />
      <InventoryTabNav />

      {/* Main Single Warehouse Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 shrink-0">
              <Warehouse size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {mainWarehouse.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  PRIMARY HUB (01)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-blue-600" />
                  <span>{mainWarehouse.address}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User size={14} className="text-blue-600" />
                  <span>Lead: <strong>{mainWarehouse.manager}</strong></span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Plant Utilization</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{mainWarehouse.capacity}</span>
            </div>
          </div>
        </div>

        {/* Storage Bays Allocation Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              <span>Storage Bays & Section Allocation</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">4 Active Plant Bays</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bays.map((bay) => (
              <div key={bay.name} className={`p-4 rounded-xl border-l-4 ${bay.color} border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{bay.name}</span>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{bay.capacity} Occupied</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Box size={13} className="text-slate-400 shrink-0" />
                  <span>Stored: {bay.items}</span>
                </p>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: bay.capacity }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
