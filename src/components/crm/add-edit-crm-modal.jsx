"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { saveCrmCustomer, saveLead, saveContact, saveDeal } from "@/lib/crm-storage";

export function AddEditCrmModal({ isOpen, onClose, recordToEdit, defaultTab = "Customer" }) {
  const [recordType, setRecordType] = useState("Customer");

  // Customer / Vendor Form
  const [customerForm, setCustomerForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    gst: "",
    category: "Logistics",
    status: "Active",
    outstanding: "0",
    creditLimit: "500000",
    assignedRep: "Sarah Jenkins",
    billingAddress: "",
    shippingAddress: "",
    notes: "",
  });

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Direct Outreach",
    estimatedValue: "350000",
    stage: "New",
    assignedRep: "Sarah Jenkins",
    score: "75",
    notes: "",
  });

  // Contact Form
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "Purchase Manager",
    company: "",
    email: "",
    phone: "",
    preferredMethod: "Email",
    assignedRep: "Sarah Jenkins",
    notes: "",
  });

  // Deal Form
  const [dealForm, setDealForm] = useState({
    title: "",
    company: "",
    customer: "",
    value: "500000",
    stage: "Discovery",
    closingDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    probability: "60%",
    assignedRep: "Sarah Jenkins",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (recordToEdit) {
      if (recordToEdit.stage && recordToEdit.score !== undefined) {
        setRecordType("Lead");
        setLeadForm({
          name: recordToEdit.name || "",
          company: recordToEdit.company || "",
          email: recordToEdit.email || "",
          phone: recordToEdit.phone || "",
          source: recordToEdit.source || "Direct Outreach",
          estimatedValue: String(recordToEdit.numericValue || recordToEdit.estimatedValue || "0").replace(/[^0-9.]/g, ""),
          stage: recordToEdit.stage || "New",
          assignedRep: recordToEdit.assignedRep || "Sarah Jenkins",
          score: String(recordToEdit.score || 75),
          notes: recordToEdit.notes || "",
        });
      } else if (recordToEdit.role) {
        setRecordType("Contact");
        setContactForm({
          name: recordToEdit.name || "",
          role: recordToEdit.role || "",
          company: recordToEdit.company || "",
          email: recordToEdit.email || "",
          phone: recordToEdit.phone || "",
          preferredMethod: recordToEdit.preferredMethod || "Email",
          assignedRep: recordToEdit.assignedRep || "Sarah Jenkins",
          notes: recordToEdit.notes || "",
        });
      } else if (recordToEdit.title) {
        setRecordType("Deal");
        setDealForm({
          title: recordToEdit.title || "",
          company: recordToEdit.company || "",
          customer: recordToEdit.customer || "",
          value: String(recordToEdit.numericValue || recordToEdit.value || "0").replace(/[^0-9.]/g, ""),
          stage: recordToEdit.stage || "Discovery",
          closingDate: recordToEdit.closingDate || "",
          probability: recordToEdit.probability || "50%",
          assignedRep: recordToEdit.assignedRep || "Sarah Jenkins",
        });
      } else {
        setRecordType(recordToEdit.type || "Customer");
        setCustomerForm({
          name: recordToEdit.name || "",
          company: recordToEdit.company || "",
          email: recordToEdit.email || "",
          phone: recordToEdit.phone || "",
          gst: recordToEdit.gst || "",
          category: recordToEdit.category || "Logistics",
          status: recordToEdit.status || "Active",
          outstanding: recordToEdit.outstanding || "₹0.00",
          creditLimit: recordToEdit.creditLimit || "₹5,00,000.00",
          assignedRep: recordToEdit.assignedRep || "Sarah Jenkins",
          billingAddress: recordToEdit.billingAddress || "",
          shippingAddress: recordToEdit.shippingAddress || "",
          notes: recordToEdit.notes || "",
        });
      }
    } else {
      let initialType = "Customer";
      if (defaultTab === "Vendors" || defaultTab === "Vendor") initialType = "Vendor";
      else if (defaultTab === "Leads" || defaultTab === "Lead") initialType = "Lead";
      else if (defaultTab === "Contacts" || defaultTab === "Contact") initialType = "Contact";
      else if (defaultTab.startsWith("Deals") || defaultTab === "Deal") initialType = "Deal";
      setRecordType(initialType);

      // Reset forms clean
      setCustomerForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        gst: "",
        category: "Logistics",
        status: "Active",
        outstanding: "0",
        creditLimit: "500000",
        assignedRep: "Sarah Jenkins",
        billingAddress: "",
        shippingAddress: "",
        notes: "",
      });

      setLeadForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "Direct Outreach",
        estimatedValue: "350000",
        stage: "New",
        assignedRep: "Sarah Jenkins",
        score: "75",
        notes: "",
      });

      setContactForm({
        name: "",
        role: "Purchase Manager",
        company: "",
        email: "",
        phone: "",
        preferredMethod: "Email",
        assignedRep: "Sarah Jenkins",
        notes: "",
      });

      setDealForm({
        title: "",
        company: "",
        customer: "",
        value: "500000",
        stage: "Discovery",
        closingDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        probability: "60%",
        assignedRep: "Sarah Jenkins",
      });
    }
  }, [isOpen, recordToEdit, defaultTab]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const timestampId = recordToEdit?.id || `${recordType.toLowerCase()}-${Date.now()}`;

    if (recordType === "Customer" || recordType === "Vendor") {
      if (!customerForm.name.trim() || !customerForm.company.trim()) {
        toast.error("Please provide both Name and Company for the account.");
        return;
      }
      const numVal = parseFloat(String(customerForm.outstanding).replace(/[^0-9.]/g, "")) || 0;
      saveCrmCustomer({
        id: timestampId,
        type: recordType,
        name: customerForm.name,
        company: customerForm.company,
        email: customerForm.email,
        phone: customerForm.phone,
        gst: customerForm.gst,
        category: customerForm.category,
        status: customerForm.status,
        outstanding: `₹${numVal.toLocaleString("en-IN")}.00`,
        numericOutstanding: numVal,
        creditLimit: customerForm.creditLimit,
        assignedRep: customerForm.assignedRep,
        billingAddress: customerForm.billingAddress,
        shippingAddress: customerForm.shippingAddress,
        notes: customerForm.notes,
        createdAt: recordToEdit?.createdAt || new Date().toISOString().split("T")[0],
      });
      toast.success(`${recordType} ${customerForm.name} saved successfully!`);
    } else if (recordType === "Lead") {
      if (!leadForm.name.trim() || !leadForm.company.trim()) {
        toast.error("Please enter Lead Name and Company.");
        return;
      }
      const numVal = parseFloat(leadForm.estimatedValue) || 0;
      saveLead({
        id: timestampId,
        name: leadForm.name,
        company: leadForm.company,
        email: leadForm.email,
        phone: leadForm.phone,
        source: leadForm.source,
        estimatedValue: `₹${numVal.toLocaleString("en-IN")}.00`,
        numericValue: numVal,
        stage: leadForm.stage,
        assignedRep: leadForm.assignedRep,
        score: parseInt(leadForm.score) || 75,
        notes: leadForm.notes,
        createdAt: recordToEdit?.createdAt || new Date().toISOString().split("T")[0],
      });
      toast.success(`Lead ${leadForm.name} saved successfully!`);
    } else if (recordType === "Contact") {
      if (!contactForm.name.trim()) {
        toast.error("Please enter Contact Name.");
        return;
      }
      saveContact({
        id: timestampId,
        name: contactForm.name,
        role: contactForm.role,
        company: contactForm.company,
        email: contactForm.email,
        phone: contactForm.phone,
        preferredMethod: contactForm.preferredMethod,
        assignedRep: contactForm.assignedRep,
        notes: contactForm.notes,
      });
      toast.success(`Contact ${contactForm.name} saved successfully!`);
    } else if (recordType === "Deal") {
      if (!dealForm.title.trim() || !dealForm.company.trim()) {
        toast.error("Please enter Deal Title and Company.");
        return;
      }
      const numVal = parseFloat(dealForm.value) || 0;
      saveDeal({
        id: timestampId,
        title: dealForm.title,
        company: dealForm.company,
        customer: dealForm.customer || dealForm.company,
        value: `₹${numVal.toLocaleString("en-IN")}.00`,
        numericValue: numVal,
        stage: dealForm.stage,
        closingDate: dealForm.closingDate,
        probability: dealForm.probability,
        assignedRep: dealForm.assignedRep,
      });
      toast.success(`Deal "${dealForm.title}" saved successfully!`);
    }

    onClose();
  };

  const types = ["Customer", "Vendor", "Lead", "Contact", "Deal"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="relative w-full max-w-2xl my-auto rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {recordToEdit ? `Edit ${recordType}` : `Add New CRM Record`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage accounts, leads, contacts, and sales opportunities
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Record Type Selector (only for new records) */}
        {!recordToEdit && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 overflow-x-auto">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecordType(t)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  recordType === t
                    ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 custom-scrollbar">
          
          {/* CUSTOMER / VENDOR FORM */}
          {(recordType === "Customer" || recordType === "Vendor") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amitabh Sharma"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Logistics Ltd."
                    value={customerForm.company}
                    onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="amitabh@sharma-logistics.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="09AAACH7409R1ZZ"
                    value={customerForm.gst}
                    onChange={(e) => setCustomerForm({ ...customerForm, gst: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Industry / Category
                  </label>
                  <input
                    type="text"
                    placeholder="Logistics, Manufacturing, Infra..."
                    value={customerForm.category}
                    onChange={(e) => setCustomerForm({ ...customerForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={customerForm.status}
                    onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Account Rep
                  </label>
                  <select
                    value={customerForm.assignedRep}
                    onChange={(e) => setCustomerForm({ ...customerForm, assignedRep: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins (Key Accounts)</option>
                    <option value="Michael Chen">Michael Chen (Mid-Market)</option>
                    <option value="Alex Rivera">Alex Rivera (SMB Sales)</option>
                    <option value="David Kim">David Kim (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  value={customerForm.billingAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white"
                  placeholder="Full office address..."
                />
              </div>
            </div>
          )}

          {/* LEAD FORM */}
          {recordType === "Lead" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Prospect Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Precision Tools"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="vikram@apexprecision.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98112 33445"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="350000"
                    value={leadForm.estimatedValue}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={leadForm.stage}
                    onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="New">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal / Quote</option>
                    <option value="Won">Closed Won</option>
                    <option value="Lost">Closed Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Requirement & Notes
                </label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-medium text-slate-900 dark:text-white"
                  placeholder="Key requirement details..."
                />
              </div>
            </div>
          )}

          {/* CONTACT FORM */}
          {recordType === "Contact" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Narang"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Technical Officer"
                    value={contactForm.role}
                    onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma Logistics Ltd."
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="sunil.cto@sharma-logistics.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DEAL FORM */}
          {recordType === "Deal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Machinery Supply Contract"
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Precision Tools"
                    value={dealForm.company}
                    onChange={(e) => setDealForm({ ...dealForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Discovery">Discovery</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md shadow-blue-600/25 transition active:scale-95"
            >
              <Check size={16} className="stroke-[3]" />
              <span>Save {recordType}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
