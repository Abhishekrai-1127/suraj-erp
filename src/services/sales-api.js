import apiClient from "@/lib/api-client";
import {
  getStoredDocuments,
  saveDocument,
  updateStoredDocument,
  deleteStoredDocument,
  getDeletedDocumentIds,
} from "@/lib/erp-storage";

/**
 * Strict Document Types matching Central ERP Backend NestJS DTO enum
 */
export const SalesDocType = {
  QUOTATION: "quotation",
  SALES_ORDER: "sales_order",
  INVOICE: "invoice",
  DELIVERY_CHALLAN: "delivery_challan",
  PAYMENT: "payment",
};

/**
 * Strict Document Statuses matching Central ERP Backend NestJS DTO enum
 */
export const SalesDocStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PAID: "PAID",
  UNPAID: "UNPAID",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
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
 * Maps frontend UI document types to backend Central ERP SalesDocType enum values
 */
export function normalizeSalesDocType(type) {
  if (!type) return SalesDocType.QUOTATION;
  const t = String(type).toLowerCase().trim();
  if (t === "order" || t === "sales_order") return SalesDocType.SALES_ORDER;
  if (t === "quotation" || t === "quote") return SalesDocType.QUOTATION;
  if (t === "invoice" || t === "bill") return SalesDocType.INVOICE;
  if (t === "challan" || t === "delivery_challan") return SalesDocType.DELIVERY_CHALLAN;
  if (t === "payment") return SalesDocType.PAYMENT;

  if (Object.values(SalesDocType).includes(t)) return t;
  return SalesDocType.QUOTATION;
}

/**
 * Normalizes frontend status strings to strict SalesDocStatus enum values
 */
export function normalizeSalesDocStatus(status, type = "") {
  if (!status) {
    if (type === "invoice") return SalesDocStatus.UNPAID;
    if (type === "sales_order") return SalesDocStatus.PENDING;
    if (type === "delivery_challan") return SalesDocStatus.DELIVERED;
    if (type === "quotation") return SalesDocStatus.PENDING;
    return SalesDocStatus.PENDING;
  }

  const s = String(status).toUpperCase().trim();

  // If already exactly a valid enum value, return it
  if (Object.values(SalesDocStatus).includes(s)) {
    return s;
  }

  if (s.includes("PAID") || s.includes("SETTLED") || s.includes("COMPLETED")) {
    return SalesDocStatus.PAID;
  }
  if (s.includes("UNPAID") || s.includes("OVERDUE") || s.includes("DUE") || s.includes("PARTIAL")) {
    return SalesDocStatus.UNPAID;
  }
  if (s.includes("DELIVER") || s.includes("DISPATCH") || s.includes("TRANSIT")) {
    return SalesDocStatus.DELIVERED;
  }
  if (s.includes("APPROV") || s.includes("ACCEPT") || s.includes("CONFIRM")) {
    return SalesDocStatus.APPROVED;
  }
  if (s.includes("CANCEL") || s.includes("REJECT") || s.includes("VOID") || s.includes("EXPIRE")) {
    return SalesDocStatus.CANCELLED;
  }
  if (s.includes("DRAFT")) {
    return SalesDocStatus.DRAFT;
  }
  if (s.includes("PROCESS") || s.includes("PROGRESS") || s.includes("PENDING") || s.includes("OPEN")) {
    return SalesDocStatus.PENDING;
  }

  return SalesDocStatus.PENDING;
}

/**
 * Formats a raw line item into a strict LineItemDto object matching backend class-validator rules
 */
export function buildLineItemDto(item, index = 0) {
  const desc = String(item.description || item.name || `Item ${index + 1}`).trim();
  const qty = Number(item.qty ?? item.quantity ?? 1) || 1;
  const listPrice = Number(item.listPrice ?? item.unitPrice ?? 0) || 0;
  const discRupees = Number(item.discRupees ?? item.discount ?? 0) || 0;
  const taxPercent = item.taxPercent !== undefined && item.taxPercent !== null && !isNaN(Number(item.taxPercent))
    ? Number(item.taxPercent)
    : 18;

  const dto = {
    description: desc || `Item ${index + 1}`,
    qty,
    listPrice,
  };

  if (item.productId && typeof item.productId === "string" && item.productId.trim()) {
    dto.productId = item.productId.trim();
  }
  if (item.sku && typeof item.sku === "string" && item.sku.trim()) {
    dto.sku = item.sku.trim();
  }
  if (item.hsnSac && typeof item.hsnSac === "string" && item.hsnSac.trim()) {
    dto.hsnSac = item.hsnSac.trim();
  }
  if (item.unit && typeof item.unit === "string" && item.unit.trim()) {
    dto.unit = item.unit.trim();
  }
  if (discRupees > 0) {
    dto.discRupees = discRupees;
  }
  if (taxPercent >= 0) {
    dto.taxPercent = taxPercent;
  }

  return dto;
}

