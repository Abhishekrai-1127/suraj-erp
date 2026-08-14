"use client";

import React, { useEffect, useState } from "react";
import TallyInvoicePreview from "@/components/invoice/tally-invoice-preview";
import { initialInvoiceData } from "@/lib/invoiceData";
import { downloadInvoicePDF } from "@/lib/printInvoice";
import { Printer, Download, X, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function PrintInvoicePage() {
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("active_tally_print_invoice");
      if (stored) {
        setInvoiceData(JSON.parse(stored));
      } else {
        setInvoiceData(initialInvoiceData);
      }
    } catch (e) {
      setInvoiceData(initialInvoiceData);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const toastId = toast.loading("Generating PDF download...");
    try {
      await downloadInvoicePDF(invoiceData);
      toast.success("Downloaded PDF successfully!", { id: toastId });
    } catch (e) {
      toast.error("Failed to download PDF", { id: toastId });
    }
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.close();
    } else {
      window.location.href = "/sales/invoices";
    }
  };

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-sm font-semibold animate-pulse">Loading Invoice...</div>
      </div>
    );
  }

  return (
    <div className="print-page-wrapper min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Floating Top Control Bar (Hidden during print) */}
      <div className="no-print sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Tax Invoice #{invoiceData.invoice?.number}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Standalone Print View &bull; {invoiceData.billing?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition active:scale-95"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Tab"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Print Container with generous bottom padding for screen, reset during print */}
      <div className="print-container flex-1 px-4 py-8 sm:px-8 sm:py-12 flex justify-center items-start overflow-y-auto pb-20">
        <TallyInvoicePreview data={invoiceData} />
      </div>
    </div>
  );
}
