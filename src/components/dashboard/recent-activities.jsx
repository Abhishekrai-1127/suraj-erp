import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Landmark,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function RecentActivities() {
  const activities = [
    {
      description: (
        <>
          New Invoice generated for{" "}
          <a href="#" className="text-blue-600 hover:underline font-bold">
            Global Machining Inc.
          </a>{" "}
          (₹1,85,000)
        </>
      ),
      time: "10 mins ago",
      icon: FileText,
      iconBg: "bg-blue-500 text-white shadow-md shadow-blue-500/20",
    },
    {
      description: (
        <>
          Payment Received from{" "}
          <a href="#" className="text-blue-600 hover:underline font-bold">
            Apex Steel Works
          </a>{" "}
          via NEFT
        </>
      ),
      time: "1 hour ago",
      icon: Landmark,
      iconBg: "bg-amber-600 text-white shadow-md shadow-amber-600/20",
    },
    {
      description: (
        <>
          Production Update: Batch #204 moved to{" "}
          <a href="#" className="text-blue-600 hover:underline font-bold">
            Cutting
          </a>{" "}
          stage
        </>
      ),
      time: "3 hours ago",
      icon: RefreshCw,
      iconBg: "bg-slate-500 text-white shadow-md shadow-slate-500/20",
    },
    {
      description: (
        <>
          Purchase Order #PO-4481 approved for{" "}
          <a href="#" className="text-blue-600 hover:underline font-bold">
            Larsen & Co.
          </a>{" "}
          (₹84,200)
        </>
      ),
      time: "5 hours ago",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
    },
    {
      description: (
        <>
          Stock Threshold Alert:{" "}
          <a href="#" className="text-blue-600 hover:underline font-bold">
            Steel Grade 304
          </a>{" "}
          reached reorder point (80kg left)
        </>
      ),
      time: "6 hours ago",
      icon: AlertTriangle,
      iconBg: "bg-rose-500 text-white shadow-md shadow-rose-500/20",
    },
  ];

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-4">
        Recent Activities
      </span>

      {/* Timeline list */}
      <CardContent className="p-0 relative pl-4 space-y-4 flex-1">
        {/* Vertical timeline line */}
        <div className="absolute top-1 left-[28px] bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800/80" />

        {activities.map((item, idx) => (
          <div key={idx} className="relative flex items-center justify-between group">
            {/* Left: Icon and Message */}
            <div className="flex items-center gap-4.5">
              {/* Icon Container with absolute positioning relative to line */}
              <div className={`relative z-10 h-8 w-8 flex items-center justify-center rounded-full ${item.iconBg}`}>
                <item.icon size={14} className="stroke-[2.2]" />
              </div>

              {/* Text Description */}
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {item.description}
              </p>
            </div>

            {/* Right: Timestamp */}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold text-right select-none whitespace-nowrap pl-4">
              {item.time}
            </span>
          </div>
        ))}
      </CardContent>

      {/* Thoughtful Summary Line / Insight Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500 shrink-0" />
          <span className="text-[11px] font-semibold italic text-slate-600 dark:text-slate-300">
            &ldquo;Excellence is not an act, but a habit. Operational consistency drives success.&rdquo;
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full shrink-0">
          98.4% System Efficiency
        </span>
      </div>
    </Card>
  );
}
