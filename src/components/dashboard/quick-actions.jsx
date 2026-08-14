import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  FileCheck,
  ShoppingCart,
  UserPlus,
  CreditCard,
  Package,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    { label: "Create Quotation", icon: FileText },
    { label: "Create Invoice", icon: FileCheck },
    { label: "Add Purchase", icon: ShoppingCart },
    { label: "Add Customer", icon: UserPlus },
    { label: "Add Expense", icon: CreditCard },
    { label: "Add Product", icon: Package },
  ];

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      {/* Title Header */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-4">
        Quick Actions
      </span>

      {/* Grid of Action Buttons */}
      <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full flex-1">
        {actions.map((act, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center p-3 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-800/50 rounded-2xl transition-all duration-200 active:scale-[0.97] select-none group text-center"
          >
            {/* Circular Icon Container */}
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <act.icon size={18} className="stroke-[2] transition-transform group-hover:scale-110" />
            </div>

            {/* Action Label */}
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 leading-tight mt-2 whitespace-normal break-words">
              {act.label}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
