import apiClient from "@/lib/api-client";
import {
  getStoredDocuments,
  saveDocument,
  updateStoredDocument,
  deleteStoredDocument,
  getDeletedDocumentIds,
  saveCustomer,
} from "@/lib/erp-storage";

/**
 * Strict Purchase Record Types matching Central ERP Backend NestJS DTO enum
 */
export const PurchaseRecordType = {
  RFO: "rfo",
  PURCHASE_BILL: "purchase_bill",
  PURCHASED_MACHINERY: "purchased_machinery",
};

/**
 * RFO Priority Enum matching Central ERP Backend NestJS DTO enum
 */
export const RfoPriority = {
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

/**
 * Common Purchase Document Statuses
 */
export const PurchaseDocStatus = {
  // Bill statuses
  UNPAID: "UNPAID",
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
  // RFO statuses
  PENDING_APPROVAL: "PENDING APPROVAL",
  APPROVED: "APPROVED",
  // Machinery statuses
  OPERATIONAL: "OPERATIONAL",
  UNDER_MAINTENANCE: "UNDER MAINTENANCE",
  CALIBRATION_DUE: "CALIBRATION DUE",
  INACTIVE: "INACTIVE",
};

/**
 * Normalizes input date to ISO YYYY-MM-DD string
 */
export function formatIsoDate(val) {
  if (!val) return new Date().toISOString().slice(0, 10);
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    return val.trim();
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * Maps frontend UI document types to backend Central ERP PurchaseRecordType enum values
 */
export function normalizePurchaseType(type) {
  if (!type) return PurchaseRecordType.PURCHASE_BILL;
  const t = String(type).toLowerCase().trim();
  if (t === "bill" || t === "purchase_bill" || t === "invoice") return PurchaseRecordType.PURCHASE_BILL;
  if (t === "rfo" || t === "rfq" || t === "requisition") return PurchaseRecordType.RFO;
  if (t === "machinery" || t === "purchased_machinery" || t === "asset") return PurchaseRecordType.PURCHASED_MACHINERY;

  if (Object.values(PurchaseRecordType).includes(t)) return t;
  return PurchaseRecordType.PURCHASE_BILL;
}

/**
 * Normalizes priority to RfoPriority enum
 */
export function normalizeRfoPriority(priority) {
  if (!priority) return RfoPriority.NORMAL;
  const p = String(priority).toUpperCase().trim();
  if (p === "URGENT" || p === "CRITICAL") return RfoPriority.URGENT;
  if (p === "HIGH") return RfoPriority.HIGH;
  return RfoPriority.NORMAL;
}

/**
 * Normalizes frontend status strings to strict Purchase status values
 */
export function normalizePurchaseStatus(status, type = "") {
  const normType = normalizePurchaseType(type);
  if (!status) {
    if (normType === PurchaseRecordType.RFO) return "PENDING APPROVAL";
    if (normType === PurchaseRecordType.PURCHASED_MACHINERY) return "OPERATIONAL";
    return "UNPAID";
  }

  const s = String(status).toUpperCase().trim();

  if (normType === PurchaseRecordType.RFO) {
    if (s.includes("APPROV")) return "APPROVED";
    if (s.includes("CANCEL") || s.includes("REJECT")) return "CANCELLED";
    return "PENDING APPROVAL";
  }

  if (normType === PurchaseRecordType.PURCHASED_MACHINERY) {
    if (s.includes("MAINTAIN") || s.includes("REPAIR")) return "UNDER MAINTENANCE";
    if (s.includes("CALIBRAT")) return "CALIBRATION DUE";
    if (s.includes("INACTIVE") || s.includes("DECOMMISSION")) return "INACTIVE";
    return "OPERATIONAL";
  }

  // Purchase Bill
  if (s.includes("PAID") && !s.includes("UN")) return "PAID";
  if (s.includes("PARTIAL")) return "PARTIAL";
  if (s.includes("CANCEL") || s.includes("VOID")) return "CANCELLED";
  if (s.includes("DRAFT")) return "DRAFT";
  return "UNPAID";
}

/**
 * Generates local sequential reference number when backend is offline
 */
export function generateLocalSequentialPurchaseRefNo(type) {
  const normalizedType = normalizePurchaseType(type);
  const prefixMap = {
    [PurchaseRecordType.PURCHASE_BILL]: "PB",
    [PurchaseRecordType.RFO]: "RFO",
    [PurchaseRecordType.PURCHASED_MACHINERY]: "MAC",
  };

  const prefix = prefixMap[normalizedType] || "PUR";
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`, "i");

  const storedDocs = getStoredDocuments();
  let maxSeq = 0;

  storedDocs.forEach((doc) => {
    const docType = normalizePurchaseType(doc.type);
    const checkRef = doc.refNo || doc.assetTag;
    if (docType === normalizedType && checkRef) {
      const match = checkRef.trim().match(pattern);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(4, "0");
  return `${prefix}-${year}-${paddedSeq}`;
}

/**
 * Central ERP Purchase API Service connecting frontend with PostgreSQL backend.
 * Conforms strictly to CreatePurchaseRecordDto and UpdatePurchaseRecordDto.
 */
export const purchaseApi = {
  /**
   * Fetches list of purchase records with optional query parameters.
   * @param {Object} params - { type, status, search, page, limit }
   */
  async getRecords(params = {}) {
    const query = {};
    if (params.type && params.type !== "all") {
      query.type = normalizePurchaseType(params.type);
    }
    if (params.status && params.status !== "ALL" && params.status !== "All") {
      query.status = params.status;
    }
    if (params.search && typeof params.search === "string" && params.search.trim()) {
      query.search = params.search.trim();
    }
    if (params.page !== undefined && !isNaN(Number(params.page))) {
      query.page = Number(params.page);
    }
    if (params.limit !== undefined && !isNaN(Number(params.limit))) {
      query.limit = Number(params.limit);
    }

    try {
      const response = await apiClient.get("/purchase", { params: query });
      const data = response?.data || response;
      return Array.isArray(data) ? data : data?.data || [];
    } catch (error) {
      if (error.isNetworkError || error.message?.includes("Network")) {
        console.warn("[Purchase API] Backend unreachable, falling back to local storage.");
      }
      let docs = getStoredDocuments();
      const deletedIds = getDeletedDocumentIds();
      docs = docs.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo) && !deletedIds.includes(d.assetTag));

      const purchaseTypes = [
        PurchaseRecordType.PURCHASE_BILL,
        PurchaseRecordType.RFO,
        PurchaseRecordType.PURCHASED_MACHINERY,
      ];

      docs = docs.filter((d) => purchaseTypes.includes(normalizePurchaseType(d.type)));

      if (query.type) {
        docs = docs.filter((d) => normalizePurchaseType(d.type) === query.type);
      }
      if (query.status) {
        docs = docs.filter((d) => (d.status || "").toUpperCase() === query.status.toUpperCase());
      }
      if (query.search) {
        const q = query.search.toLowerCase();
        docs = docs.filter(
          (d) =>
            (d.refNo || "").toLowerCase().includes(q) ||
            (d.assetTag || "").toLowerCase().includes(q) ||
            (d.vendor || "").toLowerCase().includes(q) ||
            (d.name || "").toLowerCase().includes(q) ||
            (d.department || "").toLowerCase().includes(q)
        );
      }
      return docs;
    }
  },

  /**
   * Gets single purchase record by ID
   */
  async getRecordById(id) {
    try {
      const response = await apiClient.get(`/purchase/${id}`);
      return response?.data || response;
    } catch (error) {
      if (error.isNetworkError || error.message?.includes("Network")) {
        return (
          getStoredDocuments().find(
            (d) => String(d.id) === String(id) || d.refNo === id || d.assetTag === id
          ) || null
        );
      }
      throw error;
    }
  },

  /**
   * Fetches the next sequential reference number for a given purchase record type
   * @param {string} type - 'rfo' | 'purchase_bill' | 'purchased_machinery'
   */
  async getNextRefNo(type) {
    const normalizedType = normalizePurchaseType(type);
    try {
      const response = await apiClient.get("/purchase/next-ref-no", {
        params: { type: normalizedType },
      });
      const data = response?.data || response;
      if (data?.refNo) {
        return data.refNo;
      }
      return generateLocalSequentialPurchaseRefNo(normalizedType);
    } catch {
      return generateLocalSequentialPurchaseRefNo(normalizedType);
    }
  },

  /**
   * Creates a new purchase record matching NestJS CreatePurchaseRecordDto.
   * Also synchronizes to local storage for instant offline availability.
   */
  async createRecord(raw) {
    // If saving a standalone vendor account
    if (raw.type === "vendor") {
      saveCustomer({
        id: "vend-" + Date.now(),
        name: raw.companyName || raw.name,
        code: raw.code || "VN",
        category: raw.category || "Supplier",
        taxId: raw.gstId || "GST-VENDOR",
      });
      return raw;
    }

    const type = normalizePurchaseType(raw.type);
    const status = normalizePurchaseStatus(raw.status, type);

    const dto = {
      refNo: raw.refNo ? String(raw.refNo).trim() : undefined,
      type,
      vendor: String(raw.vendor || "Custom Vendor Supplier").trim(),
      status,
    };

    if (raw.vendorInvoiceNo && typeof raw.vendorInvoiceNo === "string" && raw.vendorInvoiceNo.trim()) {
      dto.vendorInvoiceNo = raw.vendorInvoiceNo.trim();
    }
    if (raw.requestDate) dto.requestDate = formatIsoDate(raw.requestDate);
    if (raw.billDate) dto.billDate = formatIsoDate(raw.billDate);
    if (raw.dueDate) dto.dueDate = formatIsoDate(raw.dueDate);
    if (raw.purchaseDate) dto.purchaseDate = formatIsoDate(raw.purchaseDate);

    const numAmount = Number(raw.numericAmount ?? raw.grandTotal ?? raw.amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      dto.numericAmount = numAmount;
    }

    if (raw.department && typeof raw.department === "string" && raw.department.trim()) {
      dto.department = raw.department.trim();
    }
    if (raw.priority) {
      dto.priority = normalizeRfoPriority(raw.priority);
    }
    if (raw.assetTag && typeof raw.assetTag === "string" && raw.assetTag.trim()) {
      dto.assetTag = raw.assetTag.trim();
    }
    if (raw.name && typeof raw.name === "string" && raw.name.trim()) {
      dto.name = raw.name.trim();
    }
    if (raw.model && typeof raw.model === "string" && raw.model.trim()) {
      dto.model = raw.model.trim();
    }
    const numCost = Number(raw.numericCost ?? raw.cost);
    if (!isNaN(numCost) && numCost >= 0) {
      dto.numericCost = numCost;
    }
    if (raw.location && typeof raw.location === "string" && raw.location.trim()) {
      dto.location = raw.location.trim();
    }

    let createdRecord = null;

    try {
      const response = await apiClient.post("/purchase", dto);
      createdRecord = response?.data || response;
    } catch (err) {
      console.warn("[Purchase API] Backend POST failed, executing offline save:", err?.message);
      createdRecord = {
        ...raw,
        ...dto,
        id: raw.id || `PUR-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    // Always mirror to local storage
    const storageDoc = {
      ...raw,
      ...createdRecord,
      type,
      status,
      refNo: createdRecord.refNo || raw.refNo,
    };
    saveDocument(storageDoc);

    return storageDoc;
  },

  /**
   * Updates an existing purchase record matching NestJS UpdatePurchaseRecordDto.
   */
  async updateRecord(id, raw) {
    const dto = {};
    if (raw.refNo) dto.refNo = String(raw.refNo).trim();
    if (raw.type) dto.type = normalizePurchaseType(raw.type);
    if (raw.vendor) dto.vendor = String(raw.vendor).trim();
    if (raw.status) dto.status = normalizePurchaseStatus(raw.status, raw.type);
    if (raw.vendorInvoiceNo) dto.vendorInvoiceNo = raw.vendorInvoiceNo.trim();
    if (raw.requestDate) dto.requestDate = formatIsoDate(raw.requestDate);
    if (raw.billDate) dto.billDate = formatIsoDate(raw.billDate);
    if (raw.dueDate) dto.dueDate = formatIsoDate(raw.dueDate);
    if (raw.purchaseDate) dto.purchaseDate = formatIsoDate(raw.purchaseDate);

    const numAmount = Number(raw.numericAmount ?? raw.grandTotal ?? raw.amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      dto.numericAmount = numAmount;
    }
    if (raw.department) dto.department = raw.department.trim();
    if (raw.priority) dto.priority = normalizeRfoPriority(raw.priority);
    if (raw.assetTag) dto.assetTag = raw.assetTag.trim();
    if (raw.name) dto.name = raw.name.trim();
    if (raw.model) dto.model = raw.model.trim();
    const numCost = Number(raw.numericCost ?? raw.cost);
    if (!isNaN(numCost) && numCost >= 0) {
      dto.numericCost = numCost;
    }
    if (raw.location) dto.location = raw.location.trim();

    let updated = null;
    try {
      const response = await apiClient.put(`/purchase/${id}`, dto);
      updated = response?.data || response;
    } catch (err) {
      console.warn("[Purchase API] Backend PUT failed, executing offline update:", err?.message);
      updated = { id, ...raw, ...dto };
    }

    updateStoredDocument(id, { ...raw, ...updated });
    return { ...raw, ...updated };
  },

  /**
   * Deletes / Soft-deletes a purchase record by ID
   */
  async deleteRecord(id) {
    try {
      await apiClient.delete(`/purchase/${id}`);
    } catch (err) {
      console.warn("[Purchase API] Backend DELETE failed, marking deleted locally:", err?.message);
    }
    deleteStoredDocument(id);
    return { id, success: true };
  },
};

export default purchaseApi;
