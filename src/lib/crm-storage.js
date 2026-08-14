"use client";

import { toast } from "sonner";

export const STORAGE_CRM_CUSTOMERS_KEY = "suraj_erp_crm_customers";
export const STORAGE_CRM_LEADS_KEY = "suraj_erp_crm_leads";
export const STORAGE_CRM_CONTACTS_KEY = "suraj_erp_crm_contacts";
export const STORAGE_CRM_DEALS_KEY = "suraj_erp_crm_deals";
export const STORAGE_CRM_ACTIVITIES_KEY = "suraj_erp_crm_activities";
export const STORAGE_CRM_DELETED_KEY = "suraj_erp_crm_deleted";

/**
 * Initial seed data for Indian B2B enterprise CRM operations.
 * Used when localStorage has not yet been initialized.
 */
const INITIAL_CUSTOMERS = [
  {
    id: "cust-101",
    type: "Customer",
    name: "Amitabh Sharma",
    company: "Sharma Logistics Ltd.",
    email: "amitabh@sharma-logistics.com",
    phone: "+91 98765 43210",
    gst: "09AAACH7409R1ZZ",
    category: "Logistics",
    status: "Active",
    outstanding: "₹42,850.00",
    numericOutstanding: 42850,
    creditLimit: "₹5,00,000.00",
    assignedRep: "Sarah Jenkins",
    billingAddress: "Plot 42, Transport Nagar, Kanpur, UP 208023",
    shippingAddress: "Plot 42, Transport Nagar, Kanpur, UP 208023",
    notes: "Key enterprise account for North India freight logistics.",
    createdAt: "2026-01-15",
  },
  {
    id: "cust-102",
    type: "Customer",
    name: "Rajiv Kapoor",
    company: "Kapoor Infrastructure",
    email: "rajiv.k@kapoorinfra.in",
    phone: "+91 99000 11223",
    gst: "27AABCK1234A1Z5",
    category: "Construction & Infra",
    status: "Active",
    outstanding: "₹1,12,000.00",
    numericOutstanding: 112000,
    creditLimit: "₹15,00,000.00",
    assignedRep: "Michael Chen",
    billingAddress: "Suite 802, Nariman Point, Mumbai, MH 400021",
    shippingAddress: "Yard 4, MIDC Industrial Zone, Thane, MH 400604",
    notes: "Requires Net 45 payment terms for heavy machinery spares.",
    createdAt: "2026-02-01",
  },
  {
    id: "cust-103",
    type: "Customer",
    name: "Meera Deshmukh",
    company: "MD Associates",
    email: "meera@md-associates.com",
    phone: "+91 98220 55443",
    gst: "03AAGCM4521M1Z0",
    category: "Consulting",
    status: "Inactive",
    outstanding: "₹5,400.00",
    numericOutstanding: 5400,
    creditLimit: "₹2,00,000.00",
    assignedRep: "Alex Rivera",
    billingAddress: "FC Road, Deccan Gymkhana, Pune, MH 411004",
    shippingAddress: "FC Road, Deccan Gymkhana, Pune, MH 411004",
    notes: "Follow up in Q3 regarding software licensing renewal.",
    createdAt: "2026-02-10",
  },
  {
    id: "cust-104",
    type: "Vendor",
    name: "Suresh Patel",
    company: "Patel Steel Alloys Pvt Ltd",
    email: "suresh@patelsteel.co.in",
    phone: "+91 97123 45678",
    gst: "24AAACP9988P1Z3",
    category: "Raw Material Supplier",
    status: "Active",
    outstanding: "₹85,000.00",
    numericOutstanding: 85000,
    creditLimit: "₹10,00,000.00",
    assignedRep: "David Kim",
    billingAddress: "GIDC Estate, Phase II, Vatva, Ahmedabad, GJ 382445",
    shippingAddress: "GIDC Estate, Phase II, Vatva, Ahmedabad, GJ 382445",
    notes: "Primary raw steel billet supplier for manufacturing team.",
    createdAt: "2026-02-20",
  },
];

const INITIAL_LEADS = [
  {
    id: "lead-201",
    name: "Vikram Malhotra",
    company: "Apex Precision Tools",
    email: "vikram@apexprecision.com",
    phone: "+91 98111 22334",
    source: "Direct Outreach",
    estimatedValue: "₹3,50,000.00",
    numericValue: 350000,
    stage: "Qualified",
    assignedRep: "Sarah Jenkins",
    score: 85,
    notes: "Interested in automated CNC machine components. Sent product demo catalog.",
    createdAt: "2026-03-01",
  },
  {
    id: "lead-202",
    name: "Ananya Roy",
    company: "Starlight Renewable Energy",
    email: "ananya.roy@starlightenergy.in",
    phone: "+91 97444 55667",
    source: "Inbound Web Inquiry",
    estimatedValue: "₹8,20,000.00",
    numericValue: 820000,
    stage: "Proposal",
    assignedRep: "Michael Chen",
    score: 92,
    notes: "Commercial solar panel inverter project. Formal proposal submitted.",
    createdAt: "2026-03-05",
  },
  {
    id: "lead-203",
    name: "Rohan Varma",
    company: "Varma Packaging Systems",
    email: "rohan@varmapack.com",
    phone: "+91 98999 77889",
    source: "Trade Show Expo",
    estimatedValue: "₹1,80,000.00",
    numericValue: 180000,
    stage: "New",
    assignedRep: "Alex Rivera",
    score: 60,
    notes: "Met at Mumbai Engineering Expo. Requested callback next Tuesday.",
    createdAt: "2026-03-10",
  },
  {
    id: "lead-204",
    name: "Pooja Hegde",
    company: "Southern Heavy Engineering",
    email: "pooja@southernengg.co.in",
    phone: "+91 94444 33221",
    source: "Referral",
    estimatedValue: "₹12,00,000.00",
    numericValue: 1200000,
    stage: "Contacted",
    assignedRep: "David Kim",
    score: 78,
    notes: "Referred by Amitabh Sharma. Needs custom hydraulic pump assembly.",
    createdAt: "2026-03-12",
  },
];

