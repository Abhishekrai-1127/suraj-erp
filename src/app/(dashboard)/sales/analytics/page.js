"use client";

import React, { useState } from "react";
import SalesTabNav from "@/components/sales/sales-tab-nav";
import Drawer from "@/components/ui/drawer";
import SalesDrawerContent from "@/components/sales/sales-drawer-content";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard,
  Building2,
  Wallet,
  ArrowRight,
  FileSpreadsheet,
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
} from "recharts";
import { toast } from "sonner";

const topProducts = [
  { name: "Enterprise Hub", sales: 420 },
  { name: "Pro Plan", sales: 650 },
  { name: "Core Module", sales: 510 },
  { name: "Support+", sales: 780 },
  { name: "Cloud API", sales: 820 },
];

const categoryData = [
  { name: "Software Licenses", value: 45, color: "#2563eb" },
  { name: "Consulting Services", value: 35, color: "#cbd5e1" },
  { name: "Hardware Maintenance", value: 20, color: "#ea580c" },
];

const paymentData = [
  { name: "Credit Card", value: 52, color: "#2563eb" },
  { name: "Bank Transfer", value: 30, color: "#0284c7" },
  { name: "Digital Wallet", value: 18, color: "#b45309" },
];

const recentActivity = [
  { id: "#INV-88219", customer: "TechFlow Dynamics", amount: "₹12,450.00", status: "Paid", user: "John Doe", time: "2 mins ago" },
  { id: "#INV-88220", customer: "Apex Global Sol.", amount: "₹5,200.00", status: "Pending", user: "Mia Kim", time: "15 mins ago" },
  { id: "#INV-88221", customer: "Stellar Systems", amount: "₹42,900.00", status: "Paid", user: "Ray Burke", time: "1 hour ago" },
  { id: "#INV-88222", customer: "Cloud Nine Corp", amount: "₹1,150.00", status: "Overdue", user: "Sara Lee", time: "3 hours ago" },
];

export default function AnalyticsPage() {
  const [productPeriod, setProductPeriod] = useState("Monthly");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState("right");

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

      {/* Sub Tab Navigation */}
      <SalesTabNav />

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              +12.5%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹4,285,120</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              +8.2%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NEW SALES ORDERS</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">1,482</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              -2.4%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ACTIVE CUSTOMERS</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">892</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Fastest
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">AVG. CLOSING TIME</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">4.2 Days</div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Top Selling Products
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setProductPeriod("Weekly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  productPeriod === "Weekly" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white" : "text-slate-500"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setProductPeriod("Monthly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  productPeriod === "Monthly" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="sales" fill="#cbd5e1" radius={[8, 8, 0, 0]} activeBar={{ fill: "#2563eb" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sales by Category
          </h2>

          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
              <span className="text-[10px] text-slate-400 font-bold">Total Distribution</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-extrabold">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Activity (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recent Sales Activity
            </h2>
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View All Records
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created By</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">{row.id}</td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">{row.customer}</td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white font-black">{row.amount}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          row.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : row.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.user}</td>
                    <td className="py-3 px-3 text-slate-400">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payment Methods
          </h2>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-pay-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white">82%</span>
              <span className="text-[10px] text-slate-400 font-bold">Digital</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-blue-600" />
                <span className="text-slate-700 dark:text-slate-300">Credit Card</span>
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">52%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-sky-600" />
                <span className="text-slate-700 dark:text-slate-300">Bank Transfer</span>
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">30%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-amber-600" />
                <span className="text-slate-700 dark:text-slate-300">Digital Wallet</span>
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">18%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Performance Forecast & Sales Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Card (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 text-white p-7 shadow-lg flex flex-col justify-between space-y-5">
          <div className="space-y-2 max-w-lg">
            <h3 className="text-xl font-black">Performance Forecast</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Predictive modeling suggests a 15% increase in conversion rates for the next quarter based on current pipeline velocity.
            </p>
          </div>

          <button
            onClick={() => toast.info("Opening predictive analytics suite...")}
            className="flex items-center gap-2 w-fit px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
          >
            <span>View Full Forecast</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Leaderboard (1/3 width) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SALES LEADERBOARD</span>
            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-blue-600">01</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Marcus Vane</span>
                </div>
                <div className="w-24 bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[90%]" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-blue-600">02</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Elena Ross</span>
                </div>
                <div className="w-24 bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[75%]" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-blue-600">03</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Ivan Petrov</span>
                </div>
                <div className="w-24 bg-blue-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[60%]" />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Compare Teams
          </button>
        </div>
      </div>

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
