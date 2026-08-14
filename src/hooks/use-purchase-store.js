"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredDocuments, saveDocument, getDeletedDocumentIds, getStoredCustomers, saveCustomer } from "@/lib/erp-storage";
// BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
// import axios from "axios";

// Default Initial Seed Data for Purchase Domain
export const DEFAULT_MOCK_RFOS = [
  {
    id: "RFO-2024-901",
    refNo: "RFO-2024-901",
    vendor: "Apex Industrial Solutions",
    initials: "AI",
    requestDate: "Oct 14, 2024",
    targetDeliveryDate: "Oct 28, 2024",
    amount: "₹1,45,000.00",
    numericAmount: 145000,
    department: "Toolroom & Precision Machining",
    priority: "HIGH",
    status: "PENDING APPROVAL",
  },
  {
    id: "RFO-2024-884",
    refNo: "RFO-2024-884",
    vendor: "Yamazaki Mazak Corp",
    initials: "YM",
    requestDate: "Oct 11, 2024",
    targetDeliveryDate: "Nov 05, 2024",
    amount: "₹12,80,000.00",
    numericAmount: 1280000,
    department: "Production & Manufacturing",
    priority: "URGENT",
    status: "APPROVED",
  },
  {
    id: "RFO-2024-762",
    refNo: "RFO-2024-762",
    vendor: "Precision Tools India",
    initials: "PT",
    requestDate: "Oct 08, 2024",
    targetDeliveryDate: "Oct 20, 2024",
    amount: "₹65,400.00",
    numericAmount: 65400,
    department: "Stores & Warehouse Material",
    priority: "NORMAL",
    status: "CANCELLED",
  },
];

export const DEFAULT_MOCK_PURCHASE_BILLS = [
  {
    id: "PB-2024-001",
    refNo: "PB-2024-001",
    vendor: "Haas Automation India",
    initials: "HA",
    billDate: "Oct 12, 2024",
    dueDate: "Nov 12, 2024",
    amount: "₹38,50,000.00",
    numericAmount: 3850000,
    vendorInvoiceNo: "VINV-99120",
    status: "UNPAID",
  },
  {
    id: "PB-2024-002",
    refNo: "PB-2024-002",
    vendor: "Trumpf India Ltd",
    initials: "TI",
    billDate: "Oct 05, 2024",
    dueDate: "Oct 25, 2024",
    amount: "₹15,20,000.00",
    numericAmount: 1520000,
    vendorInvoiceNo: "VINV-88210",
    status: "PAID",
  },
  {
    id: "PB-2024-003",
    refNo: "PB-2024-003",
    vendor: "Atlas Copco India",
    initials: "AC",
    billDate: "Sep 28, 2024",
    dueDate: "Oct 28, 2024",
    amount: "₹6,40,000.00",
    numericAmount: 640000,
    vendorInvoiceNo: "VINV-77140",
    status: "PARTIALLY PAID",
  },
];

export const DEFAULT_MOCK_MACHINERY_ASSETS = [
  {
    id: "MAC-2024-881",
    assetTag: "MAC-2024-881",
    refNo: "MAC-2024-881",
    name: "CNC 5-Axis Milling Machine",
    model: "Haas VF-4SS High Speed Vertical Center",
    category: "CNC Machining",
    vendor: "Haas Automation India",
    initials: "HA",
    purchaseDate: "Jan 15, 2024",
    cost: "₹38,50,000.00",
    warrantyExpiry: "Jan 15, 2026",
    location: "Bay A - Main Workshop",
    status: "OPERATIONAL",
  },
  {
    id: "MAC-2023-402",
    assetTag: "MAC-2023-402",
    refNo: "MAC-2023-402",
    name: "Fiber Laser Cutting System 6kW",
    model: "Trumpf TruLaser 3030 Fiber",
    category: "Laser Processing",
    vendor: "Trumpf India Ltd",
    initials: "TI",
    purchaseDate: "Aug 20, 2023",
    cost: "₹68,00,000.00",
    warrantyExpiry: "Aug 20, 2025",
    location: "Bay C - Laser Room",
    status: "OPERATIONAL",
  },
  {
    id: "MAC-2023-109",
    assetTag: "MAC-2023-109",
    refNo: "MAC-2023-109",
    name: "Hydraulic CNC Press Brake 200T",
    model: "Apex Heavy Press Tech HP-200",
    category: "Forming & Pressing",
    vendor: "Apex Industrial Solutions",
    initials: "AI",
    purchaseDate: "Mar 10, 2023",
    cost: "₹24,50,000.00",
    warrantyExpiry: "Mar 10, 2025",
    location: "Bay B - Heavy Press Area",
    status: "UNDER MAINTENANCE",
  },
];

