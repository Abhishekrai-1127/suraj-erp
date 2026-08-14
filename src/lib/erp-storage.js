"use client";

import { toast } from "sonner";

export const STORAGE_DOCUMENTS_KEY = "suraj_erp_created_documents";
export const STORAGE_CUSTOMERS_KEY = "suraj_erp_created_customers";
export const STORAGE_DELETED_DOCUMENTS_KEY = "suraj_erp_deleted_documents";

export function uploadPdfToCloudStorage(pdfBlob, refNo, type = "document") {
  return Promise.resolve(null);
}

export function getDeletedDocumentIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_DOCUMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getStoredDocuments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deletedIds = getDeletedDocumentIds();

    // Deduplicate by refNo / id and exclude deleted document IDs
    const seen = new Set();
    const uniqueDocs = [];
    for (const doc of parsed) {
      const key = doc.refNo || doc.id;
      if (key && (seen.has(key) || deletedIds.includes(key))) continue;
      if (key) seen.add(key);
      uniqueDocs.push(doc);
    }
    return uniqueDocs;
  } catch (e) {
    console.error("Failed to read documents from localStorage", e);
    toast.error("Error reading saved documents from local storage.");
    return [];
  }
}

/**
 * Evaluates whether an Invoice has already been generated or linked to a specified Sales Order reference number.
 * Used by QuickAddModal and SalesOrdersPage to strictly enforce the single-invoice-per-sales-order business rule.
 * 
 * @param {string} salesOrderNo - The Sales Order reference identifier (e.g., "SO-2024-992")
 * @returns {boolean} True if an invoice bound to this sales order exists in storage or default records.
 */
export function hasInvoiceForSalesOrder(salesOrderNo) {
  if (typeof window === "undefined" || !salesOrderNo) return false;

  const cleanSO = String(salesOrderNo).trim();
  const numPart = cleanSO.replace(/^[A-Z]+-/, "");
  const expectedInvRef = "INV-" + numPart;

  const deletedIds = getDeletedDocumentIds();
  const storedDocs = getStoredDocuments();

  // Check stored invoices for matching refNo, poNumber, or sales order identifier
  const existingStored = storedDocs.find(
    (d) =>
      d.type === "invoice" &&
      !deletedIds.includes(d.refNo || d.id) &&
      (d.refNo === expectedInvRef ||
        d.poNumber === cleanSO ||
        d.salesOrderNo === cleanSO ||
        d.refNo === cleanSO)
  );

  if (existingStored) return true;

  // Fallback check against default mock invoices if not deleted
  const defaultMockInvoices = [
    "INV-2024-001",
    "INV-2024-002",
    "INV-2024-003",
    "INV-2024-004",
    "INV-2024-005",
  ];

  return defaultMockInvoices.some(
    (invId) =>
      !deletedIds.includes(invId) &&
      (invId === expectedInvRef || invId === cleanSO)
  );
}

export function saveDocument(doc) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredDocuments();
    const docKey = doc.refNo || doc.id;

    // Check if document with same refNo or id already exists
    const existingIndex = current.findIndex(
      (d) => (d.refNo && d.refNo === docKey) || (d.id && d.id === docKey)
    );

    let updated;
    if (existingIndex >= 0) {
      // Overwrite existing document instead of creating duplicate entries
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...doc };
    } else {
      updated = [doc, ...current];
    }

    localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("erp_document_created"));
  } catch (e) {
    console.error("Failed to save document to localStorage", e);
    toast.error("Failed to save document to local storage", {
      description: e?.message || "Storage error occurred",
    });
  }
}

export function updateStoredDocument(idOrRefNo, updatedFields) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredDocuments();
    const index = current.findIndex(
      (d) => d.refNo === idOrRefNo || d.id === idOrRefNo
    );
    let updated;
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...updatedFields };
    } else {
      const newDoc = { refNo: idOrRefNo, id: idOrRefNo, ...updatedFields };
      updated = [newDoc, ...current];
    }
    localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("erp_document_created"));
  } catch (e) {
    console.error("Failed to update document in localStorage", e);
    toast.error("Failed to update document in storage", {
      description: e?.message || "Storage error occurred",
    });
  }
}

export function deleteStoredDocument(idOrRefNo) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredDocuments();
    const updated = current.filter(
      (d) => d.refNo !== idOrRefNo && d.id !== idOrRefNo
    );
    localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(updated));

    // Store in deleted list to also hide initial mock items when deleted
    const deleted = getDeletedDocumentIds();
    if (!deleted.includes(idOrRefNo)) {
      localStorage.setItem(
        STORAGE_DELETED_DOCUMENTS_KEY,
        JSON.stringify([...deleted, idOrRefNo])
      );
    }

    window.dispatchEvent(new Event("erp_document_created"));
  } catch (e) {
    console.error("Failed to delete document from localStorage", e);
    toast.error("Failed to delete document from storage", {
      description: e?.message || "Storage error occurred",
    });
  }
}

export function getStoredCustomers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read customers from localStorage", e);
    toast.error("Error reading saved customer data.");
    return [];
  }
}

export function saveCustomer(customer) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCustomers();
    const existingIndex = current.findIndex(
      (c) => (customer.code && c.code === customer.code) || c.name === customer.name
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...customer };
    } else {
      updated = [customer, ...current];
    }

    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("erp_customer_created"));
  } catch (e) {
    console.error("Failed to save customer to localStorage", e);
    toast.error("Failed to save customer to storage", {
      description: e?.message || "Storage error occurred",
    });
  }
}
