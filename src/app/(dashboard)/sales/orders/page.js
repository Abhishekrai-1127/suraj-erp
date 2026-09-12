"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import QuickAddModal from "@/components/sales/quick-add-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { Plus, Filter, ArrowUpDown, Search, Edit3, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getStoredDocuments, saveDocument, getDeletedDocumentIds, hasInvoiceForSalesOrder, deleteStoredDocument } from "@/lib/erp-storage";
import { useSalesDocuments } from "@/hooks/use-sales-store";
import { salesApi, normalizeSalesDocStatus } from "@/services/sales-api";
import { parseAmount } from "@/lib/formatters";

const initialSalesOrders = [];

export default function SalesOrdersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [storedOrders, setStoredOrders] = useState([]);

  const handleGenerateInvoice = React.useCallback(async (order) => {
    const numPart = order.id.replace(/^[A-Z]+-/, "");
    const invoiceRefNo = "INV-" + numPart;

    if (hasInvoiceForSalesOrder(order.id)) {
      toast.info(
        `Invoice ${invoiceRefNo} already exists for ${order.id}. Only 1 invoice can be created per Sales Order.`
      );
      return;
    }

    const dateToday = new Date().toISOString().slice(0, 10);
    const rawAmt = order.numericAmount || parseAmount(order.amount) || 0;

    const payload = {
      id: Date.now(),
      type: "invoice",
      refNo: invoiceRefNo,
      salesOrderNo: order.id,
      poNumber: order.id,
      customer: order.customer,
      customerId: "INV",
      date: dateToday,
      dueDate: dateToday,
      amount: order.amount || "₹0.00",
      balance: order.amount || "₹0.00",
      numericAmount: rawAmt,
      grandTotal: rawAmt,
      subtotal: rawAmt / 1.18,
      taxTotal: rawAmt - rawAmt / 1.18,
      status: "UNPAID",
      currency: "INR (₹)",
      isOverdue: false,
      items: Array.isArray(order.items) && order.items.length > 0
        ? order.items.map((it, idx) => ({
            description: it.description || `Item ${idx + 1}`,
            qty: Number(it.qty) || 1,
            unit: it.unit || "",
            listPrice: Number(it.listPrice || it.unitPrice || 0),
            discRupees: Number(it.discRupees || 0),
            taxPercent: Number(it.taxPercent || 18),
          }))
        : [{ description: "Standard Equipment", qty: 1, listPrice: Math.round((rawAmt / 1.18) * 100) / 100, taxPercent: 18 }],
    };

    try {
      await salesApi.createDocument(payload);
      toast.success(`Generated Invoice ${invoiceRefNo} directly from Sales Order ${order.id}`);
    } catch (e) {
      toast.error("Failed to generate invoice: " + (e?.message || ""));
    }
  }, []);

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "order");
      setStoredOrders(
        docs.map((d) => ({
          id: d.refNo,
          customer: d.customer,
          date: d.date,
          amount: d.amount,
          status: normalizeSalesDocStatus(d.status, "sales_order") || "PENDING",
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

  const { data: rawApiOrders = [] } = useSalesDocuments({ type: "sales_order" });
  const deletedIds = getDeletedDocumentIds();

  const allOrders = useMemo(() => {
    const apiDocs = Array.isArray(rawApiOrders) ? rawApiOrders : [];
    const map = new Map();

    storedOrders.forEach((ord) => {
      const key = ord.id || ord.refNo;
      if (key && !deletedIds.includes(key)) {
        map.set(key, ord);
      }
    });

    apiDocs.forEach((d) => {
      const key = d.refNo || d.id;
      if (key && !deletedIds.includes(key)) {
        map.set(key, {
          id: d.refNo || d.id,
          customer: d.customer,
          date: d.date || "Recent",
          amount: `₹${Number(d.grandTotal || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          status: normalizeSalesDocStatus(d.status, "sales_order") || "PENDING",
          items: d.items || [],
        });
      }
    });

    return Array.from(map.values());
  }, [storedOrders, rawApiOrders, deletedIds]);

  const filteredOrders = allOrders.filter((ord) => {
    if (statusFilter !== "All") {
      const oStatus = normalizeSalesDocStatus(ord.status, "sales_order");
      if (oStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.id.toLowerCase().includes(q) ||
        ord.customer.toLowerCase().includes(q) ||
        ord.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Sales Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Sales Orders
          </h1>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Create Sales Order</span>
        </button>
      </div>

      <SalesTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
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
              onClick={() => toast.info("Sorted sales orders by date descending")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {isFilterBarOpen && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter Sales Orders
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
                  placeholder="Search order number or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {["All", "PENDING", "APPROVED", "DELIVERED", "DRAFT", "CANCELLED"].map((st) => (
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
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3 px-4">ORDER NO</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 text-blue-600 font-extrabold">{order.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{order.customer}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{order.date}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black ${
                          order.status === "APPROVED"
                            ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : order.status === "DELIVERED"
                            ? "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                            : order.status === "CANCELLED"
                            ? "bg-rose-100/80 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : order.status === "DRAFT"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-blue-100/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {hasInvoiceForSalesOrder(order.id) ? (
                          <button
                            onClick={() => handleGenerateInvoice(order)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition"
                            title="Invoice has already been created for this sales order"
                          >
                            <CheckCircle2 size={13} />
                            <span>Invoice Created</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateInvoice(order)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                            title="Generate Invoice directly from this order"
                          >
                            <FileText size={13} />
                            <span>Create Invoice</span>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                        >
                          <Edit3 size={13} className="text-blue-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteStoredDocument(order.id);
                            toast.success(`Deleted Sales Order ${order.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                          title="Delete Sales Order"
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
                  <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                    No sales orders found. Click &quot;+ Sales Order&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position={drawerPosition}
        title="Sales Overview"
        size="md"
      >
        {selectedOrder ? (
          <SalesDrawerContent
            customerData={{
              name: selectedOrder.customer,
              type: "Manufacturing & Dist.",
              initial: selectedOrder.customer?.charAt(0) || "C",
              balance: selectedOrder.amount,
              overdueDays: 0,
            }}
          />
        ) : null}
      </Drawer>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <EditDocumentModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        document={editingOrder}
      />
    </div>
  );
}
