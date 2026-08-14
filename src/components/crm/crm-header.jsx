"use client";

import React, { useRef } from "react";
import { Upload, Download, Plus, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

export function CrmHeader({
  activeTab,
  onAddClick,
  onExport,
  onImport,
  viewMode,
  onViewModeChange,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onImport) onImport(file);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>CRM</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold capitalize">
            {activeTab || "Overview"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Customer Relationship Management
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.json"
          className="hidden"
        />

        {/* View Mode Switcher (List vs Kanban for Leads/Deals) */}
        {(activeTab === "Leads" || activeTab.startsWith("Deals")) && onViewModeChange && (
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
              title="Table List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("kanban")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
              title="Kanban Pipeline View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
        >
          <Upload size={15} className="text-slate-500" />
          <span>Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
        >
          <Download size={15} className="text-slate-500" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/25 transition active:scale-95"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>Add Record</span>
        </button>
      </div>
    </div>
  );
}
