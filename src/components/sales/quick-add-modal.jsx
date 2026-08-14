"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  ShoppingBag,
  Receipt,
  UserPlus,
  Check,
  Plus,
  Trash2,
  Save,
  Search,
  ChevronDown,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { saveDocument, saveCustomer, getStoredCustomers, hasInvoiceForSalesOrder } from "@/lib/erp-storage";

// Master Customer list for Autocomplete
const MOCK_CUSTOMERS = [
  { id: "cust-1", name: "Apex Corp Solutions", code: "AC", category: "Tech Hardware", taxId: "US-9849201" },
  { id: "cust-2", name: "Lumina Marketing", code: "LM", category: "Advertising", taxId: "US-3419082" },
  { id: "cust-3", name: "Global Enterprises", code: "GE", category: "Logistics", taxId: "US-8812903" },
  { id: "cust-4", name: "Blue Note Café", code: "BN", category: "Retail", taxId: "US-1192834" },
  { id: "cust-5", name: "Vanguard Dynamics", code: "VD", category: "Manufacturing", taxId: "US-5549012" },
  { id: "cust-6", name: "Acme Corp Ltd", code: "AC", category: "Manufacturing & Dist.", taxId: "US-7740192" },
  { id: "cust-7", name: "Starlight Retail", code: "SR", category: "Retail Chain", taxId: "US-6639102" },
  { id: "cust-8", name: "Nexus Systems", code: "NS", category: "Enterprise IT", taxId: "US-2294018" },
];

const DRAFT_STORAGE_PREFIX = "suraj_erp_sales_draft_";

