"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Deals & Opportunities temporarily commented out per project requirements
export default function CRMDealsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crm");
  }, [router]);

  return null;
}

/*
import React, { useState } from "react";
import { CrmHeader } from "@/components/crm/crm-header";
import { CustomersTable } from "@/components/crm/customers-table";
import { LeadKanbanBoard } from "@/components/crm/lead-kanban-board";
import { AddEditCrmModal } from "@/components/crm/add-edit-crm-modal";
import { CrmDetailsDrawer } from "@/components/crm/crm-details-drawer";
import { useCrmDeals } from "@/hooks/use-crm-store";

export function OriginalCRMDealsPage() {
  const [viewMode, setViewMode] = useState("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: rawDeals = [] } = useCrmDeals();
  const deals = Array.isArray(rawDeals) ? rawDeals : [];

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      <CrmHeader
        activeTab="Deals"
        onAddClick={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="bg-white dark:bg-[#1b1d26] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col p-5">
        {viewMode === "kanban" ? (
          <LeadKanbanBoard
            items={deals}
            isDeals={true}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onAddRecord={() => setIsAddModalOpen(true)}
          />
        ) : (
          <CustomersTable
            activeTab="Deals"
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsAddModalOpen(true);
            }}
          />
        )}
      </div>

      <AddEditCrmModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
        defaultTab="Deals"
      />

      <CrmDetailsDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}
*/
