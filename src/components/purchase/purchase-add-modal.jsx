"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Receipt,
  FileQuestion,
  Cpu,
  UserPlus,
  Plus,
  Trash2,
  Save,
  Search,
  ChevronDown,
  RotateCcw,
  Clock,
  Edit3,
  List,
  Check,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { saveDocument, saveCustomer, getStoredCustomers } from "@/lib/erp-storage";
import { useCreatePurchaseRecord } from "@/hooks/use-purchase-store";

// Master Vendor list for Autocomplete (Tailored for Procurement & Machinery)
const MOCK_VENDORS = [];

const DRAFT_STORAGE_PREFIX = "suraj_erp_purchase_draft_";

export default function PurchaseAddModal({ isOpen, onClose, initialTab = "bill" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const createRecordMutation = useCreatePurchaseRecord();

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Autocomplete Vendor state
  const [vendorSearch, setVendorSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Custom Input Toggles
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [isCustomMachCategory, setIsCustomMachCategory] = useState(false);
  const [isCustomMachLocation, setIsCustomMachLocation] = useState(false);
  const [isCustomBillTerms, setIsCustomBillTerms] = useState(false);
  const [isCustomVendorCategory, setIsCustomVendorCategory] = useState(false);
  const [isCustomVendorTerms, setIsCustomVendorTerms] = useState(false);

  // Line Items State for Purchasing (Raw Materials, Equipment, Components)
  const [items, setItems] = useState([
    { id: "1", description: "", hsnSac: "", qty: 1, unitPrice: 0, unit: "" },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18);

  // Purchase Bill Form Fields
  const [billForm, setBillForm] = useState(() => ({
    refNo: "PB-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
    billDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    paymentTerms: "Net 30 Days",
    vendorInvoiceNo: "",
    notes: "",
  }));

  // RFO (Request For Order) Form Fields
  const [rfoForm, setRfoForm] = useState(() => ({
    refNo: "RFO-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
    requestDate: new Date().toISOString().split("T")[0],
    targetDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    department: "Toolroom & Precision Machining",
    priority: "MEDIUM",
    justification: "",
  }));

  // Purchased Machinery Form Fields
  const [machineryForm, setMachineryForm] = useState(() => ({
    assetTag: "MAC-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
    name: "",
    model: "",
    category: "CNC Machining",
    purchaseDate: new Date().toISOString().split("T")[0],
    cost: "",
    warrantyExpiry: new Date(Date.now() + 365 * 2 * 86400000).toISOString().split("T")[0],
    location: "Bay A - Main Workshop",
    status: "OPERATIONAL",
  }));

  // Vendor Account Form Fields
  const [vendorForm, setVendorForm] = useState({
    companyName: "",
    code: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstId: "",
    category: "Machinery Supplier",
    creditLimit: "",
    paymentTerms: "Net 30 Days",
    billingAddress: "",
  });

  const [savedDraftInfo, setSavedDraftInfo] = useState(null);

  // Load draft from local storage for activeTab
  const loadDraft = (tab) => {
    if (typeof window === "undefined") return;
    try {
      const storedData = localStorage.getItem(DRAFT_STORAGE_PREFIX + tab);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed) {
          if (parsed.selectedVendor) setSelectedVendor(parsed.selectedVendor);
          if (parsed.vendorSearch) setVendorSearch(parsed.vendorSearch);
          if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
          if (parsed.discountPercent !== undefined) setDiscountPercent(parsed.discountPercent);
          if (parsed.taxPercent !== undefined) setTaxPercent(parsed.taxPercent);
          if (parsed.billForm) setBillForm(parsed.billForm);
          if (parsed.rfoForm) setRfoForm(parsed.rfoForm);
          if (parsed.machineryForm) setMachineryForm(parsed.machineryForm);
          if (parsed.vendorForm) setVendorForm(parsed.vendorForm);
          setSavedDraftInfo(parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : "Recently");
          return true;
        }
      }
    } catch (e) {
      console.error("Failed to load purchase draft", e);
    }
    setSavedDraftInfo(null);
    return false;
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const found = loadDraft(activeTab);
        if (found) {
          toast.info(`Restored saved draft for ${activeTab.toUpperCase()} purchase entry.`);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVendorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered vendor list
  const masterVendorList = [...MOCK_VENDORS, ...getStoredCustomers().map(c => ({
    id: c.id,
    name: c.name,
    code: c.code || "VN",
    category: c.category || "General Vendor",
    taxId: c.taxId || "GST-VENDOR"
  }))];

  const filteredVendors = masterVendorList.filter(
    (v) =>
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.code.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  // Line Items Calculation
  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  const discountAmount = (subtotal * (Number(discountPercent) || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (Number(taxPercent) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Item Table Mutators
  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", hsnSac: "", qty: 1, unitPrice: 0, unit: "" },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1 && activeTab !== "machinery" && activeTab !== "vendor") {
      toast.error("Purchase record must contain at least one raw item / component.");
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;

    const vendorToSave = selectedVendor || (vendorSearch ? { name: vendorSearch, code: "VN" } : null);

    if (!vendorToSave && activeTab !== "vendor") {
      toast.error("Please enter or select a vendor supplier before saving draft.");
      return;
    }

    const timestamp = new Date().toISOString();
    const draftPayload = {
      tab: activeTab,
      savedAt: timestamp,
      selectedVendor: vendorToSave,
      vendorSearch,
      items,
      discountPercent,
      taxPercent,
      billForm,
      rfoForm,
      machineryForm,
      vendorForm,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_PREFIX + activeTab, JSON.stringify(draftPayload));
      setSavedDraftInfo(new Date(timestamp).toLocaleTimeString());
      toast.success(`Purchase draft saved to Local Storage!`);
      onClose();
    } catch (err) {
      toast.error("Failed to save draft to local storage");
    }
  };

  const handleClearDraft = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_PREFIX + activeTab);
      setSavedDraftInfo(null);
      setSelectedVendor(null);
      setVendorSearch("");
      toast.info(`Cleared saved draft for ${activeTab.toUpperCase()}`);
    } catch (e) {}
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const activeVendor = selectedVendor || (vendorSearch.trim() ? { name: vendorSearch.trim(), code: "VN" } : null);

    if (activeTab !== "vendor" && activeTab !== "machinery" && !activeVendor) {
      toast.error("Please select or type a vendor supplier for this purchase record.");
      return;
    }

    if (activeTab !== "vendor" && activeTab !== "machinery" && items.length === 0) {
      toast.error("Please add at least one purchased item or raw material!");
      return;
    }

    if (activeTab === "vendor" && !vendorForm.companyName.trim()) {
      toast.error("Please enter a valid Vendor / Supplier company name!");
      return;
    }

    const formattedAmount = `₹${grandTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const dateToday = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const formattedItems = items.map((item) => ({
      description: item.description,
      hsnSac: item.hsnSac || "",
      qty: parseFloat(item.qty || 1),
      unit: item.unit || "",
      listPrice: parseFloat(item.unitPrice || 0),
      taxPercent: taxPercent || 18,
    }));

    const vendorName = activeVendor ? activeVendor.name : "Custom Vendor Supplier";
    const vendorCode = activeVendor ? (activeVendor.code || "PB") : "PB";

    let payload = null;

    if (activeTab === "bill") {
      payload = {
        id: Date.now(),
        type: "purchase_bill",
        refNo: billForm.refNo,
        vendor: vendorName,
        initials: vendorCode,
        date: dateToday,
        billDate: dateToday,
        dueDate: billForm.dueDate,
        amount: formattedAmount,
        numericAmount: grandTotal,
        status: "UNPAID",
        paymentStatus: "UNPAID",
        vendorInvoiceNo: billForm.vendorInvoiceNo,
        items: formattedItems,
      };
      toast.success(`Purchase Bill ${billForm.refNo} created successfully!`, {
        description: `Vendor: ${vendorName} • Total: ${formattedAmount}`,
      });
    } else if (activeTab === "rfo") {
      payload = {
        id: Date.now(),
        type: "rfo",
        refNo: rfoForm.refNo,
        vendor: vendorName,
        initials: vendorCode,
        date: dateToday,
        requestDate: dateToday,
        targetDeliveryDate: rfoForm.targetDeliveryDate,
        amount: formattedAmount,
        numericAmount: grandTotal,
        status: "PENDING APPROVAL",
        department: rfoForm.department,
        priority: rfoForm.priority,
        items: formattedItems,
      };
      toast.success(`Request For Order ${rfoForm.refNo} submitted successfully!`);
    } else if (activeTab === "machinery") {
      const macCostNum = parseFloat(machineryForm.cost) || 0;
      const formattedMacCost = `₹${macCostNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

      payload = {
        id: Date.now(),
        type: "purchased_machinery",
        assetTag: machineryForm.assetTag,
        refNo: machineryForm.assetTag,
        name: machineryForm.name,
        model: machineryForm.model,
        category: machineryForm.category,
        vendor: vendorName,
        initials: vendorCode,
        purchaseDate: machineryForm.purchaseDate,
        cost: formattedMacCost,
        warrantyExpiry: machineryForm.warrantyExpiry,
        location: machineryForm.location,
        status: machineryForm.status,
      };
      toast.success(`Purchased Machinery Asset ${machineryForm.assetTag} registered!`, {
        description: `${machineryForm.name} added to capital assets registry.`,
      });
    } else if (activeTab === "vendor") {
      payload = {
        type: "vendor",
        companyName: vendorForm.companyName || "New Vendor",
        name: vendorForm.companyName || "New Vendor",
        code: vendorForm.code || (vendorForm.companyName ? vendorForm.companyName.slice(0, 2).toUpperCase() : "VN"),
        category: vendorForm.category || "Machinery Supplier",
        gstId: vendorForm.gstId || "GST-VENDOR",
      };
      toast.success(`Vendor ${vendorForm.companyName} account registered successfully!`);
    }

    if (payload) {
      createRecordMutation.mutate(payload);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DRAFT_STORAGE_PREFIX + activeTab);
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
        window.dispatchEvent(new Event("suraj_erp_document_created"));
      } catch (err) {}
    }

    onClose();
  };

  const tabs = [
    { id: "bill", label: "Purchase Bill", icon: Receipt, buttonTitle: "Create Purchase Bill" },
    { id: "rfo", label: "Request For Order (RFO)", icon: FileQuestion, buttonTitle: "Submit RFO Request" },
    { id: "machinery", label: "Purchased Machinery", icon: Cpu, buttonTitle: "Register Machinery Asset" },
    { id: "vendor", label: "Vendor Account", icon: Building, buttonTitle: "Register Vendor" },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25 shrink-0">
              {React.createElement(currentTabObj.icon, { size: 20 })}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {currentTabObj.label} Record
                </h3>
                {savedDraftInfo && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                    <Clock size={11} />
                    Draft Restored ({savedDraftInfo})
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                Procurement, raw materials, & machinery purchase entry system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedDraftInfo && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <RotateCcw size={12} />
                <span>Discard Draft</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Tabs Selector */}
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

        {/* Dynamic Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
          
          {/* SEARCHABLE VENDOR AUTOCOMPLETE DROPDOWN WITH MANUAL TYPING OPTION */}
          {activeTab !== "vendor" && (
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Select or Type Vendor / Supplier Account <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                  {selectedVendor ? "✓ Selected from Master" : vendorSearch ? "✍ Custom Vendor Typed" : "Select or Type Manually"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type or select vendor name (e.g. Haas Automation India, Apex Industrial...)"
                  value={selectedVendor ? selectedVendor.name : vendorSearch}
                  onFocus={() => setIsVendorDropdownOpen(true)}
                  onChange={(e) => {
                    setVendorSearch(e.target.value);
                    setSelectedVendor(null);
                    setIsVendorDropdownOpen(true);
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 pl-10 pr-9 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Autocomplete Vendor List */}
              {isVendorDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                  {filteredVendors.length > 0 &&
                    filteredVendors.map((vend) => (
                      <div
                        key={vend.id}
                        onClick={() => {
                          setSelectedVendor(vend);
                          setVendorSearch(vend.name);
                          setIsVendorDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black">
                            {vend.code}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{vend.name}</div>
                            <div className="text-[11px] font-medium text-slate-400">{vend.category}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{vend.taxId}</span>
                      </div>
                    ))}

                  {/* Dynamic Manual Custom Input Option inside dropdown */}
                  {vendorSearch.trim().length > 0 && (
                    <div
                      onClick={() => {
                        setSelectedVendor({ name: vendorSearch.trim(), code: vendorSearch.trim().slice(0, 2).toUpperCase(), category: "Custom Supplier" });
                        setIsVendorDropdownOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold transition border-t border-slate-100 dark:border-slate-800"
                    >
                      <Plus size={14} />
                      <span>Use manually typed vendor: &quot;{vendorSearch.trim()}&quot;</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PURCHASE BILL SPECIFIC FIELDS */}
          {activeTab === "bill" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Bill Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    value={billForm.refNo}
                    onChange={(e) => setBillForm({ ...billForm, refNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor Invoice Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    value={billForm.vendorInvoiceNo}
                    onChange={(e) => setBillForm({ ...billForm, vendorInvoiceNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bill Date
                  </label>
                  <input
                    type="date"
                    required
                    value={billForm.billDate}
                    onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={billForm.dueDate}
                    onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RFO (REQUEST FOR ORDER) SPECIFIC FIELDS */}
          {activeTab === "rfo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    RFO Request Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    value={rfoForm.refNo}
                    onChange={(e) => setRfoForm({ ...rfoForm, refNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* REQUESTING DEPARTMENT WITH MANUAL TEXT INPUT OPTION */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Requesting Department
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDept(!isCustomDept)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomDept ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomDept ? "Select from list" : "Type custom name"}</span>
                    </button>
                  </div>

                  {isCustomDept ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom department (e.g. Quality Assurance, R&D Lab)..."
                      value={rfoForm.department}
                      onChange={(e) => setRfoForm({ ...rfoForm, department: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <select
                      value={rfoForm.department}
                      onChange={(e) => {
                        if (e.target.value === "CUSTOM_OPTION") {
                          setIsCustomDept(true);
                          setRfoForm({ ...rfoForm, department: "" });
                        } else {
                          setRfoForm({ ...rfoForm, department: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Production & Manufacturing">Production & Manufacturing</option>
                      <option value="Toolroom & Precision Machining">Toolroom & Precision Machining</option>
                      <option value="Plant Maintenance & Utilities">Plant Maintenance & Utilities</option>
                      <option value="Stores & Warehouse Material">Stores & Warehouse Material</option>
                      <option value="CUSTOM_OPTION">+ Enter Custom Department (Type manually)...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={rfoForm.targetDeliveryDate}
                    onChange={(e) => setRfoForm({ ...rfoForm, targetDeliveryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Requisition Priority
                  </label>
                  <select
                    value={rfoForm.priority}
                    onChange={(e) => setRfoForm({ ...rfoForm, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="NORMAL">Normal Requirement</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Production Breakdown</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PURCHASED MACHINERY SPECIFIC FIELDS */}
          {activeTab === "machinery" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Machinery Asset Tag ID
                  </label>
                  <input
                    type="text"
                    required
                    value={machineryForm.assetTag}
                    onChange={(e) => setMachineryForm({ ...machineryForm, assetTag: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Machinery Equipment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CNC 5-Axis Milling Machine"
                    value={machineryForm.name}
                    onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Model & Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Haas VF-4SS Series"
                    value={machineryForm.model}
                    onChange={(e) => setMachineryForm({ ...machineryForm, model: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* MACHINERY CATEGORY WITH MANUAL INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Machinery Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMachCategory(!isCustomMachCategory)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomMachCategory ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomMachCategory ? "Select list" : "Type custom"}</span>
                    </button>
                  </div>

                  {isCustomMachCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom machinery category (e.g. Robotic Automation)..."
                      value={machineryForm.category}
                      onChange={(e) => setMachineryForm({ ...machineryForm, category: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={machineryForm.category}
                      onChange={(e) => {
                        if (e.target.value === "CUSTOM_OPTION") {
                          setIsCustomMachCategory(true);
                          setMachineryForm({ ...machineryForm, category: "" });
                        } else {
                          setMachineryForm({ ...machineryForm, category: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="CNC Machining">CNC Machining</option>
                      <option value="Forming & Pressing">Forming & Pressing</option>
                      <option value="Laser Processing">Laser Processing</option>
                      <option value="Turning & Lathes">Turning & Lathes</option>
                      <option value="Utilities & Power">Utilities & Power</option>
                      <option value="CUSTOM_OPTION">+ Enter Custom Category (Type manually)...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    required
                    value={machineryForm.purchaseDate}
                    onChange={(e) => setMachineryForm({ ...machineryForm, purchaseDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Cost / Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3850000"
                    value={machineryForm.cost}
                    onChange={(e) => setMachineryForm({ ...machineryForm, cost: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warranty Expiry Date
                  </label>
                  <input
                    type="date"
                    value={machineryForm.warrantyExpiry}
                    onChange={(e) => setMachineryForm({ ...machineryForm, warrantyExpiry: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* INSTALLATION LOCATION WITH MANUAL INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Installation Location / Bay
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMachLocation(!isCustomMachLocation)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomMachLocation ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomMachLocation ? "Select list" : "Type custom"}</span>
                    </button>
                  </div>

                  {isCustomMachLocation ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom location bay (e.g. Bay D - Assembly Plant)..."
                      value={machineryForm.location}
                      onChange={(e) => setMachineryForm({ ...machineryForm, location: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={machineryForm.location}
                      onChange={(e) => {
                        if (e.target.value === "CUSTOM_OPTION") {
                          setIsCustomMachLocation(true);
                          setMachineryForm({ ...machineryForm, location: "" });
                        } else {
                          setMachineryForm({ ...machineryForm, location: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Bay A - Main Workshop">Bay A - Main Workshop</option>
                      <option value="Bay B - Heavy Press Area">Bay B - Heavy Press Area</option>
                      <option value="Bay C - Laser Cutting Room">Bay C - Laser Cutting Room</option>
                      <option value="Compressor Utility Room">Compressor Utility Room</option>
                      <option value="CUSTOM_OPTION">+ Enter Custom Location (Type manually)...</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VENDOR ACCOUNT SPECIFIC FIELDS */}
          {activeTab === "vendor" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Supplier Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haas Automation India"
                    value={vendorForm.companyName}
                    onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Code / Initials
                  </label>
                  <input
                    type="text"
                    placeholder="HA"
                    value={vendorForm.code}
                    onChange={(e) => setVendorForm({ ...vendorForm, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rajeswaran Nair"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="GST-27AAACH1290"
                    value={vendorForm.gstId}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* VENDOR CATEGORY WITH MANUAL INPUT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Vendor Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomVendorCategory(!isCustomVendorCategory)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCustomVendorCategory ? <List size={12} /> : <Edit3 size={12} />}
                      <span>{isCustomVendorCategory ? "Select list" : "Type custom"}</span>
                    </button>
                  </div>

                  {isCustomVendorCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="Type custom vendor category..."
                      value={vendorForm.category}
                      onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                      className="w-full rounded-xl border border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={vendorForm.category}
                      onChange={(e) => {
                        if (e.target.value === "CUSTOM_OPTION") {
                          setIsCustomVendorCategory(true);
                          setVendorForm({ ...vendorForm, category: "" });
                        } else {
                          setVendorForm({ ...vendorForm, category: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="Machinery Supplier">Machinery Supplier</option>
                      <option value="Raw Materials & Metals">Raw Materials & Metals</option>
                      <option value="Cutting Tools & Spares">Cutting Tools & Spares</option>
                      <option value="Logistics & Freight">Logistics & Freight</option>
                      <option value="CUSTOM_OPTION">+ Enter Custom Category (Type manually)...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={vendorForm.paymentTerms}
                    onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Advance Payment">Advance Payment</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ITEMIZATION TABLE FOR RAW ITEMS, MACHINERY COMPONENTS & PROCUREMENT */}
          {activeTab !== "vendor" && activeTab !== "machinery" && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Purchased Line Items & Raw Materials
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Add raw items, machinery spares, and equipment components to be purchased (type manually for custom items)</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition"
                >
                  <Plus size={14} />
                  <span>Add Purchase Item</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">ITEM DESCRIPTION / SPECIFICATION (TYPE MANUALLY)</th>
                      <th className="py-2.5 px-3 w-28">HSN/SAC</th>
                      <th className="py-2.5 px-3 w-20 text-center">QTY</th>
                      <th className="py-2.5 px-3 w-24 text-center">UNIT</th>
                      <th className="py-2.5 px-3 w-28 text-right">UNIT PRICE (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-right">TOTAL (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {items.map((item) => {
                      const lineTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              placeholder="Type raw item or equipment name manually..."
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.hsnSac || ""}
                              onChange={(e) => handleItemChange(item.id, "hsnSac", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-center font-mono text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-center text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.unit || ""}
                              onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                              placeholder="Pcs/MT/Kg..."
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-center text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-right font-bold text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2 text-right font-black text-slate-900 dark:text-white">
                            ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* FINANCIAL CALCULATIONS RECAP */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-center font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">GST Tax (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-center font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Subtotal: <span className="text-slate-900 dark:text-white">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    GST ({taxPercent}%): <span className="text-slate-900 dark:text-white">₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                    Grand Total: ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Save size={15} />
              <span>Save Draft</span>
            </button>

            <div className="flex items-center gap-3">
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
                <span>{currentTabObj.buttonTitle}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