const INITIAL_CONTACTS = [
  {
    id: "cnt-301",
    name: "Sunil Narang",
    role: "Chief Technical Officer",
    company: "Sharma Logistics Ltd.",
    email: "sunil.cto@sharma-logistics.com",
    phone: "+91 98765 11111",
    preferredMethod: "Email",
    assignedRep: "Sarah Jenkins",
    notes: "Approves all technical hardware & software procurement decisions.",
  },
  {
    id: "cnt-302",
    name: "Priya Sundaram",
    role: "Head of Procurement",
    company: "Kapoor Infrastructure",
    email: "priya.s@kapoorinfra.in",
    phone: "+91 99000 99887",
    preferredMethod: "Phone",
    assignedRep: "Michael Chen",
    notes: "Direct contact for vendor invoice clearances and purchase orders.",
  },
  {
    id: "cnt-303",
    name: "Karan Johar",
    role: "VP Supply Chain",
    company: "Apex Precision Tools",
    email: "karan.j@apexprecision.com",
    phone: "+91 98111 66554",
    preferredMethod: "WhatsApp / Call",
    assignedRep: "Sarah Jenkins",
    notes: "Primary point of contact for CNC tool trials.",
  },
];

const INITIAL_DEALS = [
  {
    id: "deal-401",
    title: "Annual CNC Machinery Supply Contract",
    company: "Apex Precision Tools",
    customer: "Vikram Malhotra",
    value: "₹3,50,000.00",
    numericValue: 350000,
    stage: "Proposal",
    closingDate: "2026-04-15",
    probability: "75%",
    assignedRep: "Sarah Jenkins",
  },
  {
    id: "deal-402",
    title: "Solar Inverter Components Bulk Order",
    company: "Starlight Renewable Energy",
    customer: "Ananya Roy",
    value: "₹8,20,000.00",
    numericValue: 820000,
    stage: "Negotiation",
    closingDate: "2026-03-30",
    probability: "90%",
    assignedRep: "Michael Chen",
  },
  {
    id: "deal-403",
    title: "Hydraulic Pump Assembly Expansion",
    company: "Southern Heavy Engineering",
    customer: "Pooja Hegde",
    value: "₹12,00,000.00",
    numericValue: 1200000,
    stage: "Discovery",
    closingDate: "2026-05-10",
    probability: "40%",
    assignedRep: "David Kim",
  },
];

const INITIAL_ACTIVITIES = [
  {
    id: "act-501",
    entityId: "cust-101",
    type: "Call",
    title: "Quarterly Service Review Call",
    description: "Discussed delivery timeline for May shipment. Customer confirmed satisfaction.",
    author: "Sarah Jenkins",
    timestamp: "May 10, 2026 at 11:30 AM",
  },
  {
    id: "act-502",
    entityId: "lead-202",
    type: "Meeting",
    title: "Proposal Presentation & Technical Q&A",
    description: "Presented 18% GST inclusive quote to Ananya Roy and engineering lead.",
    author: "Michael Chen",
    timestamp: "May 12, 2026 at 03:00 PM",
  },
  {
    id: "act-503",
    entityId: "lead-201",
    type: "Email",
    title: "Product Specs Sheet Sent",
    description: "Emailed technical datasheet and compliance certificates for CNC series.",
    author: "Sarah Jenkins",
    timestamp: "May 13, 2026 at 09:15 AM",
  },
];

/**
 * Dispatches custom DOM event to trigger reactive UI re-renders across all active tabs and views.
 */
function notifyCrmUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("suraj_crm_updated"));
    window.dispatchEvent(new Event("storage"));
  }
}

export function getDeletedCrmIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CRM_DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// --- CUSTOMERS & VENDORS STORAGE API ---
export function getStoredCrmCustomers() {
  if (typeof window === "undefined") return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_CRM_CUSTOMERS_KEY);
    const deletedIds = getDeletedCrmIds();
    let list = raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
    if (!Array.isArray(list)) list = INITIAL_CUSTOMERS;
    return list.filter((item) => !deletedIds.includes(item.id));
  } catch (e) {
    return INITIAL_CUSTOMERS;
  }
}

