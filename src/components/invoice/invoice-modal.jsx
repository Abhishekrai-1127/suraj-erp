"use client";

import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import TallyInvoicePreview from "./tally-invoice-preview";
import { mapErpInvoiceToTally } from "@/lib/invoiceData";
import { openInvoiceInNewTab } from "@/lib/printInvoice";
import { toast } from "sonner";

export default function InvoiceModal({ isOpen, onClose, invoiceData }) {
  if (!isOpen) return null;

  const tallyData = mapErpInvoiceToTally(invoiceData);

  const handlePrint = () => {
    openInvoiceInNewTab(invoiceData);
  };

  return (
    <div className="tally-modal-overlay fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      {/* Modal Toolbar (hidden during print) */}
      <div className="invoice-modal-toolbar no-print flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Tax Invoice Preview (Tally GST Format)
            </h3>
            <p className="text-xs text-slate-400">
              Invoice #{tallyData.invoice.number} &bull; {tallyData.billing.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
            title="Open invoice in new tab for printing / saving as PDF"
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Container with Invoice Preview */}
      <div className="tally-modal-body flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
        <TallyInvoicePreview data={tallyData} />
      </div>
    </div>
  );
}
