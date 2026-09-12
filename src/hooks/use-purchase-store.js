"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoredDocuments, saveDocument, getDeletedDocumentIds, getStoredCustomers, saveCustomer } from "@/lib/erp-storage";
// BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
// import axios from "axios";

// Clean empty default state for Purchase Domain (no mock data)
export const DEFAULT_MOCK_RFOS = [];
export const DEFAULT_MOCK_PURCHASE_BILLS = [];
export const DEFAULT_MOCK_MACHINERY_ASSETS = [];

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