/**
 * Constructs a strict CreateSalesDocDto payload for NestJS backend
 */
export function buildCreateSalesDocDto(raw) {
  const type = normalizeSalesDocType(raw.type);
  const status = normalizeSalesDocStatus(raw.status, type);
  const date = formatIsoDate(raw.date);

  const rawItems = Array.isArray(raw.items) && raw.items.length > 0
    ? raw.items
    : [{ description: "Standard Equipment", qty: 1, listPrice: 0 }];

  const items = rawItems.map((it, idx) => buildLineItemDto(it, idx));

  // Compute or sanitize financial segments
  let subtotal = Number(raw.subtotal);
  if (isNaN(subtotal) || subtotal <= 0) {
    subtotal = items.reduce((acc, it) => acc + (it.qty * it.listPrice - (it.discRupees || 0)), 0);
  }

  let taxTotal = Number(raw.taxTotal);
  if (isNaN(taxTotal)) {
    taxTotal = items.reduce((acc, it) => {
      const taxable = Math.max(0, it.qty * it.listPrice - (it.discRupees || 0));
      return acc + taxable * ((it.taxPercent ?? 18) / 100);
    }, 0);
  }

  let grandTotal = Number(raw.grandTotal ?? raw.numericAmount ?? raw.amount);
  if (isNaN(grandTotal) || grandTotal <= 0) {
    grandTotal = subtotal + taxTotal;
  }

  // CGST / SGST / IGST breakdown
  const isInterState = Boolean(
    raw.igstAmount ||
    (raw.placeOfSupply && !raw.placeOfSupply.toLowerCase().includes("delhi") && !raw.placeOfSupply.toLowerCase().includes("07"))
  );
  const cgstAmount = Number(raw.cgstAmount ?? (isInterState ? 0 : Math.round((taxTotal / 2) * 100) / 100));
  const sgstAmount = Number(raw.sgstAmount ?? (isInterState ? 0 : Math.round((taxTotal / 2) * 100) / 100));
  const igstAmount = Number(raw.igstAmount ?? (isInterState ? Math.round(taxTotal * 100) / 100 : 0));

  const dto = {
    refNo: String(raw.refNo || raw.id).trim(),
    type,
    customer: String(raw.customer || raw.company || "General Customer").trim(),
    items,
    status,
    date,
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount: Math.round(igstAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    currency: raw.currency || "INR (₹)",
  };

  if (raw.salesOrderNo && typeof raw.salesOrderNo === "string" && raw.salesOrderNo.trim()) {
    dto.salesOrderNo = raw.salesOrderNo.trim();
  }
  if (raw.poNumber && typeof raw.poNumber === "string" && raw.poNumber.trim()) {
    dto.poNumber = raw.poNumber.trim();
  }
  if (raw.customerId && typeof raw.customerId === "string" && raw.customerId.trim()) {
    dto.customerId = raw.customerId.trim();
  }
  const gstin = raw.gstin || raw.gst || raw.taxId;
  if (gstin && typeof gstin === "string" && gstin.trim()) {
    dto.gstin = gstin.trim();
  }
  if (raw.placeOfSupply && typeof raw.placeOfSupply === "string" && raw.placeOfSupply.trim()) {
    dto.placeOfSupply = raw.placeOfSupply.trim();
  }
  const validUntil = raw.validUntil || raw.dueDate;
  if (validUntil) {
    dto.validUntil = formatIsoDate(validUntil);
  }
  if (raw.notes && typeof raw.notes === "string" && raw.notes.trim()) {
    dto.notes = raw.notes.trim();
  }

  return dto;
}

/**
 * Constructs a strict UpdateSalesDocDto payload for NestJS backend
 */
export function buildUpdateSalesDocDto(raw) {
  const dto = {};

  if (raw.refNo) dto.refNo = String(raw.refNo).trim();
  if (raw.type) dto.type = normalizeSalesDocType(raw.type);
  if (raw.customer) dto.customer = String(raw.customer).trim();
  if (raw.status) dto.status = normalizeSalesDocStatus(raw.status, raw.type);
  if (raw.date) dto.date = formatIsoDate(raw.date);

  if (Array.isArray(raw.items) && raw.items.length > 0) {
    dto.items = raw.items.map((it, idx) => buildLineItemDto(it, idx));
  }

  if (raw.subtotal !== undefined && !isNaN(Number(raw.subtotal))) {
    dto.subtotal = Number(raw.subtotal);
  }
  if (raw.taxTotal !== undefined && !isNaN(Number(raw.taxTotal))) {
    dto.taxTotal = Number(raw.taxTotal);
  }
  if (raw.cgstAmount !== undefined && !isNaN(Number(raw.cgstAmount))) {
    dto.cgstAmount = Number(raw.cgstAmount);
  }
  if (raw.sgstAmount !== undefined && !isNaN(Number(raw.sgstAmount))) {
    dto.sgstAmount = Number(raw.sgstAmount);
  }
  if (raw.igstAmount !== undefined && !isNaN(Number(raw.igstAmount))) {
    dto.igstAmount = Number(raw.igstAmount);
  }
  if (raw.grandTotal !== undefined && !isNaN(Number(raw.grandTotal))) {
    dto.grandTotal = Number(raw.grandTotal);
  }

  if (raw.salesOrderNo && typeof raw.salesOrderNo === "string" && raw.salesOrderNo.trim()) {
    dto.salesOrderNo = raw.salesOrderNo.trim();
  }
  if (raw.poNumber && typeof raw.poNumber === "string" && raw.poNumber.trim()) {
    dto.poNumber = raw.poNumber.trim();
  }
  if (raw.customerId && typeof raw.customerId === "string" && raw.customerId.trim()) {
    dto.customerId = raw.customerId.trim();
  }
  const gstin = raw.gstin || raw.gst || raw.taxId;
  if (gstin && typeof gstin === "string" && gstin.trim()) {
    dto.gstin = gstin.trim();
  }
  if (raw.placeOfSupply && typeof raw.placeOfSupply === "string" && raw.placeOfSupply.trim()) {
    dto.placeOfSupply = raw.placeOfSupply.trim();
  }
  const validUntil = raw.validUntil || raw.dueDate;
  if (validUntil) {
    dto.validUntil = formatIsoDate(validUntil);
  }
  if (raw.notes && typeof raw.notes === "string" && raw.notes.trim()) {
    dto.notes = raw.notes.trim();
  }
  if (raw.currency && typeof raw.currency === "string" && raw.currency.trim()) {
    dto.currency = raw.currency.trim();
  }

  return dto;
}

/**
 * Generates local sequential reference number when backend is offline
 */
export function generateLocalSequentialRefNo(type) {
  const normalizedType = normalizeSalesDocType(type);
  const prefixMap = {
    quotation: "QT",
    sales_order: "SO",
    invoice: "INV",
    delivery_challan: "DC",
    payment: "PAY",
  };

  const prefix = prefixMap[normalizedType] || "DOC";
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`, "i");

  const storedDocs = getStoredDocuments();
  let maxSeq = 0;

  storedDocs.forEach((doc) => {
    const docType = normalizeSalesDocType(doc.type);
    if (docType === normalizedType && doc.refNo) {
      const match = doc.refNo.trim().match(pattern);
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
 * Central ERP Sales API Service connecting frontend with PostgreSQL backend.
 * Conforms strictly to CreateSalesDocDto, UpdateSalesDocDto, and SalesDocQueryDto.
 */
export const salesApi = {
  /**
   * Fetches list of sales documents with optional filtering matching SalesDocQueryDto.
   * @param {Object} params - { type, status, search, page, limit }
   */
  async getDocuments(params = {}) {
    const query = {};
    if (params.type && params.type !== "All") {
      query.type = normalizeSalesDocType(params.type);
    }
    if (params.status && params.status !== "All") {
      query.status = normalizeSalesDocStatus(params.status, params.type);
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
      const response = await apiClient.get("/sales/documents", { params: query });
      // Unwrap standard API response envelope
      const data = response?.data || response;
      return Array.isArray(data) ? data : data?.data || [];
    } catch (error) {
      if (error.isNetworkError) {
        console.warn("[Sales API] Backend unreachable, falling back to local storage.");
        let docs = getStoredDocuments();
        const deletedIds = getDeletedDocumentIds();
        docs = docs.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo));

        if (query.type) {
          docs = docs.filter(
            (d) => normalizeSalesDocType(d.type) === query.type
          );
        }
        if (query.status) {
          docs = docs.filter(
            (d) => normalizeSalesDocStatus(d.status, d.type) === query.status
          );
        }
        if (query.search) {
          const q = query.search.toLowerCase();
          docs = docs.filter(
            (d) =>
              (d.refNo || "").toLowerCase().includes(q) ||
              (d.customer || "").toLowerCase().includes(q) ||
              (d.salesOrderNo || "").toLowerCase().includes(q)
          );
        }
        return docs;
      }
      throw error;
    }
  },

  /**
   * Gets single document by ID or Reference Number
   */
  async getDocumentById(id) {
    try {
      const response = await apiClient.get(`/sales/documents/${id}`);
      return response?.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        return (
          getStoredDocuments().find(
            (d) => String(d.id) === String(id) || d.refNo === id
          ) || null
        );
      }
      throw error;
    }
  },

  /**
   * Fetches the next sequential reference number for a given document type
   * @param {string} type - 'quotation' | 'sales_order' | 'invoice' | 'delivery_challan'
   */
  async getNextRefNo(type) {
    const normalizedType = normalizeSalesDocType(type);
    try {
      const response = await apiClient.get("/sales/next-ref-no", {
        params: { type: normalizedType },
      });
      const data = response?.data || response;
      if (data?.refNo) {
        return data.refNo;
      }
      return generateLocalSequentialRefNo(type);
    } catch (error) {
      console.warn("[Sales API] Failed to fetch next ref no from backend, using local generator.", error?.message);
      return generateLocalSequentialRefNo(type);
    }
  },

  /**
   * Check if an invoice already exists for a given Sales Order
   */
  async checkInvoiceExists(salesOrderNo) {
    if (!salesOrderNo) return { exists: false };
    try {
      const response = await apiClient.get("/sales/check-invoice-exists", {
        params: { salesOrderNo },
      });
      return response?.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        const stored = getStoredDocuments();
        const exists = stored.some(
          (d) =>
            normalizeSalesDocType(d.type) === "invoice" &&
            (d.salesOrderNo === salesOrderNo || d.poNumber === salesOrderNo)
        );
        return { exists, salesOrderNo };
      }
      throw error;
    }
  },

  /**
   * Creates a new sales document in Central ERP Backend conforming strictly to CreateSalesDocDto
   */
  async createDocument(payload) {
    const dto = buildCreateSalesDocDto(payload);

    try {
      const response = await apiClient.post("/sales/documents", dto);
      const saved = response?.data || response;

      // Always synchronize with local storage for offline continuity & full UI rendering
      saveDocument({
        ...payload,
        ...dto,
        id: saved.id || payload.id || Date.now(),
        refNo: saved.refNo || dto.refNo,
        numericAmount: dto.grandTotal,
        amount:
          payload.amount ||
          `₹${dto.grandTotal.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      });

      return saved;
    } catch (error) {
      if (error.isNetworkError) {
        console.warn("[Sales API] Backend unreachable, saving locally.", error?.message);
        const localDoc = {
          ...payload,
          ...dto,
          id: Date.now(),
          numericAmount: dto.grandTotal,
          amount:
            payload.amount ||
            `₹${dto.grandTotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        };
        saveDocument(localDoc);
        return localDoc;
      }
      throw error;
    }
  },

  /**
   * Updates an existing sales document conforming strictly to UpdateSalesDocDto
   */
  async updateDocument(id, payload) {
    const dto = buildUpdateSalesDocDto(payload);

    try {
      const response = await apiClient.put(`/sales/documents/${id}`, dto);
      const updated = response?.data || response;
      updateStoredDocument(id, { ...payload, ...dto });
      return updated;
    } catch (error) {
      if (error.isNetworkError) {
        updateStoredDocument(id, { ...payload, ...dto });
        return { id, ...payload, ...dto };
      }
      throw error;
    }
  },

  /**
   * Soft-deletes a sales document
   */
  async deleteDocument(id) {
    try {
      const response = await apiClient.delete(`/sales/documents/${id}`);
      deleteStoredDocument(id);
      return response?.data || response;
    } catch (error) {
      if (error.isNetworkError) {
        deleteStoredDocument(id);
        return { success: true, id };
      }
      throw error;
    }
  },
};

export default salesApi;
