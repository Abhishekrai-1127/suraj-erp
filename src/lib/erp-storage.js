"use client";

import { toast } from "sonner";

export const STORAGE_DOCUMENTS_KEY = "suraj_erp_created_documents";
export const STORAGE_CUSTOMERS_KEY = "suraj_erp_created_customers";
export const STORAGE_DELETED_DOCUMENTS_KEY = "suraj_erp_deleted_documents";
export const STORAGE_SALES_TARGET_KEY = "suraj_erp_monthly_sales_target";

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

const LEGACY_MOCK_ENTITIES = new Set([
  "SO-2024-4134",
  "SO-2024-2221",
  "SO-2024-8891",
  "INV-2024-001",
  "INV-2024-002",
  "INV-2024-4134",
  "INV-2024-2221",
  "QT-2024-001",
  "QT-2024-002",
  "Lumina Marketing",
  "Apex Corp Solutions",
]);

export function getStoredDocuments() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_DOCUMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deletedIds = getDeletedDocumentIds();

    // Deduplicate by refNo / id, exclude deleted document IDs, and purge legacy mock items
    const seen = new Set();
    const uniqueDocs = [];
    let hadLegacyMocks = false;

    for (const doc of parsed) {
      const key = doc.refNo || doc.id;
      const cust = doc.customer || "";

      if (
        LEGACY_MOCK_ENTITIES.has(key) ||
        LEGACY_MOCK_ENTITIES.has(cust) ||
        (key && deletedIds.includes(key))
      ) {
        hadLegacyMocks = true;
        continue;
      }

      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      uniqueDocs.push(doc);
    }

    // Persist cleaned list back to storage if legacy mock items were found
    if (hadLegacyMocks && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(uniqueDocs));
      } catch (e) {}
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

  return Boolean(existingStored);
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

/**
 * Retrieves the sales target for a specific month (defaults to current month YYYY-MM).
 * Keyed by calendar month so monthly targets do not spill across financial periods.
 * Called by SalesTarget and SetSalesTargetModal widgets.
 *
 * @param {string} [monthKey] - Format: "YYYY-MM" (e.g., "2026-09")
 * @returns {{ targetAmount: number, isSet: boolean, month: string }}
 */
export function getStoredSalesTarget(monthKey) {
  const currentMonth = monthKey || new Date().toISOString().slice(0, 7);
  if (typeof window === "undefined") {
    return { targetAmount: 0, isSet: false, month: currentMonth };
  }

  try {
    const raw = localStorage.getItem(STORAGE_SALES_TARGET_KEY);
    if (!raw) {
      return { targetAmount: 0, isSet: false, month: currentMonth };
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed[currentMonth] === "number") {
        return {
          targetAmount: parsed[currentMonth],
          isSet: true,
          month: currentMonth,
        };
      }
      if (parsed.month === currentMonth && typeof parsed.amount === "number") {
        return {
          targetAmount: parsed.amount,
          isSet: Boolean(parsed.isSet),
          month: currentMonth,
        };
      }
    } else if (typeof parsed === "number") {
      return { targetAmount: parsed, isSet: true, month: currentMonth };
    }

    return { targetAmount: 0, isSet: false, month: currentMonth };
  } catch (e) {
    console.error("Failed to read sales target from localStorage", e);
    return { targetAmount: 0, isSet: false, month: currentMonth };
  }
}

/**
 * Persists a sales target for a given month and dispatches real-time DOM update event
 * so all listening metrics widgets and open tabs reflect changes synchronously.
 *
 * @param {number|string} amount
 * @param {string} [monthKey]
 */
export function saveSalesTarget(amount, monthKey) {
  if (typeof window === "undefined") return;
  const currentMonth = monthKey || new Date().toISOString().slice(0, 7);
  const targetNum = Number(amount) || 0;

  try {
    let targets = {};
    const raw = localStorage.getItem(STORAGE_SALES_TARGET_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          if (parsed.month && typeof parsed.amount === "number") {
            targets[parsed.month] = parsed.amount;
          } else {
            targets = { ...parsed };
          }
        }
      } catch (err) {
        targets = {};
      }
    }

    targets[currentMonth] = targetNum;
    localStorage.setItem(STORAGE_SALES_TARGET_KEY, JSON.stringify(targets));
    window.dispatchEvent(new Event("erp_sales_target_updated"));
  } catch (e) {
    console.error("Failed to save sales target to localStorage", e);
    toast.error("Failed to save sales target.");
  }
}

/**
 * Resets / unsets the sales target for the specified month and notifies widgets.
 *
 * @param {string} [monthKey]
 */
export function resetSalesTarget(monthKey) {
  if (typeof window === "undefined") return;
  const currentMonth = monthKey || new Date().toISOString().slice(0, 7);

  try {
    const raw = localStorage.getItem(STORAGE_SALES_TARGET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        delete parsed[currentMonth];
        localStorage.setItem(STORAGE_SALES_TARGET_KEY, JSON.stringify(parsed));
      }
    }
    window.dispatchEvent(new Event("erp_sales_target_updated"));
  } catch (e) {
    console.error("Failed to reset sales target in localStorage", e);
  }
}

