"use client";

import React, { useState, useEffect } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import QuickAddModal from "@/components/sales/quick-add-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { Plus, Filter, ArrowUpDown, Search, Edit3, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getStoredDocuments, saveDocument, getDeletedDocumentIds, hasInvoiceForSalesOrder } from "@/lib/erp-storage";

const initialSalesOrders = [
  { id: "SO-2024-992", customer: "Acme Corp Ltd", date: "May 14, 2024", amount: "₹14,500.00", status: "IN PROCESS" },
  { id: "SO-2024-991", customer: "Vanguard Dynamics", date: "May 12, 2024", amount: "₹45,600.00", status: "READY FOR DISPATCH" },
  { id: "SO-2024-990", customer: "Lumina Marketing", date: "May 10, 2024", amount: "₹8,900.00", status: "DISPATCHED" },
];

export default function SalesOrdersPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");
  const [selectedOrder, setSelectedOrder] = useState(initialSalesOrders[0]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [storedOrders, setStoredOrders] = useState([]);

  const handleGenerateInvoice = (order) => {
    const numPart = order.id.replace(/^[A-Z]+-/, "");
    const invoiceRefNo = "INV-" + numPart;

    if (hasInvoiceForSalesOrder(order.id)) {
      toast.info(
        `Invoice ${invoiceRefNo} already exists for ${order.id}. Only 1 invoice can be created per Sales Order.`
      );
      return;
    }

    const dateToday = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const timestamp = Date.now();

    saveDocument({
      id: timestamp,
      type: "invoice",
      refNo: invoiceRefNo,
      customer: order.customer,
      customerId: "INV",
      category: "General",
      initials: "INV",
      date: order.date || dateToday,
      dueDate: order.date || dateToday,
      amount: order.amount || "₹14,500.00",
      balance: order.amount || "₹14,500.00",
      numericAmount: 14500,
      status: "IN PROGRESS",
      isOverdue: false,
      poNumber: order.id,
      items: order.items || [
        {
          description: "Industrial Machinery Equipment & Components",
          hsnSac: "84145930",
          qty: 1,
          unit: "Nos",
          listPrice: 12288.14,
          discRupees: 0,
          taxPercent: 18,
        },
      ],
    });

    toast.success(`Generated Invoice ${invoiceRefNo} directly from Sales Order ${order.id}`);
  };

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "order");
      setStoredOrders(
        docs.map((d) => ({
          id: d.refNo,
          customer: d.customer,
          date: d.date,
          amount: d.amount,
          status: d.status || "IN PROCESS",
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

  const deletedIds = getDeletedDocumentIds();
  const allOrders = [...storedOrders, ...initialSalesOrders].filter(
    (ord) => !deletedIds.includes(ord.id) && !deletedIds.includes(ord.refNo)
  );

  const filteredOrders = allOrders.filter((ord) => {
    if (statusFilter !== "All" && ord.status !== statusFilter) return false;
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

              <div className="flex items-center gap-1">
                {["All", "IN PROCESS", "READY FOR DISPATCH", "DISPATCHED"].map((st) => (
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
              {filteredOrders.map((order) => (
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
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-blue-100/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
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
                    </div>
                  </td>
                </tr>
              ))}
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
        <SalesDrawerContent
          customerData={{
            name: selectedOrder.customer,
            type: "Manufacturing & Dist.",
            initial: selectedOrder.customer.charAt(0),
            balance: selectedOrder.amount,
            overdueDays: 5,
          }}
        />
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
