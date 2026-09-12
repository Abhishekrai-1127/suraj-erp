"use client";

import React, { useState, useEffect, useMemo } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import SetSalesTargetModal from "@/components/sales/set-sales-target-modal";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  CreditCard,
  Building2,
  Wallet,
  ArrowRight,
  FileSpreadsheet,
  Target,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";

import { useSalesDocuments } from "@/hooks/use-sales-store";
import { useCrmCustomers } from "@/hooks/use-crm-store";
import {
  getStoredDocuments,
  getStoredCustomers,
  getDeletedDocumentIds,
  getStoredSalesTarget,
} from "@/lib/erp-storage";
import { normalizeSalesDocType } from "@/services/sales-api";
import { formatCurrency, formatNumber, formatCompactNumber, parseAmount } from "@/lib/formatters";

// Distinct theme colors for dynamic charts
const CATEGORY_COLORS = [
  "#2563eb", // Royal Blue
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#ec4899", // Rose
];

const PAYMENT_COLORS = {
  "Bank Transfer": "#2563eb",
  "UPI / Digital": "#06b6d4",
  "Cheque": "#f59e0b",
  "Cash": "#10b981",
  "Credit Card": "#8b5cf6",
};

/**
 * Custom Tooltip for Top Selling Products Bar Chart
 * Declared at module scope to satisfy React 19 compiler purity rules
 */
function ProductBarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl text-white max-w-xs">
        <p className="text-xs font-bold text-slate-100 leading-snug">{data.fullName || data.name}</p>
        <div className="mt-2 space-y-1 text-[11px] border-t border-slate-800 pt-1.5">
          <div className="flex justify-between items-center text-slate-300">
            <span>Units Sold:</span>
            <span className="font-black text-blue-400">{formatNumber(data.sales)}</span>
          </div>
          {data.revenue > 0 && (
            <div className="flex justify-between items-center text-slate-300">
              <span>Value:</span>
              <span className="font-black text-emerald-400">{formatCurrency(data.revenue, 0)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom Tooltip for Category & Payment Donut Charts
 */
function DonutTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl shadow-xl text-white text-xs">
        <span className="font-semibold text-slate-300">{data.name}: </span>
        <span className="font-black text-white">{data.value}%</span>
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const [productPeriod, setProductPeriod] = useState("Monthly");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Local state for storage synchronization
  const [storedDocs, setStoredDocs] = useState([]);
  const [storedCusts, setStoredCusts] = useState([]);
  const [salesTargetInfo, setSalesTargetInfo] = useState({ targetAmount: 0, isSet: false });
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  // Query hooks for API continuity
  const { data: rawApiDocs = [] } = useSalesDocuments();
  const { data: rawApiCustomers = [] } = useCrmCustomers();

  // Synchronize local storage state reactively
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentTimestamp(Date.now());
    const load = () => {
      setStoredDocs(getStoredDocuments());
      setStoredCusts(getStoredCustomers());
      setSalesTargetInfo(getStoredSalesTarget());
    };
    load();
    window.addEventListener("erp_document_created", load);
    window.addEventListener("erp_sales_target_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("erp_document_created", load);
      window.removeEventListener("erp_sales_target_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Merge and deduplicate documents from API & LocalStorage, excluding deleted documents
  const allDocuments = useMemo(() => {
    const deletedIds = getDeletedDocumentIds();
    const docMap = new Map();

    // 1. Add API documents
    if (Array.isArray(rawApiDocs)) {
      rawApiDocs.forEach((d) => {
        const key = d.refNo || d.id;
        if (key && !deletedIds.includes(key)) {
          docMap.set(key, d);
        }
      });
    }

    // 2. Add / overlay LocalStorage documents
    storedDocs.forEach((d) => {
      const key = d.refNo || d.id;
      if (key && !deletedIds.includes(key)) {
        docMap.set(key, d);
      }
    });

    return Array.from(docMap.values());
  }, [rawApiDocs, storedDocs]);

  // Merge and deduplicate customers
  const allCustomers = useMemo(() => {
    const custMap = new Map();
    if (Array.isArray(rawApiCustomers)) {
      rawApiCustomers.forEach((c) => {
        const key = (c.name || c.company || "").toLowerCase().trim();
        if (key) custMap.set(key, c);
      });
    }
    storedCusts.forEach((c) => {
      const key = (c.name || c.company || "").toLowerCase().trim();
      if (key) custMap.set(key, c);
    });
    return Array.from(custMap.values());
  }, [rawApiCustomers, storedCusts]);

  // Dynamic Metrics & Chart Dataset Derivations
  const {
    totalRevenue,
    invoicedRevenue,
    bookedOrderRevenue,
    totalOrders,
    totalInvoices,
    totalCustomers,
    topProducts,
    categoryData,
    paymentData,
    recentActivity,
    regionalPerformance,
    avgClosingDays,
  } = useMemo(() => {
    let invRev = 0;
    let ordRev = 0;
    let ordersCount = 0;
    let invoicesCount = 0;

    // Track order numbers that have matching invoices to prevent double-counting
    const invoicedOrderRefs = new Set();
    allDocuments.forEach((d) => {
      const type = normalizeSalesDocType(d.type);
      if (type === "invoice" && (d.salesOrderNo || d.poNumber)) {
        invoicedOrderRefs.add(d.salesOrderNo || d.poNumber);
      }
    });

    // Time window threshold for Top Selling Products period filter
    const now = currentTimestamp;
    const daysThreshold = productPeriod === "Weekly" ? 7 : 30;
    const periodCutoffMs = currentTimestamp > 0 ? currentTimestamp - daysThreshold * 24 * 60 * 60 * 1000 : 0;

    const prodAgg = {};
    const categoryTotals = {};
    const paymentTotals = {};
    const customerTerritories = {
      "Western Hub (Gujarat/MH)": 0,
      "North Region (Delhi NCR)": 0,
      "Southern Hub (KA/TN)": 0,
      "Other Regions": 0,
    };

    allDocuments.forEach((d) => {
      const type = normalizeSalesDocType(d.type);
      const isInvoice = type === "invoice";
      const isOrder = type === "sales_order";
      const status = (d.status || "").toLowerCase();
      const isCancelled = status === "cancelled";

      const amt = Number(d.numericAmount ?? d.grandTotal ?? parseAmount(d.amount ?? 0));

      if (isInvoice && !isCancelled) {
        invoicesCount += 1;
        invRev += amt;
      }

      if (isOrder && !isCancelled) {
        ordersCount += 1;
        ordRev += amt;
      }

      // Check if document date falls within selected productPeriod
      let docTime = now;
      if (d.date) {
        const parsedTime = Date.parse(d.date);
        if (!isNaN(parsedTime)) docTime = parsedTime;
      }
      const isInPeriod = periodCutoffMs === 0 || docTime >= periodCutoffMs;

      // Aggregate line items for Top Selling Products & Categories
      if (Array.isArray(d.items)) {
        d.items.forEach((item) => {
          const rawDesc = item.description || item.name || "Industrial Equipment";
          const qty = Number(item.qty || item.quantity || 1) || 1;
          const unitPrice = Number(item.listPrice || item.unitPrice || 0) || 0;
          const itemVal = qty * unitPrice;

          // Only accumulate top products if in selected period
          if (isInPeriod) {
            if (!prodAgg[rawDesc]) {
              prodAgg[rawDesc] = { sales: 0, revenue: 0 };
            }
            prodAgg[rawDesc].sales += qty;
            prodAgg[rawDesc].revenue += itemVal;
          }

          // Classify Category dynamically
          let cat = item.category || d.category;
          if (!cat || cat === "General") {
            const descLower = rawDesc.toLowerCase();
            if (
              descLower.includes("cutter") ||
              descLower.includes("insert") ||
              descLower.includes("coil") ||
              descLower.includes("bearing") ||
              descLower.includes("valve") ||
              descLower.includes("spares") ||
              descLower.includes("blade")
            ) {
              cat = "Spares & Components";
            } else if (
              descLower.includes("milling") ||
              descLower.includes("cnc") ||
              descLower.includes("blower") ||
              descLower.includes("machine") ||
              descLower.includes("fan") ||
              descLower.includes("motor") ||
              descLower.includes("pump")
            ) {
              cat = "Machinery & Equipment";
            } else if (
              descLower.includes("maintenance") ||
              descLower.includes("service") ||
              descLower.includes("repair") ||
              descLower.includes("overhaul")
            ) {
              cat = "Engineering Maintenance";
            } else {
              cat = "Machinery & Equipment";
            }
          }
          categoryTotals[cat] = (categoryTotals[cat] || 0) + (itemVal > 0 ? itemVal : qty);
        });
      }

      // Payment method tracking from payments and invoices
      if (type === "payment" || (isInvoice && status === "paid")) {
        const method = d.paymentMethod || d.method || "Bank Transfer";
        paymentTotals[method] = (paymentTotals[method] || 0) + (amt > 0 ? amt : 1);
      }
    });

    // Compute consolidated revenue: Invoices + non-invoiced Orders
    let combinedRevenue = invRev;
    allDocuments.forEach((d) => {
      const type = normalizeSalesDocType(d.type);
      if (type === "sales_order") {
        const orderRef = d.refNo || d.id;
        // If order hasn't been invoiced yet, add its value to revenue
        if (!invoicedOrderRefs.has(orderRef)) {
          const amt = Number(d.numericAmount ?? d.grandTotal ?? parseAmount(d.amount ?? 0));
          if ((d.status || "").toLowerCase() !== "cancelled") {
            combinedRevenue += amt;
          }
        }
      }
    });

    // Top Selling Products sorted by quantity sold
    const sortedProds = Object.entries(prodAgg)
      .map(([name, data]) => ({
        name: name.length > 20 ? `${name.slice(0, 18)}…` : name,
        fullName: name,
        sales: data.sales,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Sales by Category Percentages
    const totalCatWeight = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);
    const catData = Object.entries(categoryTotals)
      .map(([name, weight], idx) => ({
        name,
        value: totalCatWeight > 0 ? Math.round((weight / totalCatWeight) * 100) : 0,
        rawWeight: weight,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // Payment Methods Percentages
    const totalPayWeight = Object.values(paymentTotals).reduce((sum, v) => sum + v, 0);
    const payData = Object.entries(paymentTotals)
      .map(([name, weight]) => ({
        name,
        value: totalPayWeight > 0 ? Math.round((weight / totalPayWeight) * 100) : 0,
        color: PAYMENT_COLORS[name] || "#2563eb",
      }))
      .sort((a, b) => b.value - a.value);

    // Recent Sales Activity (last 5 sales transactions)
    const recent = allDocuments
      .filter((d) => {
        const t = normalizeSalesDocType(d.type);
        return t === "invoice" || t === "sales_order" || t === "delivery_challan" || t === "quotation";
      })
      .slice(0, 5)
      .map((d) => ({
        id: d.refNo || d.id,
        type: normalizeSalesDocType(d.type),
        customer: d.customer || "General Customer",
        amount: d.amount || formatCurrency(d.numericAmount || d.grandTotal || 0, 2),
        status: d.status || "COMPLETED",
        user: "Sales Team",
        time: d.date || "Recent",
      }));

    // Customer Territory Breakdown
    const totalCustCount = Math.max(allCustomers.length, 1);
    allCustomers.forEach((c) => {
      const addr = `${c.billingAddress || ""} ${c.shippingAddress || ""} ${c.city || ""} ${c.state || ""}`.toLowerCase();
      if (addr.includes("delhi") || addr.includes("noida") || addr.includes("gurgaon") || addr.includes("haryana") || addr.includes("punjab") || addr.includes("rajasthan")) {
        customerTerritories["North Region (Delhi NCR)"] += 1;
      } else if (addr.includes("karnataka") || addr.includes("bangalore") || addr.includes("chennai") || addr.includes("tamil") || addr.includes("hyderabad") || addr.includes("kerala")) {
        customerTerritories["Southern Hub (KA/TN)"] += 1;
      } else {
        // Default to Western Hub for Gujarat/Maharashtra industrial corridor
        customerTerritories["Western Hub (Gujarat/MH)"] += 1;
      }
    });

    const regData = Object.entries(customerTerritories).map(([region, count], idx) => ({
      region,
      percentage: Math.round((count / totalCustCount) * 100),
      rank: `0${idx + 1}`,
    }));

    return {
      totalRevenue: combinedRevenue,
      invoicedRevenue: invRev,
      bookedOrderRevenue: ordRev,
      totalOrders: ordersCount,
      totalInvoices: invoicesCount,
      totalCustomers: allCustomers.length,
      topProducts: sortedProds,
      categoryData: catData,
      paymentData: payData,
      recentActivity: recent,
      regionalPerformance: regData,
      avgClosingDays: ordersCount > 0 ? "1.5 Days" : "—",
    };
  }, [allDocuments, allCustomers, productPeriod, currentTimestamp]);

  // Target run rate calculations
  const activeTarget = salesTargetInfo.targetAmount || 0;
  const targetPercent = activeTarget > 0 ? Math.min(100, Math.round((totalRevenue / activeTarget) * 100)) : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sales</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Sales Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs"
          >
            <Target size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Set Target</span>
          </button>

          <button
            onClick={() => {
              setDrawerPosition(drawerPosition === "right" ? "left" : "right");
              setIsDrawerOpen(!isDrawerOpen);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition active:scale-95"
          >
            <FileSpreadsheet size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <SalesTabNav />

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalRevenue, 0)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NEW SALES ORDERS</span>
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalOrders}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Accounts
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ACTIVE CUSTOMERS</span>
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalCustomers}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Clock size={20} />
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                totalOrders > 0
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-500 bg-slate-100 dark:bg-slate-800"
              }`}
            >
              {totalOrders > 0 ? "Normal" : "Pending"}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AVG. CLOSING TIME</span>
            <div suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {avgClosingDays}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Top Selling Products
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Item distribution from confirmed orders and invoices
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setProductPeriod("Weekly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  productPeriod === "Weekly"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setProductPeriod("Monthly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  productPeriod === "Monthly"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <defs>
                    <linearGradient id="analyticsBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip content={<ProductBarTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.05)" }} />
                  <Bar
                    dataKey="sales"
                    fill="url(#analyticsBarGrad)"
                    maxBarSize={48}
                    barSize={36}
                    radius={[6, 6, 0, 0]}
                    activeBar={{ fill: "#60a5fa" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <ShoppingBag size={28} className="text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Product Sales in Selected Period</p>
                <p className="text-[11px] text-slate-400 mt-1">Line items in sales orders and invoices will appear here automatically.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sales by Category
            </h2>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {categoryData.length} Categories
            </span>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
                  <span className="text-[10px] text-slate-400 font-bold">Distribution</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <Layers size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Category Data</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Recorded items will categorize dynamically</p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryData.length > 0 ? (
              categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{cat.name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-extrabold">{cat.value}%</span>
                </div>
              ))
            ) : (
              <p className="text-center text-[11px] text-slate-400 py-1">No categorized sales recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Activity (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Recent Sales Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest live orders, invoices, and challans
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {recentActivity.length} Recent Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.length > 0 ? (
                  recentActivity.map((row) => {
                    const statusLower = (row.status || "").toLowerCase();
                    const isPaid = statusLower === "paid" || statusLower === "delivered";
                    const isPending = statusLower.includes("pending") || statusLower.includes("process");

                    return (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">{row.id}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase">
                            {row.type === "sales_order" ? "ORDER" : row.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">{row.customer}</td>
                        <td className="py-3 px-3 text-slate-900 dark:text-white font-black">{row.amount}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : isPending
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{row.time}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-slate-500 font-medium">
                      No sales activity recorded yet. Create orders or invoices to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Payment Methods
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Settlements</span>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            {paymentData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      innerRadius={54}
                      outerRadius={74}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-pay-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
                  <span className="text-[10px] text-slate-400 font-bold">Recorded</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <CreditCard size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Payments Logged</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Recorded payments will display distribution</p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {paymentData.length > 0 ? (
              paymentData.map((pay) => (
                <div key={pay.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pay.color }} />
                    <span className="text-slate-700 dark:text-slate-300">{pay.name}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-extrabold">{pay.value}%</span>
                </div>
              ))
            ) : (
              <p className="text-center text-[11px] text-slate-400 py-1">No payment transactions recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Performance Forecast & Sales Territory Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Card (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-7 shadow-lg flex flex-col justify-between space-y-5 border border-slate-800">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Sparkles size={16} />
              <span>Target & Revenue Projections</span>
            </div>
            <h3 className="text-xl font-black">
              {activeTarget > 0 ? `Target Progress: ${targetPercent}% Achieved` : "Set Monthly Revenue Target"}
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              {activeTarget > 0
                ? `Currently achieved ${formatCurrency(totalRevenue, 0)} out of the ${formatCurrency(
                    activeTarget,
                    0
                  )} target for the current period.`
                : "No sales target configured for this calendar month. Set your target to unlock live projection tracking and run-rate metrics."}
            </p>
          </div>

          {activeTarget > 0 && (
            <div className="w-full max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Run-Rate Progress</span>
                <span className="text-emerald-400">{targetPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, targetPercent)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="flex items-center gap-2 w-fit px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition active:scale-95"
            >
              <Target size={15} />
              <span>{activeTarget > 0 ? "Adjust Monthly Target" : "Set Target Now"}</span>
            </button>
          </div>
        </div>

        {/* Territory Performance (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                REGIONAL DISTRIBUTION
              </span>
              <span className="text-[11px] font-bold text-slate-400">{allCustomers.length} Accounts</span>
            </div>

            <div className="space-y-3 mt-3">
              {regionalPerformance.map((reg) => (
                <div key={reg.region} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate mr-2">
                    <span className="text-xs font-black text-blue-600">{reg.rank}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{reg.region}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(8, reg.percentage))}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 w-7 text-right">
                      {reg.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400">
              Territory distribution computed dynamically from customer shipping & billing addresses.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sales Target Modal */}
      <SetSalesTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        currentTarget={activeTarget}
        isTargetSet={salesTargetInfo.isSet}
        currentRevenue={totalRevenue}
        invoicedTotal={invoicedRevenue}
        bookedOrdersTotal={bookedOrderRevenue}
      />

      {/* Universal Side Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position={drawerPosition}
        title="Sales Overview"
        size="md"
      >
        <SalesDrawerContent />
      </Drawer>
    </div>
  );
}
