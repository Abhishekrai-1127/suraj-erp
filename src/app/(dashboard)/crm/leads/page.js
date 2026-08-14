"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CrmHeader } from "@/components/crm/crm-header";
import { CustomersTable } from "@/components/crm/customers-table";
import { LeadKanbanBoard } from "@/components/crm/lead-kanban-board";
import { AddEditCrmModal } from "@/components/crm/add-edit-crm-modal";
import { CrmDetailsDrawer } from "@/components/crm/crm-details-drawer";
import { getStoredLeads } from "@/lib/crm-storage";

export default function CRMLeadsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [leads, setLeads] = useState([]);

  const loadLeads = () => setLeads(getStoredLeads());

  useEffect(() => {
    loadLeads();
    window.addEventListener("suraj_crm_updated", loadLeads);
    window.addEventListener("storage", loadLeads);
    return () => {
      window.removeEventListener("suraj_crm_updated", loadLeads);
      window.removeEventListener("storage", loadLeads);
    };
  }, []);

  const handleConvertLead = (lead) => {
    router.push(`/sales/orders`);
  };

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      <CrmHeader
        activeTab="Leads"
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
            items={leads}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onAddRecord={() => setIsAddModalOpen(true)}
          />
        ) : (
          <CustomersTable
            activeTab="Leads"
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsAddModalOpen(true);
            }}
            onConvertLead={handleConvertLead}
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
        defaultTab="Leads"
      />

      <CrmDetailsDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onConvertLead={handleConvertLead}
      />
    </div>
  );
}
