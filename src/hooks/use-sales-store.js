"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesApi, normalizeSalesDocType } from "@/services/sales-api";

// Query Keys Constants
export const SALES_QUERY_KEYS = {
  documents: (filters = {}) => ["sales", "documents", filters],
  document: (id) => ["sales", "document", id],
  nextRefNo: (type) => ["sales", "next-ref-no", normalizeSalesDocType(type)],
};

// ==========================================
// SALES DOCUMENTS QUERY HOOKS
// ==========================================

/**
 * Hook to fetch sales documents with real-time caching and filtering.
 */
export function useSalesDocuments(filters = {}) {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.documents(filters),
    queryFn: () => salesApi.getDocuments(filters),
    staleTime: 15 * 1000,
  });
}

/**
 * Hook to fetch single sales document by ID or ref number.
 */
export function useSalesDocument(id) {
  return useQuery({
    queryKey: SALES_QUERY_KEYS.document(id),
    queryFn: () => salesApi.getDocumentById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch the next sequential reference number for a given document type.
 */
export function useNextSalesRefNo(type, options = {}) {
  const normalizedType = normalizeSalesDocType(type);
  return useQuery({
    queryKey: SALES_QUERY_KEYS.nextRefNo(normalizedType),
    queryFn: () => salesApi.getNextRefNo(normalizedType),
    staleTime: 5 * 1000,
    ...options,
  });
}

// ==========================================
// MUTATION HOOKS
// ==========================================

/**
 * Hook to create sales documents with optimistic cache invalidation.
 */
export function useCreateSalesDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => salesApi.createDocument(payload),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["sales", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "next-ref-no"] });
      toast.success(
        `${newDoc?.type ? newDoc.type.toUpperCase() : "Document"} ${newDoc?.refNo || ""} created successfully!`
      );
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create sales document.");
    },
  });
}

/**
 * Hook to update sales documents.
 */
export function useUpdateSalesDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => salesApi.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "next-ref-no"] });
      toast.success("Document updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update sales document.");
    },
  });
}

/**
 * Hook to delete a sales document.
 */
export function useDeleteSalesDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salesApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "next-ref-no"] });
      toast.success("Document removed successfully.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete document.");
    },
  });
}
