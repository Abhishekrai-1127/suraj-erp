"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Landmark,
  Truck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getStoredDocuments } from "@/lib/erp-storage";

export default function RecentActivities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadActivities = () => {
      const docs = getStoredDocuments().slice(0, 5);
      const items = docs.map((doc) => {
        if (doc.type === "invoice") {
          return {
            description: (
              <>
                New Invoice <span className="text-blue-600 font-bold">{doc.refNo}</span> created for{" "}
                <span className="text-slate-900 dark:text-white font-bold">{doc.customer}</span> ({doc.amount})
              </>
            ),
            time: doc.date || "Recently",
            icon: FileText,
            iconBg: "bg-blue-500 text-white shadow-md shadow-blue-500/20",
          };
        }
        if (doc.type === "order") {
          return {
            description: (
              <>
                Sales Order <span className="text-blue-600 font-bold">{doc.refNo}</span> placed by{" "}
                <span className="text-slate-900 dark:text-white font-bold">{doc.customer}</span> ({doc.amount})
              </>
            ),
            time: doc.date || "Recently",
            icon: CheckCircle2,
            iconBg: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
          };
        }
        if (doc.type === "challan") {
          return {
            description: (
              <>
                Delivery Challan <span className="text-blue-600 font-bold">{doc.refNo}</span> dispatched to{" "}
                <span className="text-slate-900 dark:text-white font-bold">{doc.customer}</span>
              </>
            ),
            time: doc.date || "Recently",
            icon: Truck,
            iconBg: "bg-amber-600 text-white shadow-md shadow-amber-600/20",
          };
        }
        return {
          description: (
            <>
              Payment record <span className="text-blue-600 font-bold">{doc.refNo}</span> from{" "}
              <span className="text-slate-900 dark:text-white font-bold">{doc.customer}</span> ({doc.amount})
            </>
          ),
          time: doc.date || "Recently",
          icon: Landmark,
          iconBg: "bg-slate-500 text-white shadow-md shadow-slate-500/20",
        };
      });

      setActivities(items);
    };

    loadActivities();
    window.addEventListener("erp_document_created", loadActivities);
    window.addEventListener("storage", loadActivities);
    return () => {
      window.removeEventListener("erp_document_created", loadActivities);
      window.removeEventListener("storage", loadActivities);
    };
  }, []);

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      {/* Title */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-4">
        Recent Activities
      </span>

      {/* Timeline list */}
      <CardContent className="p-0 relative pl-4 space-y-4 flex-1">
        {activities.length > 0 ? (
          <>
            {/* Vertical timeline line */}
            <div className="absolute top-1 left-[28px] bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800/80" />

            {activities.map((item, idx) => (
              <div key={idx} className="relative flex items-center justify-between group">
                {/* Left: Icon and Message */}
                <div className="flex items-center gap-4.5">
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
          </>
        ) : (
          <div className="py-12 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
            No recent activity recorded yet.
          </div>
        )}
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
          System Operational
        </span>
      </div>
    </Card>
  );
}