export function saveCrmCustomer(customer) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCrmCustomers();
    const existingIndex = current.findIndex((c) => c.id === customer.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...customer };
    } else {
      updated = [customer, ...current];
    }
    localStorage.setItem(STORAGE_CRM_CUSTOMERS_KEY, JSON.stringify(updated));
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to save CRM record to local storage.");
  }
}

export function deleteCrmCustomer(id) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCrmCustomers();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_CRM_CUSTOMERS_KEY, JSON.stringify(updated));
    
    const deleted = getDeletedCrmIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(STORAGE_CRM_DELETED_KEY, JSON.stringify([...deleted, id]));
    }
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to delete CRM record.");
  }
}

// --- LEADS STORAGE API ---
export function getStoredLeads() {
  if (typeof window === "undefined") return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_CRM_LEADS_KEY);
    const deletedIds = getDeletedCrmIds();
    let list = raw ? JSON.parse(raw) : INITIAL_LEADS;
    if (!Array.isArray(list)) list = INITIAL_LEADS;
    return list.filter((item) => !deletedIds.includes(item.id));
  } catch (e) {
    return INITIAL_LEADS;
  }
}

export function saveLead(lead) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredLeads();
    const existingIndex = current.findIndex((l) => l.id === lead.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...lead };
    } else {
      updated = [lead, ...current];
    }
    localStorage.setItem(STORAGE_CRM_LEADS_KEY, JSON.stringify(updated));
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to save Lead to local storage.");
  }
}

export function deleteLead(id) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredLeads();
    const updated = current.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_CRM_LEADS_KEY, JSON.stringify(updated));

    const deleted = getDeletedCrmIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(STORAGE_CRM_DELETED_KEY, JSON.stringify([...deleted, id]));
    }
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to delete Lead.");
  }
}

// --- CONTACTS STORAGE API ---
export function getStoredContacts() {
  if (typeof window === "undefined") return INITIAL_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_CRM_CONTACTS_KEY);
    const deletedIds = getDeletedCrmIds();
    let list = raw ? JSON.parse(raw) : INITIAL_CONTACTS;
    if (!Array.isArray(list)) list = INITIAL_CONTACTS;
    return list.filter((item) => !deletedIds.includes(item.id));
  } catch (e) {
    return INITIAL_CONTACTS;
  }
}

export function saveContact(contact) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredContacts();
    const existingIndex = current.findIndex((c) => c.id === contact.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...contact };
    } else {
      updated = [contact, ...current];
    }
    localStorage.setItem(STORAGE_CRM_CONTACTS_KEY, JSON.stringify(updated));
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to save Contact to local storage.");
  }
}

export function deleteContact(id) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredContacts();
    const updated = current.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_CRM_CONTACTS_KEY, JSON.stringify(updated));

    const deleted = getDeletedCrmIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(STORAGE_CRM_DELETED_KEY, JSON.stringify([...deleted, id]));
    }
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to delete Contact.");
  }
}

// --- DEALS STORAGE API ---
export function getStoredDeals() {
  if (typeof window === "undefined") return INITIAL_DEALS;
  try {
    const raw = localStorage.getItem(STORAGE_CRM_DEALS_KEY);
    const deletedIds = getDeletedCrmIds();
    let list = raw ? JSON.parse(raw) : INITIAL_DEALS;
    if (!Array.isArray(list)) list = INITIAL_DEALS;
    return list.filter((item) => !deletedIds.includes(item.id));
  } catch (e) {
    return INITIAL_DEALS;
  }
}

export function saveDeal(deal) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredDeals();
    const existingIndex = current.findIndex((d) => d.id === deal.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...deal };
    } else {
      updated = [deal, ...current];
    }
    localStorage.setItem(STORAGE_CRM_DEALS_KEY, JSON.stringify(updated));
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to save Deal to local storage.");
  }
}

export function deleteDeal(id) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredDeals();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_CRM_DEALS_KEY, JSON.stringify(updated));

    const deleted = getDeletedCrmIds();
    if (!deleted.includes(id)) {
      localStorage.setItem(STORAGE_CRM_DELETED_KEY, JSON.stringify([...deleted, id]));
    }
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to delete Deal.");
  }
}

// --- ACTIVITIES STORAGE API ---
export function getStoredCrmActivities(entityId = null) {
  if (typeof window === "undefined") return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(STORAGE_CRM_ACTIVITIES_KEY);
    let list = raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
    if (!Array.isArray(list)) list = INITIAL_ACTIVITIES;
    if (entityId) {
      return list.filter((act) => act.entityId === entityId);
    }
    return list;
  } catch (e) {
    return INITIAL_ACTIVITIES;
  }
}

export function addCrmActivity(activity) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCrmActivities();
    const updated = [activity, ...current];
    localStorage.setItem(STORAGE_CRM_ACTIVITIES_KEY, JSON.stringify(updated));
    notifyCrmUpdate();
  } catch (e) {
    toast.error("Failed to log activity.");
  }
}
