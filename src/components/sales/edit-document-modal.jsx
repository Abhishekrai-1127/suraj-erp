"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Edit3, Trash2, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import { updateStoredDocument, deleteStoredDocument } from "@/lib/erp-storage";
import { salesApi, normalizeSalesDocStatus } from "@/services/sales-api";

export default function EditDocumentModal({ isOpen, onClose, document: docData, onUpdated }) {
  const [form, setForm] = useState({
    id: "",
    customer: "",
    date: "",
    dueDate: "",
    amount: "",
    balance: "",
    status: "",
    paymentMethod: "",
    partyOrderNo: "",
    itemsCount: "",
    notes: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (docData) {
      setForm({
        id: docData.id || docData.refNo || "",
        customer: docData.customer || "",
        date: docData.date || docData.dispatchDate || "",
        dueDate: docData.dueDate || docData.validUntil || "",
        amount: docData.amount || "",
        balance: docData.balance || "",
        status: normalizeSalesDocStatus(docData.status, docData.type) || "PENDING",
        paymentMethod: docData.paymentMethod || docData.method || "Bank Transfer",
        partyOrderNo: docData.partyOrderNo || docData.poNumber || "",
        itemsCount: docData.itemsCount || "",
        notes: docData.notes || "",
      });

      if (Array.isArray(docData.items) && docData.items.length > 0) {
        setItems(
          docData.items.map((item) => ({
            description: item.description || item.name || "",
            qty: item.qty || item.quantity || 1,
            unit: item.unit || "",
            listPrice: item.listPrice || item.rate || item.unitPrice || 0,
            hsnSac: item.hsnSac || item.hsn || "",
            taxPercent: item.taxPercent || item.tax || 18,
          }))
        );
      } else {
        const parsedAmount =
          parseFloat(String(docData.amount || "0").replace(/[^0-9.]/g, "")) || 0;
        setItems([
          {
            description: docData.description || "",
            qty: 1,
            unit: "",
            listPrice: parsedAmount > 0 ? Math.round(parsedAmount / 1.18) : 0,
            hsnSac: "",
            taxPercent: 18,
          },
        ]);
      }
    }
  }, [docData]);

  if (!isOpen || !docData) return null;

  const docId = docData.id || docData.refNo || "DOCUMENT";
  const docType =
    docId.startsWith("INV")
      ? "Invoice"
      : docId.startsWith("PAY")
      ? "Payment"
      : docId.startsWith("DC")
      ? "Delivery Challan"
      : docId.startsWith("QT")
      ? "Quotation"
      : docId.startsWith("ORD") || docId.startsWith("SO")
      ? "Sales Order"
      : docId.startsWith("RET")
      ? "Sales Return"
      : "Document";

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        qty: 1,
        unit: "",
        listPrice: 0,
        hsnSac: "",
        taxPercent: 18,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      toast.warning("A document must have at least one line item.");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const recalculateTotal = () => {
    let subtotal = 0;
    let totalTax = 0;
    items.forEach((item) => {
      const q = parseFloat(item.qty) || 0;
      const p = parseFloat(item.listPrice) || 0;
      const t = parseFloat(item.taxPercent) || 0;
      const itemSub = q * p;
      subtotal += itemSub;
      totalTax += itemSub * (t / 100);
    });
    const grandTotal = Math.round(subtotal + totalTax);
    const formattedAmount = `₹${grandTotal.toLocaleString("en-IN")}.00`;
    const totalQty = items.reduce((acc, curr) => acc + (parseFloat(curr.qty) || 0), 0);

    setForm({
      ...form,
      amount: formattedAmount,
      itemsCount: `${totalQty} Units (${items.length} Items)`,
    });
    toast.info(`Updated total to ${formattedAmount} across ${items.length} items.`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Document must contain at least one line item before saving!");
      return;
    }
    const updated = {
      ...docData,
      customer: form.customer,
      date: form.date,
      dueDate: form.dueDate,
      dispatchDate: form.date,
      validUntil: form.dueDate,
      amount: form.amount,
      balance: form.balance,
      status: normalizeSalesDocStatus(form.status, docData.type),
      paymentMethod: form.paymentMethod,
      method: form.paymentMethod,
      partyOrderNo: form.partyOrderNo,
      itemsCount: form.itemsCount || `${items.length} Items`,
      notes: form.notes,
      items: items,
    };

    updateStoredDocument(docId, updated);
    // Asynchronously synchronize with Central ERP Backend
    salesApi.updateDocument(docId, updated).catch((err) => {
      console.warn("[EditDocumentModal] Failed to sync update with backend:", err?.message);
    });

    toast.success(`${docType} ${docId} updated with ${items.length} items`);
    if (onUpdated) onUpdated(updated);
    onClose();
  };

  const handleDelete = () => {
    deleteStoredDocument(docId);
    salesApi.deleteDocument(docId).catch((err) => {
      console.warn("[EditDocumentModal] Failed to sync deletion with backend:", err?.message);
    });

    toast.success(`Deleted ${docType} ${docId}`);
    if (onUpdated) onUpdated(null);
    onClose();
  };

  const getStatusOptions = () => {
    switch (docType) {
      case "Invoice":
        return ["UNPAID", "PAID", "DRAFT", "CANCELLED"];
      case "Payment":
        return ["PENDING", "PAID", "CANCELLED"];
      case "Delivery Challan":
        return ["DELIVERED", "PENDING", "DRAFT", "CANCELLED"];
      case "Quotation":
        return ["PENDING", "APPROVED", "DRAFT", "CANCELLED"];
      case "Sales Order":
        return ["PENDING", "APPROVED", "DELIVERED", "DRAFT", "CANCELLED"];
      default:
        return ["PENDING", "APPROVED", "DRAFT", "CANCELLED"];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit {docType}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-500">{docId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Document Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {getStatusOptions().map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {docType === "Delivery Challan" ? "Dispatch Date" : "Date"}
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {(docType === "Invoice" || docType === "Quotation") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {docType === "Quotation" ? "Valid Until" : "Due Date"}
                </label>
                <input
                  type="text"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {docType !== "Delivery Challan" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {docType === "Invoice" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Balance Remaining
                </label>
                <input
                  type="text"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {docType === "Payment" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            )}

            {docType === "Delivery Challan" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Party Order No
                  </label>
                  <input
                    type="text"
                    value={form.partyOrderNo}
                    onChange={(e) => setForm({ ...form, partyOrderNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Items Count
                  </label>
                  <input
                    type="text"
                    value={form.itemsCount}
                    onChange={(e) => setForm({ ...form, itemsCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

          </div>

          {/* Line Items Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Document Line Items ({items.length})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {docType !== "Delivery Challan" && (
                  <button
                    type="button"
                    onClick={recalculateTotal}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[11px] font-bold transition"
                  >
                    Auto-Calculate Total
                  </button>
                )}
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Item Description / Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        placeholder="Item description..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        HSN / SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(idx, "hsnSac", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Unit Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.listPrice}
                        onChange={(e) => handleItemChange(idx, "listPrice", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Tax % (GST)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="28"
                        value={item.taxPercent}
                        onChange={(e) => handleItemChange(idx, "taxPercent", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Internal Reference
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Additional remarks or update notes..."
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition"
            >
              <Trash2 size={14} />
              <span>Delete Document</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
