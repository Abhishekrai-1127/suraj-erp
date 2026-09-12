"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
// import axios from "axios";

export const STORAGE_INVENTORY_PRODUCTS_KEY = "suraj_erp_inventory_products";
export const STORAGE_INVENTORY_MOVEMENTS_KEY = "suraj_erp_inventory_movements";
export const STORAGE_INVENTORY_WAREHOUSES_KEY = "suraj_erp_inventory_warehouses";

export const DEFAULT_PRODUCTS = [];
export const DEFAULT_MOVEMENTS = [];

export const DEFAULT_WAREHOUSES = [
  {
    id: "WH-01",
    name: "Suraj Main Factory & Central Storage Hub",
    city: "Main Plant",
    capacity: "84%",
    status: "ACTIVE",
    manager: "Plant Operations Lead",
    address: "Suraj Industrial Complex, Gate #2",
    bays: ["Bay A - Raw Materials", "Bay B - Machined Components", "Bay C - Finished Goods", "Bay D - Toolroom & Optics"],
  },
];

export function getStoredInventoryProducts() {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_INVENTORY_PRODUCTS_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

export function getStoredInventoryMovements() {
  if (typeof window === "undefined") return DEFAULT_MOVEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_INVENTORY_MOVEMENTS_KEY);
    if (!raw) return DEFAULT_MOVEMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MOVEMENTS;
  } catch (e) {
    return DEFAULT_MOVEMENTS;
  }
}

export function saveInventoryProduct(product) {
  if (typeof window === "undefined") return;
  const current = getStoredInventoryProducts();
  const updated = [product, ...current];
  localStorage.setItem(STORAGE_INVENTORY_PRODUCTS_KEY, JSON.stringify(updated));
}

export function saveInventoryMovement(movement) {
  if (typeof window === "undefined") return;
  const current = getStoredInventoryMovements();
  const updated = [movement, ...current];
  localStorage.setItem(STORAGE_INVENTORY_MOVEMENTS_KEY, JSON.stringify(updated));
}

/**
 * TanStack React Query Hooks for Inventory
 */
export function useInventoryProducts() {
  return useQuery({
    queryKey: ["inventoryProducts"],
    queryFn: async () => {
      // BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
      // const res = await axios.get('/api/inventory/products'); return res.data;
      return getStoredInventoryProducts();
    },
    staleTime: 1000 * 5,
  });
}

export function useInventoryMovements() {
  return useQuery({
    queryKey: ["inventoryMovements"],
    queryFn: async () => {
      // BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
      // const res = await axios.get('/api/inventory/movements'); return res.data;
      return getStoredInventoryMovements();
    },
    staleTime: 1000 * 5,
  });
}

export function useCreateInventoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry) => {
      // BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
      // const res = await axios.post('/api/inventory', entry); return res.data;

      if (entry.type === "product") {
        saveInventoryProduct(entry.data);
      }
      if (entry.movement) {
        saveInventoryMovement(entry.movement);
      }
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryMovements"] });
    },
  });
}
