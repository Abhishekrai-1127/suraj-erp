import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Package, Hammer } from "lucide-react";

export default function LowStockAlert() {
  const alerts = [
    {
      name: "Steel Grade 304",
      leftAmount: "80kg",
      reqAmount: "500kg",
      value: 80,
      max: 500,
      icon: Package,
      iconBg: "bg-red-50 text-red-500 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-900/30",
      progressBarColor: "bg-red-500 dark:bg-red-600",
      subtextStyle: "text-red-500 dark:text-red-400",
    },
    {
      name: "M8 Welding Rods",
      leftAmount: "12 boxes",
      reqAmount: "50 boxes",
      value: 12,
      max: 50,
      icon: Hammer,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30",
      progressBarColor: "bg-amber-600 dark:bg-amber-700",
      subtextStyle: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <Card className="flex flex-col h-[380px] justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
        Low Stock Alert
      </span>

      {/* Alert Items */}
      <CardContent className="space-y-4 p-0 flex-1 flex flex-col justify-center">
        {alerts.map((item, index) => (
          <div
            key={index}
            className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/20 dark:bg-slate-800/10 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 mb-3">
              {/* Icon */}
              <div className={`h-9 w-9 flex items-center justify-center rounded-lg ${item.iconBg}`}>
                <item.icon size={16} className="stroke-[2.2]" />
              </div>
              
              {/* Names and Limits */}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                  <span className={`font-bold ${item.subtextStyle}`}>{item.leftAmount} left</span>
                  <span className="mx-1.5 text-slate-300 dark:text-slate-700">•</span>
                  Req: {item.reqAmount}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              value={item.value}
              max={item.max}
              color={item.progressBarColor}
              className="mt-2 h-1.5"
            />
          </div>
        ))}
      </CardContent>

      {/* CTAs */}
      <button className="w-full bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold py-3.5 px-4 rounded-xl transition duration-150 mt-4 active:scale-[0.99]">
        Procure Now
      </button>
    </Card>
  );
}
