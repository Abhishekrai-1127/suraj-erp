"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
// import Drawer from "@/components/ui/drawer";
// import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import QuickAddModal from "@/components/sales/quick-add-modal";
import InvoiceModal from "@/components/invoice/invoice-modal";
import InvoiceDetailsModal from "@/components/invoice/invoice-details-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { Filter, ArrowUpDown, Plus, Search, X, FileText, Printer, ExternalLink, MoreVertical, Eye, Download, Truck, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getStoredDocuments, getDeletedDocumentIds, deleteStoredDocument } from "@/lib/erp-storage";
import { useSalesDocuments } from "@/hooks/use-sales-store";
import { formatCurrency, parseAmount } from "@/lib/formatters";
import { normalizeSalesDocStatus } from "@/services/sales-api";
import { initialInvoiceData } from "@/lib/invoiceData";
import { openInvoiceInNewTab, downloadInvoicePDF } from "@/lib/printInvoice";
import { downloadChallanPDF } from "@/lib/printChallan";

const initialInvoices = [];

export default function InvoicesPage() {
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [drawerPosition, setDrawerPosition] = useState("right");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingDetailsInvoice, setViewingDetailsInvoice] = useState(null);
  const [storedInvoices, setStoredInvoices] = useState([]);

  // Tally Invoice Modal State
  const [isTallyModalOpen, setIsTallyModalOpen] = useState(false);
  const [activeTallyInvoice, setActiveTallyInvoice] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleOpenTallyInvoice = (inv) => {
    setActiveTallyInvoice(inv || selectedInvoice || initialInvoices[0]);
    setIsTallyModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "invoice");
      setStoredInvoices(
        docs.map((d) => ({
          id: d.refNo,
          customer: d.customer,
          customerId: d.customerId || "-",
          date: d.date,
          dueDate: d.dueDate || "-",
          amount: d.amount,
          balance: d.balance || d.amount,
          isOverdue: false,
          status: normalizeSalesDocStatus(d.status, "invoice") || "UNPAID",
          items: d.items,
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

  // Filter State
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: rawApiInvoices = [] } = useSalesDocuments({ type: "invoice" });
  const deletedIds = getDeletedDocumentIds();

  const allInvoices = useMemo(() => {
    const apiDocs = Array.isArray(rawApiInvoices) ? rawApiInvoices : [];
    const map = new Map();

    storedInvoices.forEach((inv) => {
      const key = inv.id || inv.refNo;
      if (key && !deletedIds.includes(key)) {
        map.set(key, inv);
      }
    });

    apiDocs.forEach((d) => {
      const key = d.refNo || d.id;
      if (key && !deletedIds.includes(key)) {
        map.set(key, {
          id: d.refNo || d.id,
          customer: d.customer,
          customerId: d.customerId || "-",
          date: d.date || "-",
          dueDate: d.dueDate || d.validUntil || "-",
          amount: `₹${Number(d.grandTotal || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          balance: `₹${Number(d.grandTotal || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          numericAmount: Number(d.grandTotal || 0),
          isOverdue: false,
          status: normalizeSalesDocStatus(d.status, "invoice") || "UNPAID",
          items: d.items || [],
        });
      }
    });

    return Array.from(map.values());
  }, [storedInvoices, rawApiInvoices, deletedIds]);

  // Compute live dynamic invoice metrics instead of static hardcoded numbers
  const invoiceStats = useMemo(() => {
    let totalOutstanding = 0;
    let overdueCount = 0;
    let paidLast30Days = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    allInvoices.forEach((inv) => {
      const rawAmt = parseAmount(inv.amount || inv.numericAmount);
      const statusLower = (inv.status || "").toLowerCase();

      if (statusLower === "paid" || statusLower === "completed") {
        const invDate = inv.date && inv.date !== "-" ? new Date(inv.date) : null;
        if (!invDate || isNaN(invDate.getTime()) || invDate >= thirtyDaysAgo) {
          paidLast30Days += rawAmt;
        }
      } else if (statusLower === "overdue") {
        overdueCount += 1;
        totalOutstanding += rawAmt;
      } else {
        totalOutstanding += rawAmt;
        if (inv.dueDate && inv.dueDate !== "-") {
          const dDate = new Date(inv.dueDate);
          if (!isNaN(dDate.getTime()) && dDate < now) {
            overdueCount += 1;
          }
        }
      }
    });

    return {
      totalOutstanding,
      overdueCount,
      paidLast30Days,
    };
  }, [allInvoices]);

  const filteredInvoices = allInvoices.filter((inv) => {
    if (statusFilter !== "All") {
      const invStatus = normalizeSalesDocStatus(inv.status, "invoice");
      if (invStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.customer.toLowerCase().includes(q) ||
        inv.customerId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setViewingDetailsInvoice(invoice);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Invoices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Invoices Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <SalesTabNav />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Outstanding</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(invoiceStats.totalOutstanding, 2)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Overdue Invoices</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {invoiceStats.overdueCount} <span className="text-xs font-semibold text-slate-400">Items</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Paid Last 30 Days</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatCurrency(invoiceStats.paidLast30Days, 2)}
          </div>
        </div>
      </div>

      {/* Invoices Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
              onClick={() => toast.info("Sorted invoices by date descending")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {filteredInvoices.length} of {allInvoices.length} Invoices
          </div>
        </div>

        {/* Filter Bar */}
        {isFilterBarOpen && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Invoices
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
                  placeholder="Search invoice number, customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {["All", "UNPAID", "PAID", "DRAFT", "CANCELLED"].map((st) => (
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">INVOICE #</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">BALANCE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedInvoice?.id === row.id ? "bg-blue-50/30 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-extrabold">
                      {row.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold">{row.customer}</div>
                        <div className="text-[11px] text-slate-400 font-medium">Customer ID: {row.customerId}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.date}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.dueDate}</td>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-black">{row.amount}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black ${
                          row.isOverdue
                            ? "text-rose-600"
                            : row.isPartial
                            ? "text-amber-600"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {row.balance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                          row.status === "PAID"
                            ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : row.status === "UNPAID"
                            ? "bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : row.status === "CANCELLED"
                            ? "bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === row.id ? null : row.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === row.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={async () => {
                                setActiveMenuId(null);
                                const toastId = toast.loading(`Generating PDF for ${row.id}...`);
                                try {
                                  await downloadInvoicePDF(row);
                                  toast.success(`Downloaded ${row.id}.pdf`, { id: toastId });
                                } catch (e) {
                                  toast.error(`Failed to generate PDF`, { id: toastId });
                                }
                              }}
                              className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                            >
                              <Download size={14} className="text-purple-500" />
                              <span>Download PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setEditingInvoice(row);
                              }}
                              className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition border-t border-slate-100 dark:border-slate-800"
                            >
                              <Edit3 size={14} className="text-blue-600" />
                              <span>Edit Invoice</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                deleteStoredDocument(row.id);
                                toast.success(`Deleted Invoice ${row.id}`);
                              }}
                              className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition border-t border-slate-100 dark:border-slate-800"
                            >
                              <Trash2 size={14} />
                              <span>Delete Invoice</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                  No invoices found. Click &quot;+ Invoice&quot; to create one.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />

      {/* Tally GST Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isTallyModalOpen}
        onClose={() => setIsTallyModalOpen(false)}
        invoiceData={activeTallyInvoice}
      />

      <InvoiceDetailsModal
        isOpen={!!viewingDetailsInvoice}
        onClose={() => setViewingDetailsInvoice(null)}
        invoice={viewingDetailsInvoice}
        onEdit={(inv) => setEditingInvoice(inv)}
        onOpenTallyModal={(inv) => handleOpenTallyInvoice(inv)}
      />

      <EditDocumentModal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        document={editingInvoice}
      />
    </div>
  );
}
