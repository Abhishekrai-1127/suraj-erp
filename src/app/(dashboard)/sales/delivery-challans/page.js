"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import CreateChallanModal from "@/components/sales/create-challan-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import {
  Plus,
  Filter,
  Download,
  Search,
  Edit3,
  Trash2,
  ArrowUpDown,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getStoredDocuments, deleteStoredDocument, getDeletedDocumentIds } from "@/lib/erp-storage";
import { useSalesDocuments, useDeleteSalesDocument } from "@/hooks/use-sales-store";
import { normalizeSalesDocStatus } from "@/services/sales-api";
import { downloadChallanPDF } from "@/lib/printChallan";
import { toast } from "sonner";

export default function DeliveryChallansPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingChallan, setEditingChallan] = useState(null);
  const [storedChallans, setStoredChallans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Query hook for live backend sales documents
  const { data: apiDocs, refetch } = useSalesDocuments({ type: "delivery_challan" });
  const { mutate: deleteSalesDoc } = useDeleteSalesDocument();

  // Load and synchronize stored documents
  useEffect(() => {
    const loadData = () => {
      const deletedIds = getDeletedDocumentIds();
      const docs = getStoredDocuments().filter(
        (d) =>
          (d.type === "challan" || d.type === "delivery_challan") &&
          !deletedIds.includes(d.id) &&
          !deletedIds.includes(d.refNo)
      );

      setStoredChallans(
        docs.map((d) => ({
          id: d.refNo || d.id,
          customer: d.customer || d.customerName || "Customer",
          date: d.date || d.dispatchDate || new Date().toISOString().split("T")[0],
          itemsCount: d.itemsCount || `${(d.items || []).length || 1} Units`,
          status: normalizeSalesDocStatus(d.status, "delivery_challan") || "DELIVERED",
          partyOrderNo: d.partyOrderNo || d.poNumber || "PO-88912-X",
          items: d.items || [],
          address: d.address || d.shippingAddress || "",
        }))
      );
    };

    loadData();
    window.addEventListener("erp_document_created", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("erp_document_created", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Merge backend docs with local storage and deduplicate
  const allChallans = useMemo(() => {
    const deletedIds = getDeletedDocumentIds();
    const map = new Map();

    // Local items
    storedChallans.forEach((c) => {
      if (!deletedIds.includes(c.id)) {
        map.set(c.id, c);
      }
    });

    // Remote DB items
    if (apiDocs && Array.isArray(apiDocs)) {
      apiDocs.forEach((d) => {
        const id = d.refNo || String(d.id);
        if (!deletedIds.includes(id) && !map.has(id)) {
          map.set(id, {
            id,
            customer: d.customer || d.customerName || "Customer",
            date: d.date || d.dispatchDate || new Date().toISOString().split("T")[0],
            itemsCount: d.itemsCount || `${(d.items || []).length || 1} Units`,
            status: normalizeSalesDocStatus(d.status, "delivery_challan") || "DELIVERED",
            partyOrderNo: d.partyOrderNo || d.poNumber || "PO-88912-X",
            items: d.items || [],
            address: d.address || d.shippingAddress || "",
          });
        }
      });
    }

    return Array.from(map.values());
  }, [storedChallans, apiDocs]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = allChallans.length;
    const delivered = allChallans.filter((c) => c.status === "DELIVERED").length;
    const inTransit = allChallans.filter(
      (c) => c.status === "PENDING" || c.status === "IN TRANSIT" || c.status === "DISPATCHED"
    ).length;
    return { total, delivered, inTransit };
  }, [allChallans]);

  // Filtered and sorted list
  const filteredChallans = useMemo(() => {
    return allChallans
      .filter((c) => {
        const matchesStatus =
          statusFilter === "All" ||
          normalizeSalesDocStatus(c.status, "delivery_challan") === statusFilter;
        if (!matchesStatus) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.customer.toLowerCase().includes(q) ||
          c.partyOrderNo.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return sortAscending ? dateA - dateB : dateB - dateA;
      });
  }, [allChallans, statusFilter, searchQuery, sortAscending]);

  // Single Delete Handler
  const handleDeleteChallan = (id) => {
    deleteStoredDocument(id);
    deleteSalesDoc(id);
    setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    toast.success(`Deleted Delivery Challan ${id}`);
    refetch();
  };

  // Batch Delete Handler
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    const count = selectedRows.length;
    selectedRows.forEach((id) => {
      deleteStoredDocument(id);
      deleteSalesDoc(id);
    });
    setSelectedRows([]);
    toast.success(`Deleted ${count} delivery ${count === 1 ? "challan" : "challans"}`);
    refetch();
  };

  // Checkbox selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredChallans.map((c) => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredChallans.length === 0) {
      toast.info("No delivery challans to export.");
      return;
    }

    const headers = ["Challan No", "Customer", "Dispatch Date", "Items", "Party Order No", "Status"];
    const rows = filteredChallans.map((c) => [
      `"${c.id}"`,
      `"${c.customer}"`,
      `"${c.date}"`,
      `"${c.itemsCount}"`,
      `"${c.partyOrderNo}"`,
      `"${c.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery_challans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Delivery challans exported to CSV!");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Delivery Challans</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Delivery Challans
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Manage goods transit documentation, physical dispatches, and proof of delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Challan</span>
          </button>
        </div>
      </div>

      <SalesTabNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Dispatches
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {metrics.total}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Pending / In Transit
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              {metrics.inTransit}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Delivered
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {metrics.delivered}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                isFilterBarOpen || statusFilter !== "All" || searchQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                  : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter size={14} />
              <span>Filter {statusFilter !== "All" ? `(${statusFilter})` : ""}</span>
            </button>

            <button
              onClick={() => {
                setSortAscending(!sortAscending);
                toast.info(`Sorted by date ${!sortAscending ? "ascending" : "descending"}`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ArrowUpDown size={14} />
              <span>Sort: {sortAscending ? "Oldest" : "Newest"}</span>
            </button>

            {/* Batch Delete Trigger */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedRows.length} Selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Delete checked delivery challans"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedRows.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {filteredChallans.length} of {allChallans.length} Challans
          </div>
        </div>

        {/* Expandable Filter Bar */}
        {isFilterBarOpen && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Delivery Challans
              </span>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setIsFilterBarOpen(false);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challan number, customer name, party PO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {["All", "DELIVERED", "PENDING", "DRAFT", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      statusFilter === st
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredChallans.length > 0 &&
                      selectedRows.length === filteredChallans.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">CHALLAN NO</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DISPATCH DATE</th>
                <th className="py-3 px-4">ITEMS</th>
                <th className="py-3 px-4">PARTY ORDER NO</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredChallans.length > 0 ? (
                filteredChallans.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedRows.includes(row.id)
                        ? "bg-blue-50/40 dark:bg-blue-950/20"
                        : ""
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <button
                        onClick={async () => {
                          const toastId = toast.loading(`Generating PDF for ${row.id}...`);
                          try {
                            await downloadChallanPDF(row);
                            toast.success(`Downloaded ${row.id}.pdf`, { id: toastId });
                          } catch (e) {
                            toast.error("Failed to generate PDF", { id: toastId });
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
                        title="Click to download Delivery Challan PDF"
                      >
                        {row.id}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{row.customer}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.date}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{row.itemsCount}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.partyOrderNo}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                          row.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : row.status === "PENDING" || row.status === "IN TRANSIT" || row.status === "DISPATCHED"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : row.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingChallan(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Delivery Challan"
                        >
                          <Edit3 size={13} className="text-blue-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={async () => {
                            const toastId = toast.loading(`Downloading ${row.id}...`);
                            try {
                              await downloadChallanPDF(row);
                              toast.success(`Downloaded ${row.id}.pdf`, { id: toastId });
                            } catch (e) {
                              toast.error("Failed to generate Challan PDF", { id: toastId });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} className="text-purple-600" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChallan(row.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                          title="Delete Delivery Challan"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-xs">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Truck size={32} className="text-slate-300 dark:text-slate-600" />
                      <span>No delivery challans found. Click &quot;Create Challan&quot; to create one.</span>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        + Create Challan
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateChallanModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => refetch()}
      />
      <EditDocumentModal
        isOpen={!!editingChallan}
        onClose={() => setEditingChallan(null)}
        document={editingChallan}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
