"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, ChevronRight, AlertTriangle, Clock, TrendingUp, Filter } from "lucide-react";
import { toast } from "sonner";
import { getStoredDocuments } from "@/lib/erp-storage";
import { parseAmount, formatCompactNumber } from "@/lib/formatters";

const BASE_STAGES = [
  { id: "LEAD", label: "LEAD" },
  { id: "QUOTATION", label: "QUOTATION" },
  { id: "APPROVED", label: "APPROVED" },
  { id: "SALES ORDER", label: "SALES ORDER" },
  { id: "PRODUCTION", label: "PRODUCTION" },
  { id: "READY", label: "READY" },
  { id: "DISPATCHED", label: "DISPATCHED" },
];

export default function PipelineLifecycle({ activeStage = "ALL", onStageSelect }) {
  const [stageData, setStageData] = useState(() =>
    BASE_STAGES.map((s) => ({
      ...s,
      count: 0,
      value: "₹0",
      conversion: "0%",
      avgTime: "0d",
      isBottleneck: false,
    }))
  );

  useEffect(() => {
    const computeStages = () => {
      const docs = getStoredDocuments();
      const counts = { LEAD: 0, QUOTATION: 0, APPROVED: 0, "SALES ORDER": 0, PRODUCTION: 0, READY: 0, DISPATCHED: 0 };
      const values = { LEAD: 0, QUOTATION: 0, APPROVED: 0, "SALES ORDER": 0, PRODUCTION: 0, READY: 0, DISPATCHED: 0 };

      for (const doc of docs) {
        const amt = parseAmount(doc.amount || doc.total || doc.subtotal);
        const type = String(doc.type || "").toLowerCase();
        const status = String(doc.status || "").toUpperCase();

        if (type === "lead" || status.includes("LEAD")) {
          counts.LEAD++;
          values.LEAD += amt;
        } else if (type === "quotation") {
          counts.QUOTATION++;
          values.QUOTATION += amt;
        } else if (status.includes("APPROVED") || status.includes("CONFIRMED")) {
          counts.APPROVED++;
          values.APPROVED += amt;
        } else if (status.includes("PRODUCTION") || status.includes("MANUFACTURING")) {
          counts.PRODUCTION++;
          values.PRODUCTION += amt;
        } else if (status.includes("READY") || status.includes("PACK")) {
          counts.READY++;
          values.READY += amt;
        } else if (status.includes("DISPATCH") || status.includes("DELIVER")) {
          counts.DISPATCHED++;
          values.DISPATCHED += amt;
        } else if (type === "order") {
          counts["SALES ORDER"]++;
          values["SALES ORDER"] += amt;
        }
      }

      const totalDocs = docs.length || 1;
      const updated = BASE_STAGES.map((s) => {
        const c = counts[s.id] || 0;
        const v = values[s.id] || 0;
        const conversion = totalDocs > 0 ? `${Math.round((c / totalDocs) * 100)}%` : "0%";
        return {
          ...s,
          count: c,
          value: formatCompactNumber(v),
          conversion,
          avgTime: c > 0 ? "1.0d" : "0d",
          isBottleneck: s.id === "PRODUCTION" && c >= 5,
        };
      });

      setStageData(updated);
    };

    computeStages();
    window.addEventListener("erp_document_created", computeStages);
    window.addEventListener("storage", computeStages);
    return () => {
      window.removeEventListener("erp_document_created", computeStages);
      window.removeEventListener("storage", computeStages);
    };
  }, []);

  const handleStageClick = (stage) => {
    if (onStageSelect) {
      onStageSelect(stage.id === activeStage ? "ALL" : stage.id);
    }
    toast.info(`Filtered view by Pipeline Stage: ${stage.label}`, {
      description: `${stage.count} items worth ${stage.value}`,
    });
  };

  const bottleneckStage = stageData.find((s) => s.isBottleneck);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sales Pipeline Lifecycle
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              REAL-TIME FLOW
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Stage volume, monetary values, conversion rates, and cycle-time tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeStage !== "ALL" && (
            <button
              onClick={() => onStageSelect && onStageSelect("ALL")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
            >
              <Filter size={14} />
              <span>Show All Stages</span>
            </button>
          )}
          <button
            onClick={() => toast.info("Navigating to full Pipeline Analytics page...")}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition"
          >
            <span>Full Pipeline Details</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Actionable Bottleneck Alert Callout */}
      {bottleneckStage ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle size={15} />
            </div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              <strong>Bottleneck Alert:</strong> {bottleneckStage.label} queue has {bottleneckStage.count} orders waiting.
            </span>
          </div>
          <button
            onClick={() => {
              if (onStageSelect) onStageSelect(bottleneckStage.id);
              toast.warning(`Filtering table for ${bottleneckStage.label} orders...`);
            }}
            className="shrink-0 text-xs font-extrabold text-amber-800 dark:text-amber-300 hover:underline bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-800 shadow-2xs"
          >
            Resolve Queue
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 font-medium">
          <span>Active Pipeline Stages: Tracking live order transitions across sales lifecycle.</span>
          <span className="text-emerald-600 font-bold">Flow Status: Normal</span>
        </div>
      )}

      {/* Pipeline Stepper Container */}
      <div className="w-full overflow-x-auto pb-1 custom-scrollbar">
        <div className="flex items-stretch min-w-[840px] gap-2 p-2.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          {stageData.map((stage, idx) => {
            const isSelected = activeStage === stage.id;
            return (
              <React.Fragment key={stage.id}>
                {/* Stage Item */}
                <button
                  onClick={() => handleStageClick(stage)}
                  className={`flex-1 flex flex-col justify-between p-3 rounded-xl transition-all text-left border ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 shadow-sm border-blue-500 dark:border-blue-600 ring-2 ring-blue-500/20"
                      : stage.isBottleneck
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 hover:bg-amber-100/50"
                      : "bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900"
                  }`}
                >
                  {/* Top Bar: Label & Bottleneck tag */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span
                      className={`text-[10px] font-black tracking-wider uppercase ${
                        stage.isBottleneck
                          ? "text-amber-600 dark:text-amber-400"
                          : isSelected
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {stage.isBottleneck && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        DELAY
                      </span>
                    )}
                  </div>

                  {/* Count & Value */}
                  <div className="my-2">
                    <div suppressHydrationWarning className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stage.count} <span className="text-xs font-semibold text-slate-400">items</span>
                    </div>
                    <div suppressHydrationWarning className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                      {stage.value}
                    </div>
                  </div>

                  {/* Conversion & Avg Time Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 w-full">
                    <span suppressHydrationWarning className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={11} />
                      {stage.conversion}
                    </span>
                    <span suppressHydrationWarning className={`flex items-center gap-0.5 ${stage.isBottleneck ? "text-amber-600 dark:text-amber-400 font-extrabold" : ""}`}>
                      <Clock size={11} />
                      {stage.avgTime}
                    </span>
                  </div>
                </button>

                {/* Chevron Arrow separator */}
                {idx < stageData.length - 1 && (
                  <div className="flex items-center text-slate-300 dark:text-slate-700 px-0.5">
                    <ChevronRight size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
