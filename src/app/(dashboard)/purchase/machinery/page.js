"use client";

import React, { useState } from "react";
import PurchaseHeader from "@/components/purchase/purchase-header";
import PurchaseTabNav from "@/components/purchase/purchase-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import {
  usePurchaseRecords,
  useDeletePurchaseRecord,
  useUpdatePurchaseRecord,
} from "@/hooks/use-purchase-store";
import {
  Cpu,
  Wrench,
  AlertOctagon,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Lightbulb,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export default function PurchasedMachineryPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");

  const { data: machineryData = [], isLoading } = usePurchaseRecords("purchased_machinery");
  const deleteRecordMutation = useDeletePurchaseRecord();
  const updateRecordMutation = useUpdatePurchaseRecord();

  const handleRowClick = (row) => {
    setSelectedVendor({
      name: row.vendor,
      type: "Machinery Supplier",
      initial: row.initials || (row.vendor || "M").charAt(0),
      balance: row.cost || "₹0.00",
      overdueDays: 0,
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteMachinery = (e, row) => {
    e.stopPropagation();
    const idToDelete = row.id || row.assetTag || row.refNo;
    deleteRecordMutation.mutate(idToDelete, {
      onSuccess: () => {
        toast.success(`Machinery Asset ${row.assetTag || row.name} removed successfully!`);
      },
      onError: (err) => {
        toast.error(`Failed to delete machinery: ${err?.message}`);
      },
    });
  };

  const handleStatusChange = (e, row, newStatus) => {
    e.stopPropagation();
    const idToUpdate = row.id || row.assetTag || row.refNo;
    updateRecordMutation.mutate(
      { id: idToUpdate, updates: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`${row.name || row.assetTag} status updated to ${newStatus}!`);
        },
        onError: (err) => {
          toast.error(`Failed to update status: ${err?.message}`);
        },
      }
    );
  };

  const filteredMachinery = machineryData.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item.assetTag || "").toLowerCase().includes(q) ||
      (item.name || "").toLowerCase().includes(q) ||
      (item.model || "").toLowerCase().includes(q) ||
      (item.vendor || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" || (item.status || "").toUpperCase() === statusFilter.toUpperCase();

    const matchesCategory =
      categoryFilter === "ALL" ||
      (item.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesLocation =
      locationFilter === "ALL" ||
      (item.location || "").toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
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
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status || "INACTIVE"}
          </span>
        );
    }
  };

  // Dynamic unique categories and locations
  const categories = Array.from(new Set(machineryData.map((m) => m.category).filter(Boolean)));
  const locations = Array.from(new Set(machineryData.map((m) => m.location).filter(Boolean)));

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <PurchaseHeader
        title="Purchased Machinery & Capital Assets"
        subtitle="Track high-value industrial machinery, tooling assets, warranties, and maintenance status."
        initialTab="machinery"
      />

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
              {machineryData.filter((m) => (m.status || "").toUpperCase() === "OPERATIONAL").length} Units
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
              {machineryData.filter((m) => (m.status || "").toUpperCase() === "UNDER MAINTENANCE").length} Units
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
              {machineryData.filter((m) => (m.status || "").toUpperCase() === "CALIBRATION DUE").length} Units
            </div>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">SEARCH ASSET</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Asset tag, name, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="UNDER MAINTENANCE">Under Maintenance</option>
              <option value="CALIBRATION DUE">Calibration Due</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">MACHINERY CATEGORY</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">LOCATION / BAY</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Machinery Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">ASSET TAG</th>
                <th className="py-3 px-4">MACHINERY & MODEL</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">PURCHASE DATE</th>
                <th className="py-3 px-4">ASSET VALUE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    Loading capital machinery assets...
                  </td>
                </tr>
              ) : filteredMachinery.length > 0 ? (
                filteredMachinery.map((row) => (
                  <tr
                    key={row.assetTag || row.refNo || row.id}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">
                      {row.assetTag || row.refNo || row.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold">{row.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {row.model || "Standard"} • {row.location || "Bay A"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {row.category || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black">
                          {row.initials || (row.vendor || "M").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-slate-900 dark:text-white font-semibold">{row.vendor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.purchaseDate || "Today"}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">
                      {row.cost || (row.numericCost ? `₹${row.numericCost.toLocaleString("en-IN")}` : "₹0.00")}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={row.status || "OPERATIONAL"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(e, row, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="OPERATIONAL">OPERATIONAL</option>
                        <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                        <option value="CALIBRATION DUE">CALIBRATION DUE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteMachinery(e, row)}
                        title="Delete Machinery Asset"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    No purchased machinery assets registered. Click &quot;Create Purchase Record&quot; above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Machinery Vendor & Asset Detail">
        <SalesDrawerContent customerData={selectedVendor} />
      </Drawer>
    </div>
  );
}
