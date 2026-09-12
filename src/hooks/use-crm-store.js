"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crmApi } from "@/services/crm-api";

// Query Keys Constants
export const CRM_QUERY_KEYS = {
  customers: (filters = {}) => ["crm", "customers", filters],
  customer: (id) => ["crm", "customer", id],
  leads: (filters = {}) => ["crm", "leads", filters],
  deals: (filters = {}) => ["crm", "deals", filters],
  contacts: () => ["crm", "contacts"],
  activities: (entityId) => ["crm", "activities", entityId],
};

// ==========================================
// CUSTOMER & VENDOR HOOKS
// ==========================================

export function useCrmCustomers(filters = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.customers(filters),
    queryFn: () => crmApi.getCustomers(filters),
    staleTime: 30 * 1000,
  });
}

export function useCrmCustomer(id) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.customer(id),
    queryFn: () => crmApi.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmApi.createCustomer(data),
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success(`${newRecord?.type || "Record"} "${newRecord?.name || ""}" saved successfully!`);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create customer/vendor record.");
    },
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success("Record updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update record.");
    },
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => crmApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "customers"] });
      toast.success("Record moved to trash successfully.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete record.");
    },
  });
}

// ==========================================
// LEADS HOOKS
// ==========================================

export function useCrmLeads(filters = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.leads(filters),
    queryFn: () => crmApi.getLeads(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmApi.createLead(data),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      toast.success(`Lead "${lead?.name || ""}" created successfully!`);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create lead.");
    },
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      toast.success("Lead details updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update lead.");
    },
  });
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => crmApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "leads"] });
      toast.success("Lead removed successfully.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete lead.");
    },
  });
}

// ==========================================
// DEALS HOOKS
// ==========================================

export function useCrmDeals(filters = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.deals(filters),
    queryFn: () => crmApi.getDeals(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmApi.createDeal(data),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      toast.success(`Deal "${deal?.title || ""}" added to pipeline!`);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create deal.");
    },
  });
}

export function useUpdateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateDeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      toast.success("Deal updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update deal.");
    },
  });
}

export function useDeleteDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => crmApi.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "deals"] });
      toast.success("Deal deleted.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete deal.");
    },
  });
}

// ==========================================
// CONTACTS HOOKS
// ==========================================

export function useCrmContacts() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.contacts(),
    queryFn: () => crmApi.getContacts(),
    staleTime: 30 * 1000,
  });
}

export function useCreateContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmApi.createContact(data),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      toast.success(`Contact "${c?.name || ""}" saved!`);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create contact.");
    },
  });
}

export function useUpdateContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      toast.success("Contact updated!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update contact.");
    },
  });
}

export function useDeleteContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => crmApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm", "contacts"] });
      toast.success("Contact removed.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete contact.");
    },
  });
}

// ==========================================
// ACTIVITIES HOOKS
// ==========================================

export function useCrmActivities(entityId) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.activities(entityId),
    queryFn: () => crmApi.getActivities(entityId),
    enabled: !!entityId,
  });
}

export function useLogActivityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => crmApi.logActivity(data),
    onSuccess: (act) => {
      if (act?.entityId) {
        queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.activities(act.entityId) });
      }
      toast.success("Activity logged to timeline!");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to log activity.");
    },
  });
}
