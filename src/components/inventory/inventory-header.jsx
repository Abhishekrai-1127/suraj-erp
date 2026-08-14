"use client";

import React, { useState } from "react";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import InventoryAddModal from "@/components/inventory/inventory-add-modal";

export default function InventoryHeader({
  title = "Inventory Management",
  subtitle = "Manage products, warehouses, stock movement, inventory valuation and manufacturing materials in real-time.",
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState("product");

  const handleOpenModal = (tab = "product") => {
    setModalInitialTab(tab);
    setIsAddModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Global View</span>
            <span>•</span>
            <span>Transfer Orders</span>
            <span>•</span>
            <span>Adjustments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-3xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => toast.success("Inventory stock report exported successfully!")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition"
          >
            <Download size={15} />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => handleOpenModal("product")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      <InventoryAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialTab={modalInitialTab}
      />
    </>
  );
}