export default function QuickAddModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("order");

  // Autocomplete Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sales Document Common Items State
  const [items, setItems] = useState([
    { id: "1", description: "Enterprise ERP Software License (Annual)", qty: 1, unitPrice: 4500 },
    { id: "2", description: "Implementation & Training SLA Hours", qty: 10, unitPrice: 150 },
  ]);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [taxPercent, setTaxPercent] = useState(10);

  // Sales Order Form Fields
  const [orderForm, setOrderForm] = useState(() => ({
    refNo: "SO-2024-" + Math.floor(1000 + Math.random() * 9000),
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    paymentTerms: "Net 30 Days",
    shippingMethod: "Standard Ground Logistics",
    shippingAddress: "100 Tech Parkway, Suite 400, San Francisco, CA 94107",
    notes: "Deliver during standard warehouse operating hours (8 AM - 5 PM).",
  }));

  // Quotation Form Fields
  const [quotationForm, setQuotationForm] = useState(() => ({
    refNo: "QT-2024-" + Math.floor(1000 + Math.random() * 9000),
    quotationDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    salesperson: "Sarah Jenkins (Key Accounts)",
    priceList: "INR (₹)",
    leadSource: "Direct Sales Outreach",
    terms: "Quotation valid for 30 days from issue date. Subject to standard warranty terms.",
  }));

  // Invoice Form Fields
  const [invoiceForm, setInvoiceForm] = useState(() => ({
    refNo: "INV-2024-" + Math.floor(1000 + Math.random() * 9000),
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    poNumber: "PO-88912-X",
    invoiceType: "Standard Sales Invoice",
    paymentTerms: "Net 30 Days",
    bankAccount: "JPMorgan Chase • Acct: *******9041 • SWIFT: CHASUS33",
    footnote: "Thank you for your business! Please include invoice ref on payment remittals.",
  }));

  // Customer Form Fields
  const [customerForm, setCustomerForm] = useState({
    companyName: "",
    code: "",
    contactPerson: "",
    email: "",
    phone: "",
    taxId: "",
    category: "Enterprise",
    creditLimit: "50000",
    paymentTerms: "Net 30 Days",
    billingAddress: "",
    shippingAddress: "",
  });

  // Local Storage Draft Meta info
  const [savedDraftInfo, setSavedDraftInfo] = useState(null);

  // Load draft from local storage for activeTab
  const loadDraft = (tab) => {
    if (typeof window === "undefined") return;
    try {
      const storedData = localStorage.getItem(DRAFT_STORAGE_PREFIX + tab);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed) {
          if (parsed.selectedCustomer) setSelectedCustomer(parsed.selectedCustomer);
          if (parsed.customerSearch) setCustomerSearch(parsed.customerSearch);
          if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);
          if (parsed.discountPercent !== undefined) setDiscountPercent(parsed.discountPercent);
          if (parsed.taxPercent !== undefined) setTaxPercent(parsed.taxPercent);
          if (parsed.orderForm) setOrderForm(parsed.orderForm);
          if (parsed.quotationForm) setQuotationForm(parsed.quotationForm);
          if (parsed.invoiceForm) setInvoiceForm(parsed.invoiceForm);
          if (parsed.customerForm) setCustomerForm(parsed.customerForm);
          setSavedDraftInfo(parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : "Recently");
          return true;
        }
      }
    } catch (e) {
      console.error("Failed to load draft from localStorage", e);
    }
    setSavedDraftInfo(null);
    return false;
  };

  // Automatically check & load draft on modal open or tab change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const found = loadDraft(activeTab);
        if (found) {
          toast.info(`Restored saved draft for ${activeTab.toUpperCase()} from Local Storage`);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab]);

  // Handle outside click for customer dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered customer list (including newly created customers)
  const masterCustomerList = [...MOCK_CUSTOMERS, ...getStoredCustomers()];
  const filteredCustomers = masterCustomerList.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(customerSearch.toLowerCase())
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
      { id: Date.now().toString(), description: "New Item / Service Description", qty: 1, unitPrice: 100 },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      toast.error("Document must contain at least one line item.");
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

  // Save Draft to Local Storage
  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;

    if (!selectedCustomer && activeTab !== "customer" && !customerSearch) {
      toast.error("Please enter or select a customer before saving draft.");
      return;
    }

    const timestamp = new Date().toISOString();
    const draftPayload = {
      tab: activeTab,
      savedAt: timestamp,
      selectedCustomer,
      customerSearch,
      items,
      discountPercent,
      taxPercent,
      orderForm,
      quotationForm,
      invoiceForm,
      customerForm,
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_PREFIX + activeTab, JSON.stringify(draftPayload));
      setSavedDraftInfo(new Date(timestamp).toLocaleTimeString());
      toast.success(`Draft saved to Local Storage!`, {
        description: `Your ${activeTab.toUpperCase()} draft will persist across page refreshes and browser reloads.`,
      });
      onClose();
    } catch (err) {
      toast.error("Failed to write draft to local storage");
    }
  };

  // Clear Saved Draft from Local Storage
  const handleClearDraft = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_PREFIX + activeTab);
      setSavedDraftInfo(null);
      // Reset to initial blank defaults
      setSelectedCustomer(null);
      setCustomerSearch("");
      setItems([{ id: "1", description: "Enterprise ERP Software License (Annual)", qty: 1, unitPrice: 4500 }]);
      toast.info(`Cleared saved draft for ${activeTab.toUpperCase()}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab !== "customer" && !selectedCustomer) {
      toast.error("Please select a customer for this sales document.");
      return;
    }

    if (activeTab !== "customer" && items.length === 0) {
      toast.error("Please add at least one line item before saving!");
      return;
    }

    if (activeTab === "customer" && !customerForm.companyName.trim()) {
      toast.error("Please enter a valid customer / company name!");
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

    if (activeTab === "order") {
      const formattedItems = items.map((item) => ({
        description: item.description,
        hsnSac: item.hsnSac || "84145930",
        qty: parseFloat(item.qty || 1),
        unit: item.unit || "Nos",
        listPrice: parseFloat(item.unitPrice || item.listPrice || 0),
        discRupees: parseFloat(item.discount || item.discRupees || 0),
        taxPercent: taxPercent || 18,
      }));

      const numPart = orderForm.refNo.replace(/^[A-Z]+-/, "");
      const invoiceRefNo = "INV-" + numPart;
      const challanRefNo = "DC-" + numPart;

      // 1. Save Sales Order
      saveDocument({
        id: Date.now(),
        type: "order",
        refNo: orderForm.refNo,
        customer: selectedCustomer.name,
        category: selectedCustomer.category || "General",
        initials: selectedCustomer.code || "SO",
        date: dateToday,
        amount: formattedAmount,
        numericAmount: grandTotal,
        status: "IN PROCESS",
        salesPerson: "Sarah Chen",
        items: formattedItems,
      });

      // 2. Auto-create matching Invoice directly
      saveDocument({
        id: Date.now() + 1,
        type: "invoice",
        refNo: invoiceRefNo,
        customer: selectedCustomer.name,
        customerId: selectedCustomer.code || "INV",
        category: selectedCustomer.category || "General",
        initials: selectedCustomer.code || "INV",
        date: dateToday,
        dueDate: orderForm.targetDeliveryDate || dateToday,
        amount: formattedAmount,
        balance: formattedAmount,
        numericAmount: grandTotal,
        status: "IN PROGRESS",
        isOverdue: false,
        poNumber: orderForm.refNo,
        items: formattedItems,
      });

      // 3. Auto-create matching Delivery Challan directly
      saveDocument({
        id: Date.now() + 2,
        type: "challan",
        refNo: challanRefNo,
        invoiceRefNo: invoiceRefNo,
        customer: selectedCustomer.name,
        customerId: selectedCustomer.code || "DC",
        date: dateToday,
        dispatchDate: dateToday,
        partyOrderNo: orderForm.refNo,
        amount: formattedAmount,
        status: "DELIVERED",
        itemsCount: `${items.length} ${items.length === 1 ? "Unit" : "Units"}`,
        items: formattedItems,
        address: selectedCustomer.shippingAddress || selectedCustomer.billingAddress || "Gali No. 6, Master Mohalla, Libaspur, Delhi-42",
      });

      toast.success(`Sales Order ${orderForm.refNo} created! Invoice ${invoiceRefNo} generated directly.`);
    } else if (activeTab === "quotation") {
      saveDocument({
        id: Date.now(),
        type: "quotation",
        refNo: quotationForm.refNo,
        customer: selectedCustomer.name,
        category: selectedCustomer.category || "General",
        initials: selectedCustomer.code || "QT",
        date: dateToday,
        validUntil: quotationForm.expiryDate,
        expiryDate: quotationForm.expiryDate,
        amount: formattedAmount,
        numericAmount: grandTotal,
        status: "Sent",
        salesPerson: quotationForm.salesperson,
        // Store line items so PDF can render exact itemized quotation
        items: items.map((item) => ({
          description: item.description,
          hsnSac: item.hsnSac || "84145930",
          qty: parseFloat(item.qty || 1),
          unit: item.unit || "Nos",
          listPrice: parseFloat(item.unitPrice || item.listPrice || 0),
          discRupees: parseFloat(item.discount || item.discRupees || 0),
          taxPercent: taxPercent || 18,
        })),
      });
    } else if (activeTab === "invoice") {
      if (invoiceForm.poNumber && hasInvoiceForSalesOrder(invoiceForm.poNumber)) {
        toast.error(
          `Invoice for Sales Order ${invoiceForm.poNumber} already exists. Only 1 invoice can be created per Sales Order.`
        );
        return;
      }
      const challanRefNo = "DC-" + invoiceForm.refNo.replace(/^[A-Z]+-/, "");
      const formattedItems = items.map((item) => ({
        description: item.description,
        hsnSac: item.hsnSac || "84145930",
        qty: parseFloat(item.qty || 1),
        unit: item.unit || "Nos",
        listPrice: parseFloat(item.unitPrice || item.listPrice || 0),
        discRupees: parseFloat(item.discount || item.discRupees || 0),
        taxPercent: taxPercent || 18,
      }));

      // Save Invoice
      saveDocument({
        id: Date.now(),
        type: "invoice",
        refNo: invoiceForm.refNo,
        customer: selectedCustomer.name,
        customerId: selectedCustomer.code || "INV",
        category: selectedCustomer.category || "General",
        initials: selectedCustomer.code || "INV",
        date: dateToday,
        dueDate: invoiceForm.dueDate,
        amount: formattedAmount,
        balance: formattedAmount,
        numericAmount: grandTotal,
        status: "IN PROGRESS",
        isOverdue: false,
        poNumber: invoiceForm.poNumber,
        items: formattedItems,
      });

      // Auto-create matching Delivery Challan directly
      saveDocument({
        id: Date.now() + 1,
        type: "challan",
        refNo: challanRefNo,
        invoiceRefNo: invoiceForm.refNo,
        customer: selectedCustomer.name,
        customerId: selectedCustomer.code || "DC",
        date: dateToday,
        dispatchDate: dateToday,
        partyOrderNo: invoiceForm.poNumber || "PO-88912-X",
        amount: formattedAmount,
        status: "DELIVERED",
        itemsCount: `${items.length} ${items.length === 1 ? "Unit" : "Units"}`,
        items: formattedItems,
        address: selectedCustomer.shippingAddress || selectedCustomer.billingAddress || "Gali No. 6, Master Mohalla, Libaspur, Delhi-42",
      });
    } else if (activeTab === "customer") {
      saveCustomer({
        id: "cust-" + Date.now(),
        name: customerForm.companyName || "New Customer",
        code: customerForm.code || (customerForm.companyName ? customerForm.companyName.slice(0, 2).toUpperCase() : "NC"),
        category: customerForm.category || "Enterprise",
        taxId: customerForm.taxId || "US-TAX",
      });
    }

    const typeTitles = {
      order: `Sales Order ${orderForm.refNo}`,
      quotation: `Quotation ${quotationForm.refNo}`,
      invoice: `Invoice ${invoiceForm.refNo}`,
      customer: `Customer ${customerForm.companyName || "New Account"}`,
    };

    // Remove draft from local storage upon successful creation
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(DRAFT_STORAGE_PREFIX + activeTab);
      } catch (err) {}
    }

    toast.success(`${typeTitles[activeTab]} created successfully!`, {
      description:
        activeTab === "customer"
          ? `Customer account registered for ${customerForm.companyName || "New Account"}`
          : `Customer: ${selectedCustomer?.name} • Total: ${formattedAmount}`,
    });
    onClose();
  };

  // Tab definitions with dynamic primary button titles
  const tabs = [
    { id: "order", label: "Sales Order", icon: ShoppingBag, buttonTitle: "Create Sales Order" },
    { id: "quotation", label: "Quotation", icon: FileText, buttonTitle: "Create Quotation" },
    { id: "invoice", label: "Invoice", icon: Receipt, buttonTitle: "Create Invoice" },
    { id: "customer", label: "Customer", icon: UserPlus, buttonTitle: "Create Customer" },
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
                  Create New {currentTabObj.label}
                </h3>
                {savedDraftInfo && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                    <Clock size={11} />
                    Draft Restored ({savedDraftInfo})
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                Enterprise document creation workflow & calculation engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedDraftInfo && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Discard saved draft from local storage"
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar">
          
          {/* SEARCHABLE CUSTOMER AUTOCOMPLETE DROPDOWN */}
          {activeTab !== "customer" && (
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Select Customer Account <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customer by name, code, or category..."
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                    setIsCustomerDropdownOpen(true);
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 pl-10 pr-9 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown List */}
              {isCustomerDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setCustomerSearch(cust.name);
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black">
                            {cust.code}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{cust.name}</div>
                            <div className="text-[11px] font-medium text-slate-400">{cust.category}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{cust.taxId}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                      No matching customer accounts found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: SALES ORDER SPECIFIC FIELDS */}
          {activeTab === "order" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sales Order Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.refNo}
                    onChange={(e) => setOrderForm({ ...orderForm, refNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.orderDate}
                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={orderForm.paymentTerms}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentTerms: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Immediate / Due on Receipt">Immediate / Due on Receipt</option>
                    <option value="50% Advance & Balance on Delivery">50% Advance & Balance on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Carrier / Method
                  </label>
                  <input
                    type="text"
                    value={orderForm.shippingMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingMethod: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={orderForm.shippingAddress}
                    onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUOTATION SPECIFIC FIELDS */}
          {activeTab === "quotation" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quotation Ref Number
                  </label>
                  <input
                    type="text"
                    required
                    value={quotationForm.refNo}
                    onChange={(e) => setQuotationForm({ ...quotationForm, refNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quotation Issue Date
                  </label>
                  <input
                    type="date"
                    required
                    value={quotationForm.quotationDate}
                    onChange={(e) => setQuotationForm({ ...quotationForm, quotationDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration Date (Valid Until)
                  </label>
                  <input
                    type="date"
                    required
                    value={quotationForm.expiryDate}
                    onChange={(e) => setQuotationForm({ ...quotationForm, expiryDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Sales Executive
                  </label>
                  <select
                    value={quotationForm.salesperson}
                    onChange={(e) => setQuotationForm({ ...quotationForm, salesperson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Sarah Jenkins (Key Accounts)">Sarah Jenkins (Key Accounts)</option>
                    <option value="Michael Chen (Mid-Market)">Michael Chen (Mid-Market)</option>
                    <option value="Alex Rivera (SMB Sales)">Alex Rivera (SMB Sales)</option>
                    <option value="David Kim (Key Accounts)">David Kim (Key Accounts)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price List / Currency
                  </label>
                  <select
                    value={quotationForm.priceList}
                    onChange={(e) => setQuotationForm({ ...quotationForm, priceList: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="USD ($)">USD - US Dollar ($)</option>
                    <option value="EUR (€)">EUR - Euro (€)</option>
                    <option value="GBP (£)">GBP - British Pound (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={quotationForm.leadSource}
                    onChange={(e) => setQuotationForm({ ...quotationForm, leadSource: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVOICE SPECIFIC FIELDS */}
          {activeTab === "invoice" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.refNo}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, refNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer PO Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO-88912-X"
                    value={invoiceForm.poNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, poNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.invoiceDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
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
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Type
                  </label>
                  <select
                    value={invoiceForm.invoiceType}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Standard Sales Invoice">Standard Sales Invoice</option>
                    <option value="Recurring Service Bill">Recurring Service Bill</option>
                    <option value="Proforma Invoice">Proforma Invoice</option>
                    <option value="Milestone Invoice">Milestone Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Remittance Bank Account
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.bankAccount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, bankAccount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EDITABLE ITEMS TABLE & AUTOMATIC CALCULATOR */}
          {activeTab !== "customer" && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Line Items & Charges
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Item Description / Product</th>
                      <th className="py-2.5 px-3 w-24">Qty</th>
                      <th className="py-2.5 px-3 w-32">Unit Price (₹)</th>
                      <th className="py-2.5 px-3 w-32 text-right">Line Total</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {items.map((item) => {
                      const lineTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-semibold text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-bold text-slate-900 dark:text-white text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 font-bold text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2 text-right font-black text-slate-900 dark:text-white">
                            ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Automatic Calculation Summary Box */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-2 flex-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Discount Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tax / VAT Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-right min-w-[200px] border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-6">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Discount ({discountPercent}%):</span>
                      <span>
                        -₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Tax ({taxPercent}%):</span>
                    <span>
                      +₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER CREATION SPECIFIC FIELDS */}
          {activeTab === "customer" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Corp Solutions"
                    value={customerForm.companyName}
                    onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Short Code / Initials
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACS"
                    value={customerForm.code}
                    onChange={(e) => setCustomerForm({ ...customerForm, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robert Vance"
                    value={customerForm.contactPerson}
                    onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tax / VAT Identification No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US-9849201"
                    value={customerForm.taxId}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="billing@apexcorp.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-8900"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Category
                  </label>
                  <select
                    value={customerForm.category}
                    onChange={(e) => setCustomerForm({ ...customerForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="SMB">SMB</option>
                    <option value="Wholesale Distributor">Wholesale Distributor</option>
                    <option value="Retail Chain">Retail Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Limit ($)
                  </label>
                  <input
                    type="number"
                    value={customerForm.creditLimit}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street, City, State, ZIP..."
                    value={customerForm.billingAddress}
                    onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street, City, State, ZIP..."
                    value={customerForm.shippingAddress}
                    onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {/* Save Draft Button */}
              {activeTab !== "customer" && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 shadow-2xs"
                  title="Persist draft locally to LocalStorage"
                >
                  <Save size={15} />
                  <span>Save Draft</span>
                </button>
              )}

              {/* Dynamic Primary Submit Button */}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md shadow-blue-600/25 transition active:scale-95"
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
