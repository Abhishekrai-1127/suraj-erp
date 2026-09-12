"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import QuickAddModal from "@/components/sales/quick-add-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { getStoredDocuments, deleteStoredDocument, getDeletedDocumentIds } from "@/lib/erp-storage";
import { useSalesDocuments } from "@/hooks/use-sales-store";
import { normalizeSalesDocStatus } from "@/services/sales-api";
import { downloadQuotationPDF } from "@/lib/printQuotation";
import {
  Upload,
  Download,
  Plus,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const initialQuotations = [];

export default function QuotationsPage() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [storedQuotations, setStoredQuotations] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "quotation");
      setStoredQuotations(
        docs.map((d) => ({
          id: d.refNo,
          customer: d.customer,
          location: "Headquarters",
          initials: d.initials || "QT",
          date: d.date,
          validUntil: d.validUntil || "-",
          amount: d.amount,
          numericAmount: d.numericAmount,
          status: normalizeSalesDocStatus(d.status, "quotation") || "PENDING",
          items: d.items,
          gstin: d.gstin,
          billingAddress: d.billingAddress,
          expiryDate: d.expiryDate,
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

  // Interactive Filter States
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: rawApiQuotations = [] } = useSalesDocuments({ type: "quotation" });
  const deletedIds = getDeletedDocumentIds();

  // Combine API results and locally stored documents, de-duplicating by refNo/id
  const allQuotations = useMemo(() => {
    const apiDocs = Array.isArray(rawApiQuotations) ? rawApiQuotations : [];
    const map = new Map();

    storedQuotations.forEach((q) => {
      const key = q.id || q.refNo;
      if (key && !deletedIds.includes(key)) {
        map.set(key, q);
      }
    });

    apiDocs.forEach((d) => {
      const key = d.refNo || d.id;
      if (key && !deletedIds.includes(key)) {
        map.set(key, {
          id: d.refNo || d.id,
          customer: d.customer,
          location: d.placeOfSupply || "Headquarters",
          initials: d.customer ? d.customer.slice(0, 2).toUpperCase() : "QT",
          date: d.date || "-",
          validUntil: d.validUntil || "-",
          amount: `₹${Number(d.grandTotal || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          numericAmount: Number(d.grandTotal || 0),
          status: normalizeSalesDocStatus(d.status, "quotation") || "PENDING",
          items: d.items || [],
          gstin: d.gstin || "",
          billingAddress: d.placeOfSupply || "",
          expiryDate: d.validUntil || "",
        });
      }
    });

    return Array.from(map.values());
  }, [storedQuotations, rawApiQuotations, deletedIds]);

  const filteredQuotations = allQuotations.filter((q) => {
    if (statusFilter !== "All") {
      const qStatus = normalizeSalesDocStatus(q.status, "quotation");
      if (qStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.id.toLowerCase().includes(query) ||
        q.customer.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredQuotations.map((q) => q.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteBatch = () => {
    if (selectedRows.length === 0) return;
    const count = selectedRows.length;
    selectedRows.forEach((id) => deleteStoredDocument(id));
    toast.success(`Deleted ${count} selected quotation(s) successfully`);
    setSelectedRows([]);
  };

  const handleDeleteSingle = (id) => {
    deleteStoredDocument(id);
    toast.success(`Deleted Quotation ${id}`);
    setSelectedRows((prev) => prev.filter((item) => item !== id));
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "APPROVED" || s === "ACCEPTED") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          APPROVED
        </span>
      );
    }
    if (s === "CANCELLED" || s === "EXPIRED") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
          CANCELLED
        </span>
      );
    }
    if (s === "DRAFT") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          DRAFT
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-100/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
        PENDING
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Quotations
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track all customer price estimates and proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Exporting Quotations...")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          <button
            onClick={() => toast.info("Import Quotations tool active")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition"
          >
            <Upload size={15} />
            <span>Import</span>
          </button>
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <SalesTabNav />

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
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
              onClick={() => toast.info("Sorting table by date descending")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>

            {/* Checked Items Delete Trigger */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {selectedRows.length} Selected
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition shadow-xs"
                  title="Delete checked quotations"
                >
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedRows.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>Showing {filteredQuotations.length} of {allQuotations.length}</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Filter Drawer/Bar */}
        {isFilterBarOpen && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Quotations
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
                  placeholder="Search by ID, customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {["All", "PENDING", "APPROVED", "DRAFT", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredQuotations.length && filteredQuotations.length > 0}
                    onChange={(e) =>
                      setSelectedRows(
                        e.target.checked ? filteredQuotations.map((d) => d.id) : []
                      )
                    }
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-4">QUOTATION NO</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">VALID UNTIL</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS (under dev)</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((row) => {
                const isChecked = selectedRows.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                      isChecked ? "bg-blue-50/20 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRow(row.id)}
                        className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={async () => {
                          const toastId = toast.loading(`Generating ${row.id}...`);
                          try {
                            await downloadQuotationPDF(row);
                            toast.success(`Downloaded ${row.id}.pdf`, { id: toastId });
                          } catch (e) {
                            toast.error("Failed to generate PDF", { id: toastId });
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
                        title="Click to download quotation PDF"
                      >
                        {row.id}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black">
                          {row.initials}
                        </div>
                        <div>
                          <div className="text-slate-900 dark:text-white font-bold">
                            {row.customer}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {row.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-600 dark:text-slate-300">
                        {row.validUntil}
                      </div>
                      {row.validExpired && (
                        <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Expired
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {row.amount}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(row.status)}</td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingQuotation(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                      >
                        <Edit3 size={13} className="text-blue-600" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                  No quotations found. Click &quot;Create Quotation&quot; to create one.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <EditDocumentModal
        isOpen={!!editingQuotation}
        onClose={() => setEditingQuotation(null)}
        document={editingQuotation}
      />
    </div>
  );
}
