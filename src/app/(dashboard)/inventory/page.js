"use client";

import React, { useState } from "react";
import InventoryHeader from "@/components/inventory/inventory-header";
import InventoryTabNav from "@/components/inventory/inventory-tab-nav";
import InventoryAddModal from "@/components/inventory/inventory-add-modal";
import { useInventoryProducts, useInventoryMovements } from "@/hooks/use-inventory-store";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  ArrowDownRight,
  ArrowUpRight,
  Warehouse,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
  Barcode,
  Settings,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";

// Recharts Sample Data for Inventory Value & Stock Trends
const trendData = [
  { month: "JAN", value: 2.8, volume: 62000 },
  { month: "FEB", value: 3.1, volume: 68000 },
  { month: "MAR", value: 3.0, volume: 65000 },
  { month: "APR", value: 3.4, volume: 72000 },
  { month: "MAY", value: 3.9, volume: 79000 },
  { month: "JUN", value: 3.8, volume: 76000 },
  { month: "JUL", value: 4.1, volume: 82000 },
  { month: "AUG", value: 4.2, volume: 84102 },
];

// Single Warehouse Bay Occupancy Donut Data
const warehousePieData = [
  { name: "Bay A - Raw Materials", value: 92, color: "#2563eb" },
  { name: "Bay B - Machined Parts", value: 78, color: "#d97706" },
  { name: "Bay C - Finished Goods", value: 85, color: "#10b981" },
  { name: "Bay D - Toolroom & Optics", value: 65, color: "#64748b" },
];

// Stock Activity Inflow vs Outflow
const activityData = [
  { day: "Mon", inflow: 1200, outflow: 800 },
  { day: "Tue", inflow: 1500, outflow: 1100 },
  { day: "Wed", inflow: 900, outflow: 1400 },
  { day: "Thu", inflow: 1800, outflow: 950 },
  { day: "Fri", inflow: 2100, outflow: 1300 },
  { day: "Sat", inflow: 850, outflow: 400 },
];

export default function InventoryOverviewPage() {
  const { data: products = [] } = useInventoryProducts();
  const { data: movements = [] } = useInventoryMovements();

  const [trendView, setTrendView] = useState("value"); // 'value' or 'volume'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("product");

  const handleOpenQuickAction = (tab) => {
    setModalTab(tab);
    setIsAddModalOpen(true);
  };

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
      {/* Top Header & Sub Nav */}
      <InventoryHeader title="Inventory Management" subtitle="Manage products, warehouses, stock movement, inventory valuation and manufacturing materials in real-time." />
      <InventoryTabNav />

      {/* 8 TOP METRIC KPI CARDS (Dynamic live metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: TOTAL PRODUCTS */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TOTAL PRODUCTS</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white">
              {products.length.toLocaleString("en-IN")}
            </div>
            <span suppressHydrationWarning className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ↗ Active Catalog
            </span>
          </div>
        </div>

        {/* Card 2: AVAILABLE STOCK */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AVAILABLE STOCK</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white">
              {products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0).toLocaleString("en-IN")}
            </div>
            <span suppressHydrationWarning className="text-[11px] font-bold text-slate-400">
              Units In Storage
            </span>
          </div>
        </div>

        {/* Card 3: LOW STOCK ITEMS */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LOW STOCK ITEMS</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {products.filter((p) => (Number(p.stock) || 0) <= (Number(p.minStock) || 10) && (Number(p.stock) || 0) > 0).length}
            </div>
            <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300">Needs Reorder</span>
          </div>
        </div>

        {/* Card 4: OUT OF STOCK */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">OUT OF STOCK</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertOctagon size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {products.filter((p) => (Number(p.stock) || 0) === 0).length}
            </div>
            <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-300">Critical Action</span>
          </div>
        </div>

        {/* Card 5: INVENTORY VALUE */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">INVENTORY VALUE</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.unitPrice) || 0), 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Live Asset Valuation
            </span>
          </div>
        </div>

        {/* Card 6: STOCK IN (MONTHLY) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">STOCK IN (MONTHLY)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white">
              {movements.filter((m) => m.type === "STOCK IN").length}
            </div>
            <span className="text-[11px] font-bold text-slate-500">Recorded Receipts</span>
          </div>
        </div>

        {/* Card 7: STOCK OUT (MONTHLY) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">STOCK OUT (MONTHLY)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white">
              {movements.filter((m) => m.type === "STOCK OUT").length}
            </div>
            <span className="text-[11px] font-bold text-emerald-600">Dispatched Batches</span>
          </div>
        </div>

        {/* Card 8: ACTIVE WAREHOUSES */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ACTIVE WAREHOUSES</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Warehouse size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">01</div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Central Factory Hub</span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW: TRENDS AREA CHART & WAREHOUSE UTILIZATION DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Chart: Inventory Value & Stock Trends */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Inventory Value & Stock Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Real-time valuation of assets across all global warehouses.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setTrendView("value")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  trendView === "value"
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                Value
              </button>
              <button
                type="button"
                onClick={() => setTrendView("volume")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  trendView === "volume"
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                Volume
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inventoryColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={trendView === "value" ? "value" : "volume"}
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#inventoryColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Warehouse Utilization Donut */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Warehouse Utilization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Capacity used vs. available space.
            </p>
          </div>

          <div className="relative h-48 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warehousePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {warehousePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">78%</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AVG OCCUPANCY</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            {warehousePieData.map((wh) => (
              <div key={wh.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: wh.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-bold">{wh.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-extrabold">{wh.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: WEEKLY STOCK ACTIVITY CHART & 6 QUICK ACTION TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stock Activity Inflow vs Outflow Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Stock Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weekly inflow vs outflow log</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Outflow
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                <Bar dataKey="inflow" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="outflow" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6 Quick Action Tiles Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOpenQuickAction("product")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2 group-hover:scale-110 transition">
              <Plus size={20} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Add Product</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenQuickAction("receive")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2 group-hover:scale-110 transition">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Receive Stock</span>
          </button>

          <a
            href="/inventory/products"
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2 group-hover:scale-110 transition">
              <Package size={20} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">View Products</span>
          </a>

          <a
            href="/inventory/low-stock"
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2 group-hover:scale-110 transition">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Low Stock Audit</span>
          </a>

          <button
            type="button"
            onClick={() => toast.info("Barcode printing tool initializing...")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2 group-hover:scale-110 transition">
              <Barcode size={20} />
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white">Print Barcode</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Warehouse layout manager opening...")}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 border-dashed hover:border-slate-400 transition text-center group shadow-2xs"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/60 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-2 group-hover:scale-110 transition">
              <Settings size={20} />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Manage Layout</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT STOCK MOVEMENTS TABLE */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Stock Movements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time audit log of stock inflows, outflows, and warehouse transfers</p>
          </div>
          <a
            href="/inventory/movement"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All Movements</span>
            <ArrowRight size={14} />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">PRODUCT NAME</th>
                <th className="py-3 px-4">WAREHOUSE</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">QUANTITY</th>
                <th className="py-3 px-4">DATE/TIME</th>
                <th className="py-3 px-4">USER</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {movements.length > 0 ? (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                          📦
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white font-extrabold">{mov.productName}</div>
                          <div className="text-[11px] font-mono text-slate-400">SKU: {mov.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">{mov.warehouse}</td>
                    <td className="py-3.5 px-4">{getMovementBadge(mov.type)}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">{mov.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{mov.dateTime}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{mov.user}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        {mov.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                    No stock movements recorded yet. Click &quot;Receive Stock&quot; to log movement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
}
