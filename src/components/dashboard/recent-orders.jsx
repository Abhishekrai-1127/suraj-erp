import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export default function RecentOrders() {
  const orders = [
    {
      id: "#ORD-9921",
      customer: "Global Machining Inc.",
      amount: "₹1,85,000",
      status: "Shipped",
      statusVariant: "shipped",
      date: "Oct 24, 2023",
    },
    {
      id: "#ORD-9922",
      customer: "Larsen & Co.",
      amount: "₹84,200",
      status: "Processing",
      statusVariant: "processing",
      date: "Oct 23, 2023",
    },
    {
      id: "#ORD-9923",
      customer: "Apex Steel Works",
      amount: "₹2,12,000",
      status: "Draft",
      statusVariant: "draft",
      date: "Oct 23, 2023",
    },
  ];

  return (
    <Card className="flex flex-col h-[380px]">
      <CardHeader className="flex flex-row items-center justify-between mb-4">
        <CardTitle>Recent Orders</CardTitle>
        <a
          href="#"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          View All
        </a>
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
            {orders.map((order, idx) => (
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
                  <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800/60 transition duration-150">
                    <Eye size={14} className="stroke-[2.2]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
