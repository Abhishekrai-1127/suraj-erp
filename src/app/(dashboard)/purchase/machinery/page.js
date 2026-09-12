"use client";

import React, { useState } from "react";
import PurchaseHeader from "@/components/purchase/purchase-header";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import { usePurchaseRecords } from "@/hooks/use-purchase-store";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import {
  Cpu,
  Wrench,
  AlertOctagon,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Bell,
  HardHat,
} from "lucide-react";



export default function PurchasedMachineryPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const { data: machineryData = [], isLoading } = usePurchaseRecords("purchased_machinery");

  const handleRowClick = (row) => {
    setSelectedVendor({
      name: row.vendor,
      type: "Machinery Supplier",
      initial: row.initials || "MAC",
      balance: row.cost,
      overdueDays: 0,
    });
    setIsDrawerOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPERATIONAL":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            OPERATIONAL
          </span>
        );
      case "UNDER MAINTENANCE":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            UNDER MAINTENANCE
          </span>
        );
      case "CALIBRATION DUE":
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            CALIBRATION DUE
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <PurchaseHeader title="Purchased Machinery & Capital Assets" subtitle="Track high-value industrial machinery, tooling assets, warranties, and maintenance status." />

      {/* Sub Tab Navigation */}
      <PurchaseTabNav />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Cpu size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Capital Assets</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{machineryData.length} Units</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Operational</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {machineryData.filter(m => m.status === "OPERATIONAL").length} Units
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Wrench size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Under Maintenance</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {machineryData.filter(m => m.status === "UNDER MAINTENANCE").length} Units
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertOctagon size={22} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase">Calibration Due</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {machineryData.filter(m => m.status === "CALIBRATION DUE").length} Units
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">STATUS</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Statuses</option>
              <option>Operational</option>
              <option>Under Maintenance</option>
              <option>Calibration Due</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">MACHINERY CATEGORY</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Categories</option>
              <option>CNC Machining</option>
              <option>Forming & Pressing</option>
              <option>Laser Processing</option>
              <option>Turning & Lathes</option>
              <option>Utilities & Power</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">VENDOR</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Vendors</option>
              <option>Haas Automation India</option>
              <option>Apex Industrial Solutions</option>
              <option>Trumpf India Ltd</option>
              <option>Yamazaki Mazak Corp</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">LOCATION / BAY</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
              <option>All Locations</option>
              <option>Bay A - Main Workshop</option>
              <option>Bay B - Heavy Press Area</option>
              <option>Bay C - Laser Cutting Room</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Machinery Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3 px-4">ASSET TAG</th>
                <th className="py-3 px-4">MACHINERY & MODEL</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">PURCHASE DATE</th>
                <th className="py-3 px-4">ASSET VALUE</th>
                <th className="py-3 px-4">WARRANTY EXPIRY</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {machineryData.length > 0 ? (
                machineryData.map((row) => (
                  <tr
                    key={row.assetTag || row.refNo || row.id}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">
                      {row.assetTag || row.refNo || row.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold">{row.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{row.model} • {row.location}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black">
                          {row.initials || "MAC"}
                        </div>
                        <span className="text-slate-900 dark:text-white font-semibold">{row.vendor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.purchaseDate || "Today"}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">{row.cost || row.amount || "₹0.00"}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.warrantyExpiry || "N/A"}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(row.status || "OPERATIONAL")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 font-medium">
                    No purchased machinery assets registered. Click &quot;Create Purchase Record&quot; above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          <span>Showing 1 to 5 of 16 machinery assets</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <ChevronLeft size={16} />
            </button>
            <button className="h-7 w-7 rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">2</button>
            <button className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold">3</button>
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards: Optimization Tip & Action Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
            <Lightbulb size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Asset Depreciation & Tax Optimization</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              15% plant & machinery depreciation can be claimed for MAC-2023-881 and MAC-2023-109 before end of current financial quarter.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Preventive Maintenance Schedule</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Fiber Laser Cutting Machine MAC-2023-109 is currently undergoing scheduled quarterly maintenance with Trumpf India technicians.
            </p>
          </div>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Machinery Vendor & Asset Detail">
        <SalesDrawerContent customerData={selectedVendor} />
      </Drawer>
    </div>
  );
}
