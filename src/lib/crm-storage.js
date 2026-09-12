"use client";

import { toast } from "sonner";

export const STORAGE_CRM_CUSTOMERS_KEY = "suraj_erp_crm_customers";
export const STORAGE_CRM_LEADS_KEY = "suraj_erp_crm_leads";
export const STORAGE_CRM_CONTACTS_KEY = "suraj_erp_crm_contacts";
export const STORAGE_CRM_DEALS_KEY = "suraj_erp_crm_deals";
export const STORAGE_CRM_ACTIVITIES_KEY = "suraj_erp_crm_activities";
export const STORAGE_CRM_DELETED_KEY = "suraj_erp_crm_deleted";

/**
 * Clean empty initial state for CRM operations (no mock or hardcoded data).
 */
const INITIAL_CUSTOMERS = [];
const INITIAL_LEADS = [];
const INITIAL_CONTACTS = [];
const INITIAL_DEALS = [];
const INITIAL_ACTIVITIES = [];

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
