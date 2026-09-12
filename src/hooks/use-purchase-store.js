"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseApi } from "@/services/purchase-api";
import { getStoredDocuments, getDeletedDocumentIds } from "@/lib/erp-storage";

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

    let records = [];
    if (typeFilter === "rfo") {
      const storedRfos = storedDocs.filter((d) => d.type === "rfo");
      records = storedRfos.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo));
    } else if (typeFilter === "purchase_bill") {
      const storedBills = storedDocs.filter((d) => d.type === "purchase_bill");
      records = storedBills.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo));
    } else if (typeFilter === "purchased_machinery") {
      const storedMachinery = storedDocs.filter((d) => d.type === "purchased_machinery");
      records = storedMachinery.filter(
        (d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo) && !deletedIds.includes(d.assetTag)
      );
    } else {
      const purchaseTypes = ["rfo", "purchase_bill", "purchased_machinery"];
      const storedPurchase = storedDocs.filter((d) => purchaseTypes.includes(d.type));
      records = storedPurchase.filter((d) => !deletedIds.includes(d.id) && !deletedIds.includes(d.refNo));
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
export function usePurchaseRecords(typeFilter = null, params = {}) {
  return useQuery({
    queryKey: ["purchaseRecords", typeFilter || "all", params],
    queryFn: async () => {
      try {
        const records = await purchaseApi.getRecords({
          type: typeFilter,
          ...params,
        });
        return records;
      } catch (err) {
        console.warn("[usePurchaseRecords] API query failed, falling back to local storage:", err?.message);
        return fetchPurchaseRecords(typeFilter);
      }
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
      return await purchaseApi.createRecord(newRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
        window.dispatchEvent(new Event("suraj_erp_document_created"));
      }
    },
  });
}

/**
 * TanStack React Query mutation hook to update purchase records
 */
export function useUpdatePurchaseRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      return await purchaseApi.updateRecord(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
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
      return await purchaseApi.deleteRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRecords"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("suraj_erp_purchase_updated"));
      }
    },
  });
}
