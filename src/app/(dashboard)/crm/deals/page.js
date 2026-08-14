"use client";

import React, { useState, useEffect } from "react";
import { CrmHeader } from "@/components/crm/crm-header";
import { CustomersTable } from "@/components/crm/customers-table";
import { LeadKanbanBoard } from "@/components/crm/lead-kanban-board";
import { AddEditCrmModal } from "@/components/crm/add-edit-crm-modal";
import { CrmDetailsDrawer } from "@/components/crm/crm-details-drawer";
import { getStoredDeals } from "@/lib/crm-storage";

export default function CRMDealsPage() {
  const [viewMode, setViewMode] = useState("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deals, setDeals] = useState([]);

  const loadDeals = () => setDeals(getStoredDeals());

  useEffect(() => {
    loadDeals();
    window.addEventListener("suraj_crm_updated", loadDeals);
    window.addEventListener("storage", loadDeals);
    return () => {
      window.removeEventListener("suraj_crm_updated", loadDeals);
      window.removeEventListener("storage", loadDeals);
    };
  }, []);

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
