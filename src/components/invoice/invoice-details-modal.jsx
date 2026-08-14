"use client";

import React from "react";
import { X, Printer, Edit3, FileText, Package, Calendar, User, DollarSign, Download, CheckCircle2 } from "lucide-react";
import { mapErpInvoiceToTally } from "@/lib/invoiceData";
import { downloadInvoicePDF } from "@/lib/printInvoice";
import { toast } from "sonner";

export default function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  onEdit,
  onOpenTallyModal,
}) {
  if (!isOpen || !invoice) return null;

  const tallyData = mapErpInvoiceToTally(invoice);
  const items = tallyData.items || [];
  const invoiceId = invoice.id || invoice.refNo || "INV-0000";

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.qty * item.listPrice, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce(
      (acc, item) => acc + item.qty * item.listPrice * (item.taxPercent / 100),
      0
    );
  };

  const grandTotal = calculateSubtotal() + calculateTotalTax();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-black">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Invoice Details
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                  {invoice.status || "IN PROGRESS"}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-500">{invoiceId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(invoice);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
              >
                <Edit3 size={14} className="text-blue-600" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs font-semibold">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <User size={13} className="text-blue-500" />
                <span>CUSTOMER</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {tallyData.billing.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                GSTIN: {tallyData.billing.gstin}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-emerald-500" />
                <span>DATES</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300">
                Invoice Date: <span className="font-extrabold text-slate-900 dark:text-white">{tallyData.invoice.date}</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                Due Date: <span className="font-extrabold text-slate-900 dark:text-white">{invoice.dueDate || "Net 30"}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                <DollarSign size={13} className="text-amber-500" />
                <span>FINANCIAL RECAP</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {invoice.amount || `₹${grandTotal.toLocaleString("en-IN")}.00`}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Balance Due: <span className="font-bold text-rose-600">{invoice.balance || "₹0.00"}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Invoice Items List ({items.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                Showing quantity, rates & tax breakdown
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">ITEM NAME / DESCRIPTION</th>
                    <th className="py-2.5 px-3">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-center">QTY</th>
                    <th className="py-2.5 px-3 text-right">UNIT PRICE</th>
                    <th className="py-2.5 px-3 text-center">TAX %</th>
                    <th className="py-2.5 px-3 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {items.map((item, index) => {
                    const lineSubtotal = item.qty * item.listPrice;
                    const lineTax = lineSubtotal * (item.taxPercent / 100);
                    const lineTotal = lineSubtotal + lineTax;

                    return (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 text-slate-400 font-extrabold">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{item.hsnSac}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                          {item.qty} <span className="text-[10px] text-slate-400">{item.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          ₹{Number(item.listPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-extrabold">
                            {item.taxPercent}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white font-mono">
                          ₹{Math.round(lineTotal).toLocaleString("en-IN")}.00
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="text-[11px] font-bold text-slate-400">PAYMENT & REMITTANCE TERMS</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                Bank: {tallyData.bank.name} &bull; A/C: {tallyData.bank.accountNumber} &bull; IFSC: {tallyData.bank.ifsc}
              </div>
            </div>

            <div className="space-y-1 text-right w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">₹{Math.round(calculateSubtotal()).toLocaleString("en-IN")}.00</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span>GST Tax:</span>
                <span className="font-mono font-bold">₹{Math.round(calculateTotalTax()).toLocaleString("en-IN")}.00</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 text-sm text-slate-900 dark:text-white font-black pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                  ₹{Math.round(grandTotal).toLocaleString("en-IN")}.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const toastId = toast.loading(`Downloading ${invoiceId}...`);
                try {
                  await downloadInvoicePDF(invoice);
                  toast.success(`Downloaded ${invoiceId}.pdf`, { id: toastId });
                } catch (e) {
                  toast.error("Failed to generate PDF", { id: toastId });
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
            >
              <Download size={14} className="text-purple-500" />
              <span>Download PDF</span>
            </button>
            {onOpenTallyModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTallyModal(invoice);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <Printer size={14} />
                <span>Full Tally Print View</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
