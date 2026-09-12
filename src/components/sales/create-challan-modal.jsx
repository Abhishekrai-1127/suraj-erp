"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Truck, Plus, Trash2, Check, Search, ChevronDown, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { saveDocument, getStoredCustomers } from "@/lib/erp-storage";
import { useCrmCustomers } from "@/hooks/use-crm-store";
import { salesApi, generateLocalSequentialRefNo } from "@/services/sales-api";

/**
 * Modal dialog to create new Delivery Challans with sequential reference numbering,
 * customer account autocomplete, and customizable line items.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility flag
 * @param {Function} props.onClose - Dismissal callback
 * @param {Function} [props.onCreated] - Success callback
 */
export default function CreateChallanModal({ isOpen, onClose, onCreated }) {
  const [refNo, setRefNo] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [dispatchDate, setDispatchDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [partyOrderNo, setPartyOrderNo] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [status, setStatus] = useState("DELIVERED");

  const [items, setItems] = useState([
    { id: "1", description: "", qty: 1, unit: "" },
  ]);

  // Fetch live CRM customer records
  const { data: crmData } = useCrmCustomers({ limit: 100 });

  // Autocomplete accounts list combining CRM and stored customers
  const customerSuggestions = React.useMemo(() => {
    const list = [];
    const seen = new Set();

    if (crmData?.customers && Array.isArray(crmData.customers)) {
      crmData.customers.forEach((c) => {
        const name = c.company || c.name || "";
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            name,
            company: c.company || "",
            code: c.code || "",
            address: c.billingAddress || c.address || "",
            type: "Customer",
          });
        }
      });
    }

    const localCusts = getStoredCustomers();
    localCusts.forEach((c) => {
      const name = c.companyName || c.name || "";
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          name,
          company: c.companyName || "",
          code: c.code || "",
          address: c.shippingAddress || c.billingAddress || "",
          type: "Customer",
        });
      }
    });

    if (!customerSearch.trim()) return list.slice(0, 8);
    const q = customerSearch.toLowerCase();
    return list
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [crmData, customerSearch]);

  // Fetch sequential reference number and reset form on open
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isOpen) {
      salesApi.getNextRefNo("delivery_challan").then((next) => {
        setRefNo(next || generateLocalSequentialRefNo("delivery_challan"));
      });
      setDispatchDate(new Date().toISOString().split("T")[0]);
      setPartyOrderNo("");
      setCustomerSearch("");
      setSelectedCustomer(null);
      setShippingAddress("");
      setStatus("DISPATCHED");
      setItems([{ id: "1", description: "", qty: 1, unit: "" }]);
    }
  }, [isOpen]);

  // Handle outside click for customer dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: "", qty: 1, unit: "" },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      toast.warning("Delivery challan must have at least one line item.");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerName = selectedCustomer ? selectedCustomer.name : customerSearch.trim();

    if (!customerName) {
      toast.error("Please specify a customer name.");
      return;
    }

    const payload = {
      id: refNo,
      refNo: refNo,
      type: "delivery_challan",
      customer: customerName,
      customerId: selectedCustomer?.code || selectedCustomer?.id || "DC",
      gstin: selectedCustomer?.gst || selectedCustomer?.taxId || undefined,
      placeOfSupply: shippingAddress || selectedCustomer?.billingAddress || undefined,
      date: dispatchDate,
      dispatchDate: dispatchDate,
      partyOrderNo: partyOrderNo,
      address: shippingAddress || "",
      status: status || "DELIVERED",
      itemsCount: `${items.length} ${items.length === 1 ? "Item" : "Items"}`,
      items: items.map((i, idx) => ({
        description: i.description || `Item ${idx + 1}`,
        qty: Number(i.qty) || 1,
        unit: i.unit || "",
        listPrice: Number(i.listPrice || i.unitPrice || 0),
        taxPercent: 0,
      })),
      subtotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      currency: "INR (₹)",
    };

    try {
      await salesApi.createDocument(payload);
      toast.success(`Delivery Challan ${refNo} created successfully!`);
      if (onCreated) onCreated(payload);
      onClose();
    } catch (err) {
      toast.error("Failed to save delivery challan: " + (err?.message || "Storage error"));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl my-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create Delivery Challan
              </h2>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Official goods dispatch and proof-of-transit note
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Row 1: Challan Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Challan Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Dispatch Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="DELIVERED">DELIVERED</option>
                <option value="PENDING">PENDING</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Row 2: Customer Autocomplete */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Customer / Recipient <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Search or enter customer name..."
                value={selectedCustomer ? selectedCustomer.name : customerSearch}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setSelectedCustomer(null);
                  setIsCustomerDropdownOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Suggestions Dropdown */}
            {isCustomerDropdownOpen && customerSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 divide-y divide-slate-100 dark:divide-slate-800">
                {customerSuggestions.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerSearch(c.name);
                      if (c.address) setShippingAddress(c.address);
                      setIsCustomerDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-blue-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{c.code || "Account"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Dispatch Date & Party Order No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Dispatch Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Party Order / PO Reference
              </label>
              <input
                type="text"
                placeholder="e.g. PO-88912-X or SO-2026-0001"
                value={partyOrderNo}
                onChange={(e) => setPartyOrderNo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Shipping Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Delivery / Shipping Address
            </label>
            <input
              type="text"
              placeholder="e.g. Plot No. 42, Phase-II, Mayapuri Industrial Area, New Delhi"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Dispatched Line Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 text-xs font-bold transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Description / Goods</th>
                    <th className="py-2 px-3 w-24">Qty</th>
                    <th className="py-2 px-3 w-24">Unit</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          placeholder="Item name / goods description"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-center text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                          className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <Check size={14} />
              Create Delivery Challan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
