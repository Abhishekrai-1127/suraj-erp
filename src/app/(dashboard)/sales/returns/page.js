"use client";

import React, { useState } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import QuickAddModal from "@/components/sales/quick-add-modal";
import { Plus, RotateCcw, Filter } from "lucide-react";

export default function ReturnsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Returns</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Sales Returns & Credit Notes
          </h1>
        </div>

        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
        >
          <Plus size={16} />
          <span>New Credit Note</span>
        </button>
      </div>

      <SalesTabNav />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">RETURN REF</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">RETURN DATE</th>
                <th className="py-3 px-4">REASON</th>
                <th className="py-3 px-4">CREDIT AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr onClick={() => setIsDrawerOpen(true)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <td className="py-3.5 px-4 text-rose-600 font-extrabold font-mono">RET-2024-009</td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">Acme Corp Ltd</td>
                <td className="py-3.5 px-4 text-slate-600">May 11, 2024</td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">Damaged in Transit</td>
                <td className="py-3.5 px-4 text-rose-600 font-black">₹1,150.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Sales Overview">
        <SalesDrawerContent />
      </Drawer>
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
}
