"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// BACKEND PREPARATION: Uncomment line below when backend API endpoints are ready in 2 days
// import axios from "axios";

export const STORAGE_INVENTORY_PRODUCTS_KEY = "suraj_erp_inventory_products";
export const STORAGE_INVENTORY_MOVEMENTS_KEY = "suraj_erp_inventory_movements";
export const STORAGE_INVENTORY_WAREHOUSES_KEY = "suraj_erp_inventory_warehouses";

export const DEFAULT_PRODUCTS = [
  {
    id: "PROD-001",
    name: "Industrial Gear Set X12",
    sku: "IG-1200-BL",
    category: "Mechanical Parts",
    warehouse: "Suraj Main Factory Warehouse (Bay A)",
    stock: 850,
    minReorder: 100,
    unitPrice: 4250,
    unit: "Units",
    status: "IN STOCK",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "PROD-002",
    name: "Copper Wiring (500m)",
    sku: "CW-500-M1",
    category: "Electrical",
    warehouse: "Suraj Main Factory Warehouse (Bay B)",
    stock: 140,
    minReorder: 50,
    unitPrice: 12800,
    unit: "Rolls",
    status: "IN STOCK",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "PROD-003",
    name: "HDPE Raw Pellets (Grade A)",
    sku: "RP-HD-99",
    category: "Raw Polymers",
    warehouse: "Suraj Main Factory Warehouse (Bay C)",
    stock: 520,
    minReorder: 150,
    unitPrice: 850,
    unit: "Bags",
    status: "IN STOCK",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "PROD-004",
    name: "Fiber Laser Optic Lens 50mm",
    sku: "FL-LENS-50",
    category: "Laser Optics",
    warehouse: "Suraj Main Factory Warehouse (Bay A)",
    stock: 12,
    minReorder: 20,
    unitPrice: 18500,
    unit: "Pcs",
    status: "LOW STOCK",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "PROD-005",
    name: "Carbide Cutting Inserts (PVD)",
    sku: "CMI-PVD-10",
    category: "Cutting Tools",
    warehouse: "Suraj Main Factory Warehouse (Bay D)",
    stock: 0,
    minReorder: 30,
    unitPrice: 1250,
    unit: "Boxes",
    status: "OUT OF STOCK",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=100&auto=format&fit=crop&q=80",
  },
];

export const DEFAULT_MOVEMENTS = [
  {
    id: "MOV-1001",
    productName: "Industrial Gear Set X12",
    sku: "IG-1200-BL",
    warehouse: "Suraj Main Factory Warehouse",
    type: "STOCK IN",
    quantity: "+250 Units",
    dateTime: "24 Oct 2023, 11:32 AM",
    user: "R. Sharma",
    status: "Completed",
  },
  {
    id: "MOV-1002",
    productName: "Copper Wiring (500m)",
    sku: "CW-500-M1",
    warehouse: "Suraj Main Factory Warehouse",
    type: "STOCK OUT",
    quantity: "-1,200 Units",
    dateTime: "24 Oct 2023, 10:15 AM",
    user: "A. Verma",
    status: "Completed",
  },
  {
    id: "MOV-1003",
    productName: "HDPE Raw Pellets (Grade A)",
    sku: "RP-HD-99",
    warehouse: "Suraj Main Factory Warehouse (Bay C)",
    type: "TRANSFER",
    quantity: "50 Bags",
    dateTime: "24 Oct 2023, 09:45 AM",
    user: "K. Patel",
    status: "Completed",
  },
];

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
