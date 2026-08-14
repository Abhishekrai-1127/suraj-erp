"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  PackagePlus,
  ArrowDownRight,
  SlidersHorizontal,
  ArrowRightLeft,
  Warehouse,
  Plus,
  Check,
  Edit3,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateInventoryEntry, DEFAULT_PRODUCTS, DEFAULT_WAREHOUSES } from "@/hooks/use-inventory-store";

export default function InventoryAddModal({ isOpen, onClose, initialTab = "product" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const createEntryMutation = useCreateInventoryEntry();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Product Form
  const [prodForm, setProdForm] = useState({
    name: "",
    sku: "SKU-" + Math.floor(1000 + Math.random() * 9000),
    category: "Mechanical Parts",
    warehouse: "Suraj Main Factory Warehouse (Bay A)",
    stock: "100",
    minReorder: "20",
    unitPrice: "2500",
    unit: "Units",
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomWarehouse, setIsCustomWarehouse] = useState(false);

  // Stock Inflow Form
  const [receiveForm, setReceiveForm] = useState({
    productName: "Industrial Gear Set X12",
    sku: "IG-1200-BL",
    warehouse: "Suraj Main Factory Warehouse (Bay A)",
    qty: "250",
    supplier: "Apex Industrial Solutions",
    batchNo: "BATCH-2024-099",
  });

  // Adjustment Form
  const [adjustForm, setAdjustForm] = useState({
    productName: "Fiber Laser Optic Lens 50mm",
    warehouse: "Suraj Main Factory Warehouse (Bay D)",
    type: "Audit Count Discrepancy",
    qtyChange: "-2",
    reason: "Damaged during physical stock count verification",
  });

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    productName: "HDPE Raw Pellets (Grade A)",
    sourceWarehouse: "Suraj Main Factory Warehouse (Bay C)",
    targetWarehouse: "Suraj Main Factory Warehouse (Bay A)",
    qty: "50",
    unit: "Bags",
    carrier: "Internal Plant Forklift #02",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === "product") {
      if (!prodForm.name.trim()) {
        toast.error("Please enter a valid product name!");
        return;
      }

      const newProduct = {
        id: "PROD-" + Date.now(),
        name: prodForm.name,
        sku: prodForm.sku,
        category: prodForm.category,
        warehouse: prodForm.warehouse,
        stock: parseInt(prodForm.stock || "0", 10),
        minReorder: parseInt(prodForm.minReorder || "10", 10),
        unitPrice: parseFloat(prodForm.unitPrice || "0"),
        unit: prodForm.unit,
        status: parseInt(prodForm.stock || "0", 10) === 0 ? "OUT OF STOCK" : "IN STOCK",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80",
      };

      const newMovement = {
        id: "MOV-" + Date.now(),
        productName: prodForm.name,
        sku: prodForm.sku,
        warehouse: prodForm.warehouse,
        type: "STOCK IN",
        quantity: `+${prodForm.stock} ${prodForm.unit}`,
        dateTime: new Date().toLocaleString(),
        user: "Admin Account",
        status: "Completed",
      };

      createEntryMutation.mutate({ type: "product", data: newProduct, movement: newMovement });
      toast.success(`Product ${prodForm.name} added to inventory!`);
    } else if (activeTab === "receive") {
      const newMovement = {
        id: "MOV-" + Date.now(),
        productName: receiveForm.productName,
        sku: receiveForm.sku,
        warehouse: receiveForm.warehouse,
        type: "STOCK IN",
        quantity: `+${receiveForm.qty} Units`,
        dateTime: new Date().toLocaleString(),
        user: "Admin Account",
        status: "Completed",
      };
      createEntryMutation.mutate({ type: "movement", movement: newMovement });
      toast.success(`Received ${receiveForm.qty} units into ${receiveForm.warehouse}!`);
    } else if (activeTab === "adjust") {
      const newMovement = {
        id: "MOV-" + Date.now(),
        productName: adjustForm.productName,
        sku: "SKU-AUDIT",
        warehouse: adjustForm.warehouse,
        type: "STOCK OUT",
        quantity: `${adjustForm.qtyChange} Units`,
        dateTime: new Date().toLocaleString(),
        user: "Auditor Account",
        status: "Completed",
      };
      createEntryMutation.mutate({ type: "movement", movement: newMovement });
      toast.success(`Stock adjustment recorded for ${adjustForm.productName}!`);
    } else if (activeTab === "transfer") {
      const newMovement = {
        id: "MOV-" + Date.now(),
        productName: transferForm.productName,
        sku: "SKU-TRANSFER",
        warehouse: `${transferForm.sourceWarehouse} -> ${transferForm.targetWarehouse}`,
        type: "TRANSFER",
        quantity: `${transferForm.qty} ${transferForm.unit}`,
        dateTime: new Date().toLocaleString(),
        user: "Logistics Officer",
        status: "In Transit",
      };
      createEntryMutation.mutate({ type: "movement", movement: newMovement });
      toast.success(`Transfer of ${transferForm.qty} ${transferForm.unit} initiated!`);
    }

    onClose();
  };

  const tabs = [
    { id: "product", label: "Add Product", icon: PackagePlus },
    { id: "receive", label: "Receive Stock", icon: ArrowDownRight },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25 shrink-0">
              <PackagePlus size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                New Inventory Entry
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                Register products and record stock inflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-1.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
          
          {/* TAB 1: ADD PRODUCT */}
          {activeTab === "product" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product / Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Industrial Gear Set X12"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SKU Code / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* CATEGORY WITH MANUAL INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Product Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomCategory ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomCategory ? "Select list" : "Type custom"}</span>
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom product category..."
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Mechanical Parts">Mechanical Parts</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Raw Polymers">Raw Polymers</option>
                      <option value="Laser Optics">Laser Optics</option>
                      <option value="Cutting Tools">Cutting Tools</option>
                    </select>
                  )}
                </div>

                {/* WAREHOUSE LOCATION WITH MANUAL INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Warehouse Location
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomWarehouse(!isCustomWarehouse)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomWarehouse ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomWarehouse ? "Select list" : "Type custom"}</span>
                    </button>
                  </div>

                  {isCustomWarehouse ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom warehouse location..."
                      value={prodForm.warehouse}
                      onChange={(e) => setProdForm({ ...prodForm, warehouse: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={prodForm.warehouse}
                      onChange={(e) => setProdForm({ ...prodForm, warehouse: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Suraj Main Factory Warehouse (Bay A)">Suraj Main Factory Warehouse (Bay A - Raw Materials)</option>
                      <option value="Suraj Main Factory Warehouse (Bay B)">Suraj Main Factory Warehouse (Bay B - Machined Parts)</option>
                      <option value="Suraj Main Factory Warehouse (Bay C)">Suraj Main Factory Warehouse (Bay C - Finished Goods)</option>
                      <option value="Suraj Main Factory Warehouse (Bay D)">Suraj Main Factory Warehouse (Bay D - Toolroom)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Reorder Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodForm.minReorder}
                    onChange={(e) => setProdForm({ ...prodForm, minReorder: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.unitPrice}
                    onChange={(e) => setProdForm({ ...prodForm, unitPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Measurement Unit (Type manually)
                  </label>
                  <input
                    type="text"
                    placeholder="Units / Pcs / Rolls / Bags / MT..."
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECEIVE STOCK */}
          {activeTab === "receive" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product / Item Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Select or type product name..."
                    value={receiveForm.productName}
                    onChange={(e) => setReceiveForm({ ...receiveForm, productName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Receiving Warehouse Location
                  </label>
                  <input
                    type="text"
                    required
                    value={receiveForm.warehouse}
                    onChange={(e) => setReceiveForm({ ...receiveForm, warehouse: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity Received (+ Inflow)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiveForm.qty}
                    onChange={(e) => setReceiveForm({ ...receiveForm, qty: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier / Source Firm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Industrial Solutions"
                    value={receiveForm.supplier}
                    onChange={(e) => setReceiveForm({ ...receiveForm, supplier: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              <Check size={16} className="stroke-[3]" />
              <span>Submit Inventory Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
