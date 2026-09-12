"use client";

import React from "react";
import { Target, User, ChevronRight, Plus, Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateLeadMutation,
  useUpdateDealMutation,
  useDeleteLeadMutation,
  useDeleteDealMutation,
} from "@/hooks/use-crm-store";

const LEAD_STAGES = [
  { id: "New", name: "New Lead", color: "border-sky-500 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300" },
  { id: "Contacted", name: "Contacted", color: "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" },
  { id: "Qualified", name: "Qualified", color: "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300" },
  { id: "Proposal", name: "Proposal / Quote", color: "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" },
  { id: "Won", name: "Closed Won", color: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300" },
  { id: "Lost", name: "Closed Lost", color: "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" },
];

export function LeadKanbanBoard({ items = [], isDeals = false, onSelectRecord, onAddRecord, onDeleteRecord }) {
  const updateLeadMutation = useUpdateLeadMutation();
  const updateDealMutation = useUpdateDealMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const deleteDealMutation = useDeleteDealMutation();

  const handleAdvanceStage = (item, e) => {
    e.stopPropagation();
    const stageOrder = ["New", "Contacted", "Qualified", "Proposal", "Won"];
    const currentIndex = stageOrder.indexOf(item.stage || "New");
    const nextStage = stageOrder[Math.min(stageOrder.length - 1, currentIndex + 1)];

    if (isDeals) {
      updateDealMutation.mutate({
        id: item.id,
        data: {
          title: item.title,
          company: item.company,
          stage: nextStage,
          value: item.value ? parseFloat(String(item.value).replace(/[^0-9.]/g, "")) || 0 : 0,
        },
      });
    } else {
      updateLeadMutation.mutate({
        id: item.id,
        data: {
          name: item.name,
          company: item.company,
          email: item.email || undefined,
          phone: item.phone || undefined,
          stage: nextStage,
          source: item.source || "Inbound Web Inquiry",
          numericValue: item.numericValue || 0,
        },
      });
    }
  };

  const handleDeleteItem = (item, e) => {
    e.stopPropagation();
    if (onDeleteRecord) {
      onDeleteRecord(item);
    } else {
      if (isDeals) {
        deleteDealMutation.mutate(item.id);
      } else {
        deleteLeadMutation.mutate(item.id);
      }
    }
  };

  return (
    <div className="overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-4 min-w-[1200px] items-start">
        {LEAD_STAGES.map((stageObj) => {
          const stageItems = items.filter((item) => (item.stage || "New") === stageObj.id);
          const stageTotal = stageItems.reduce(
            (acc, curr) => acc + (curr.numericValue || parseFloat(String(curr.estimatedValue || curr.value || 0).replace(/[^0-9.]/g, "")) || 0),
            0
          );

          return (
            <div
              key={stageObj.id}
              className="flex-1 min-w-[260px] rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${stageObj.color}`}>
                    {stageObj.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">({stageItems.length})</span>
                </div>
                <button
                  onClick={onAddRecord}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 transition"
                  title="Add record to stage"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Stage Financial Summary */}
              <div className="text-[11px] font-bold text-slate-400 flex justify-between px-1">
                <span>Stage Total:</span>
                <span className="text-slate-900 dark:text-white font-extrabold">
                  ₹{stageTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                {stageItems.length > 0 ? (
                  stageItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectRecord(item)}
                      className="group p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-500/50 cursor-pointer transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                            {item.title || item.company}
                          </h4>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {item.name || item.customer}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.score && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 text-[10px] font-black">
                              {item.score} pts
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteItem(item, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition opacity-0 group-hover:opacity-100"
                            title="Delete card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <span className="font-black text-blue-600 dark:text-blue-400">
                          {item.value || item.estimatedValue || "₹0.00"}
                        </span>
                        
                        {stageObj.id !== "Won" && stageObj.id !== "Lost" && (
                          <button
                            onClick={(e) => handleAdvanceStage(item, e)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition"
                            title="Advance to next stage"
                          >
                            <span>Move</span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs font-medium text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
