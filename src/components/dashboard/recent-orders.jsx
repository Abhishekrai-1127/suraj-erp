"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = () => {
      const docs = getStoredDocuments().filter((d) => d.type === "order");
      setOrders(
        docs.slice(0, 5).map((d) => ({
          id: d.refNo,
          customer: d.customer,
          amount: d.amount,
          status: d.status || "IN PROCESS",
          statusVariant: (d.status || "").toLowerCase().includes("dispatch")
            ? "shipped"
            : (d.status || "").toLowerCase().includes("process")
            ? "processing"
            : "draft",
          date: d.date,
        }))
      );
    };

    loadOrders();
    window.addEventListener("erp_document_created", loadOrders);
    window.addEventListener("storage", loadOrders);
    return () => {
      window.removeEventListener("erp_document_created", loadOrders);
      window.removeEventListener("storage", loadOrders);
    };
  }, []);

  return (
    <Card className="flex flex-col h-[380px]">
      <CardHeader className="flex flex-row items-center justify-between mb-4">
        <CardTitle>Recent Orders</CardTitle>
        <Link
          href="/sales/orders"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          View All
        </Link>
      </CardHeader>

      <CardContent className="flex-1 overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
              <th className="py-3 px-4 font-semibold rounded-l-xl">Order ID</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Amount</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold rounded-r-xl text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {orders.length > 0 ? (
              orders.map((order, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition duration-150 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <td className="py-4.5 px-4 font-bold text-slate-800 dark:text-slate-100">{order.id}</td>
                  <td className="py-4.5 px-4 font-medium text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                    {order.customer}
                  </td>
                  <td className="py-4.5 px-4 font-bold text-slate-800 dark:text-slate-100">{order.amount}</td>
                  <td className="py-4.5 px-4">
                    <Badge variant={order.statusVariant}>{order.status}</Badge>
                  </td>
                  <td className="py-4.5 px-4 font-medium text-slate-400 dark:text-slate-500">{order.date}</td>
                  <td className="py-4.5 px-4 text-center">
                    <Link
                      href="/sales/orders"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800/60 transition duration-150"
                    >
                      <Eye size={14} className="stroke-[2.2]" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-14 text-slate-400 dark:text-slate-500 font-medium text-xs">
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
