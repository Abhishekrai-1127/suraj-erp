"use client";

import React, { useState } from "react";
import { Download, Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import PurchaseAddModal from "@/components/purchase/purchase-add-modal";

export default function PurchaseHeader({
  title = "Purchase Management",
  subtitle = "Manage vendor RFOs (Request For Order), purchase bills, and procurement analytics.",
  initialTab = "bill",
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        {/* Left Title */}
        <div className="space-y-1 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Purchase Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => toast.success("Purchase report exported successfully!")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition cursor-pointer"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          <button
            onClick={() => toast.info("Importing purchase records...")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition cursor-pointer"
          >
            <Upload size={15} />
            <span>Import</span>
          </button>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Create Purchase Record</span>
          </button>
        </div>
      </div>

      <PurchaseAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={initialTab}
      />
    </>
  );
}