/**
 * Reads purchase records from local storage, merging with initial seed records
 */
export function fetchPurchaseRecords(typeFilter = null) {
  if (typeof window === "undefined") return [];

  try {
    const storedDocs = getStoredDocuments();
    const deletedIds = getDeletedDocumentIds();

    // Map saved documents
    let records = [];
    if (typeFilter === "rfo") {
      const storedRfos = storedDocs.filter(d => d.type === "rfo");
      const seen = new Set(storedRfos.map(d => d.refNo || d.id));
      const filteredDefaults = DEFAULT_MOCK_RFOS.filter(d => !deletedIds.includes(d.id) && !seen.has(d.id));
      records = [...storedRfos, ...filteredDefaults];
    } else if (typeFilter === "purchase_bill") {
      const storedBills = storedDocs.filter(d => d.type === "purchase_bill");
      const seen = new Set(storedBills.map(d => d.refNo || d.id));
      const filteredDefaults = DEFAULT_MOCK_PURCHASE_BILLS.filter(d => !deletedIds.includes(d.id) && !seen.has(d.id));
      records = [...storedBills, ...filteredDefaults];
    } else if (typeFilter === "purchased_machinery") {
      const storedMachinery = storedDocs.filter(d => d.type === "purchased_machinery");
      const seen = new Set(storedMachinery.map(d => d.refNo || d.assetTag || d.id));
      const filteredDefaults = DEFAULT_MOCK_MACHINERY_ASSETS.filter(d => !deletedIds.includes(d.id) && !seen.has(d.id));
      records = [...storedMachinery, ...filteredDefaults];
    } else {
      // Return all purchase records
      const purchaseTypes = ["rfo", "purchase_bill", "purchased_machinery"];
      const storedPurchase = storedDocs.filter(d => purchaseTypes.includes(d.type));
      const seen = new Set(storedPurchase.map(d => d.refNo || d.id));
      const defaultAll = [...DEFAULT_MOCK_RFOS, ...DEFAULT_MOCK_PURCHASE_BILLS, ...DEFAULT_MOCK_MACHINERY_ASSETS];
      const filteredDefaults = defaultAll.filter(d => !deletedIds.includes(d.id) && !seen.has(d.id));
      records = [...storedPurchase, ...filteredDefaults];
    }

    return records;
  } catch (e) {
    console.error("Failed to fetch purchase records from store", e);
    return [];
  }
}

/**
 * TanStack React Query custom hook to fetch purchase records in real time
 */
export function usePurchaseRecords(typeFilter = null) {
  return useQuery({
    queryKey: ["purchaseRecords", typeFilter || "all"],
    queryFn: async () => {
      // BACKEND PREPARATION: Uncomment below when backend API endpoints are ready in 2 days
      // const response = await axios.get(`/api/purchase?type=${typeFilter || ''}`);
      // return response.data;
      return fetchPurchaseRecords(typeFilter);
    },
    staleTime: 1000 * 5, // 5 seconds
  });
}

/**
 * TanStack React Query mutation hook to create purchase records with instant cache invalidation
 */
export function useCreatePurchaseRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRecord) => {
      // BACKEND PREPARATION: Uncomment below when backend API endpoints are ready in 2 days
      // const response = await axios.post('/api/purchase', newRecord);
      // return response.data;

      if (newRecord.type === "vendor") {
        saveCustomer({
          id: "vend-" + Date.now(),
          name: newRecord.companyName || newRecord.name,
          code: newRecord.code || "VN",
          category: newRecord.category || "Supplier",
          taxId: newRecord.gstId || "GST-VENDOR",
        });
      } else {
        saveDocument(newRecord);
      }
      return newRecord;
    },
    onSuccess: () => {
      // Automatically invalidate and refetch all purchase queries across the application
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
        window.dispatchEvent(new Event("suraj_erp_document_created"));
      }
    },
  });
}

/**
 * TanStack React Query mutation hook to delete purchase records
 */
export function useDeletePurchaseRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId) => {
      // BACKEND PREPARATION: Uncomment below when backend API endpoints are ready in 2 days
      // await axios.delete(`/api/purchase/${recordId}`);

      if (typeof window !== "undefined") {
        const deletedKey = "suraj_erp_deleted_documents";
        const current = getDeletedDocumentIds();
        if (!current.includes(recordId)) {
          current.push(recordId);
          localStorage.setItem(deletedKey, JSON.stringify(current));
        }
      }
      return recordId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
      }
    },
  });
}
