"use client";

import React, { useState, useEffect } from "react";
import { CrmHeader } from "@/components/crm/crm-header";
import { CustomersTable } from "@/components/crm/customers-table";
import { AddEditCrmModal } from "@/components/crm/add-edit-crm-modal";
import { CrmDetailsDrawer } from "@/components/crm/crm-details-drawer";

export default function CRMContactsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      <CrmHeader
        activeTab="Contacts"
        onAddClick={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
      />

      <div className="bg-white dark:bg-[#1b1d26] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
        <CustomersTable
          activeTab="Contacts"
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onEditRecord={(rec) => {
            setEditingRecord(rec);
            setIsAddModalOpen(true);
          }}
        />
      </div>

      <AddEditCrmModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
        defaultTab="Contacts"
      />

      <CrmDetailsDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}
