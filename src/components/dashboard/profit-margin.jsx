import React from "react";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";

export default function ProfitMargin() {
  return (
    <Card className="flex flex-col h-[230px] justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
        Profit Margin
      </span>

      {/* Progress & Target Section */}
      <div className="flex flex-col items-center justify-center flex-1 py-1">
        <CircularProgress percentage={70} size={110} strokeWidth={9}>
          <span className="text-xl font-extrabold text-slate-800 dark:text-white leading-none">
            70%
          </span>
          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-1 block">
            TARGET
          </span>
        </CircularProgress>
      </div>

      {/* Footer Text */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed">
        You are <span className="font-semibold text-slate-700 dark:text-slate-200">₹2.4L away</span> from monthly profit target
      </p>
    </Card>
  );
}
