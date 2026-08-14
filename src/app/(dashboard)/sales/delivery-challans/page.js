"use client";

import React, { useState, useEffect } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import QuickAddModal from "@/components/sales/quick-add-modal";
import EditDocumentModal from "@/components/sales/edit-document-modal";
import { Plus, Filter, Download, Search, Edit3 } from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";
import { downloadChallanPDF } from "@/lib/printChallan";
import { toast } from "sonner";

const initialChallans = [
  {
    id: "DC-2024-001",
    customer: "Acme Corp Ltd",
    date: "May 12, 2024",
    itemsCount: "1 Unit",
    status: "DELIVERED",
    partyOrderNo: "PO-88912-X",
    items: [
      { description: "Industrial Machinery Equipment & Components", qty: 1, unit: "Nos", note: "Heavy Duty Blower Motor" }
    ]
  },
  {
    id: "DC-2024-002",
    customer: "Global Logistics SA",
    date: "May 10, 2024",
    itemsCount: "4 Units",
    status: "DELIVERED",
    partyOrderNo: "PO-99120-A",
    items: [
      { description: "Industrial Heavy Duty Butterfly Valve 6 Inch", qty: 4, unit: "Pcs", note: "Standard Valve Assembly" }
    ]
  },
  {
    id: "DC-2024-003",
    customer: "Starlight Ventures",
    date: "May 08, 2024",
    itemsCount: "2 Units",
    status: "IN TRANSIT",
    partyOrderNo: "PO-44102-B",
    items: [
      { description: "High Pressure Axial Flow Fan", qty: 2, unit: "Nos", note: "Direct Dispatch" }
    ]
  },
  {
    id: "DC-2024-004",
    customer: "Nexus Systems",
    date: "May 05, 2024",
    itemsCount: "1 Unit",
    status: "DELIVERED",
    partyOrderNo: "PO-10294-C",
    items: [
      { description: "Industrial Heating Pumping Unit", qty: 1, unit: "Set", note: "Factory Packed" }
    ]
  }
];

export default function DeliveryChallansPage() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingChallan, setEditingChallan] = useState(null);
  const [storedChallans, setStoredChallans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "challan");
      setStoredChallans(
        docs.map((d) => ({
          id: d.refNo,
          customer: d.customer,
          date: d.date || d.dispatchDate,
          itemsCount: d.itemsCount || `${(d.items || []).length || 1} Units`,
          status: d.status || "DELIVERED",
          partyOrderNo: d.partyOrderNo || d.poNumber || "PO-88912-X",
          items: d.items,
          address: d.address,
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

  const allChallans = [...storedChallans, ...initialChallans];

  const filteredChallans = allChallans.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.customer.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-10">
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
            Delivery challans auto-generated directly upon invoice creation.
          </p>
        </div>

        {/* New Challan button — commented out
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
        >
          <Plus size={16} />
          <span>New Challan</span>
        </button>
        */}
      </div>

      <SalesTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search challan number, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Showing {filteredChallans.length} of {allChallans.length} Challans
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
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
              {filteredChallans.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={async () => {
                        const toastId = toast.loading(`Generating ${row.id}...`);
                        try {
                          await downloadChallanPDF(row);
                          toast.success(`Downloaded ${row.id}.pdf`, { id: toastId });
                        } catch (e) {
                          toast.error("Failed to generate Challan PDF", { id: toastId });
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
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingChallan(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                      >
                        <Download size={13} className="text-blue-600" />
                        <span>Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <EditDocumentModal
        isOpen={!!editingChallan}
        onClose={() => setEditingChallan(null)}
        document={editingChallan}
      />
    </div>
  );
}
