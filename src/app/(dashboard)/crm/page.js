"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CrmHeader } from "@/components/crm/crm-header";
import { CrmKpiGrid } from "@/components/crm/crm-kpi-grid";
import { CustomersTable } from "@/components/crm/customers-table";
import { LeadKanbanBoard } from "@/components/crm/lead-kanban-board";
import { AddEditCrmModal } from "@/components/crm/add-edit-crm-modal";
import { CrmDetailsDrawer } from "@/components/crm/crm-details-drawer";
import {
  useCrmCustomers,
  useCrmLeads,
  useCrmContacts,
  useCrmDeals,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useDeleteLeadMutation,
  useDeleteDealMutation,
} from "@/hooks/use-crm-store";

export default function CRMPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Customers & Vendors");
  const [viewMode, setViewMode] = useState("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // TanStack Query Hooks & Mutations
  const { data: rawCustomers = [] } = useCrmCustomers();
  const { data: rawLeads = [] } = useCrmLeads();
  const { data: rawContacts = [] } = useCrmContacts();
  const { data: rawDeals = [] } = useCrmDeals();

  const customers = Array.isArray(rawCustomers) ? rawCustomers : [];
  const leads = Array.isArray(rawLeads) ? rawLeads : [];
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];
  const deals = Array.isArray(rawDeals) ? rawDeals : [];

  const createCustomerMutation = useCreateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();
  const deleteLeadMutation = useDeleteLeadMutation();
  const deleteDealMutation = useDeleteDealMutation();

  const totalOutstanding = customers.reduce((acc, curr) => acc + (curr.numericOutstanding || 0), 0);
  // Deals pipeline value commented out per requirement
  const totalPipelineValue =
    leads.reduce((acc, curr) => acc + (curr.numericValue || 0), 0);
    // + deals.reduce((acc, curr) => acc + (curr.numericValue || 0), 0);

  const handleExportCsv = () => {
    let dataToExport = customers;
    if (activeTab === "Leads") dataToExport = leads;
    if (activeTab === "Contacts") dataToExport = contacts;
    // Deals export commented out per requirement
    // if (activeTab.startsWith("Deals")) dataToExport = deals;

    if (dataToExport.length === 0) {
      toast.warning(`No ${activeTab} records available to export.`);
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(",");
    const rows = dataToExport.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suraj_ERP_CRM_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} ${activeTab} records to CSV!`);
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let count = 0;
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              createCustomerMutation.mutate({
                type: item.type || "Customer",
                name: item.name || "Imported Customer",
                company: item.company || "Imported Company",
                email: item.email || "",
                phone: item.phone || "",
                status: item.status || "Active",
                ...item,
              });
              count++;
            });
          }
        } else {
          const lines = text.split("\n").filter((l) => l.trim());
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(",");
              if (cols.length >= 2) {
                createCustomerMutation.mutate({
                  type: "Customer",
                  name: cols[0].replace(/"/g, "").trim(),
                  company: cols[1] ? cols[1].replace(/"/g, "").trim() : "Imported Company",
                  email: cols[2] ? cols[2].replace(/"/g, "").trim() : "",
                  phone: cols[3] ? cols[3].replace(/"/g, "").trim() : "",
                  status: "Active",
                });
                count++;
              }
            }
          }
        }
        toast.success(`Successfully queued ${count} CRM records for import from ${file.name}`);
      } catch (err) {
        toast.error("Failed to parse import file. Please upload valid CSV or JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleConvertLeadToSalesOrder = (leadOrCustomer) => {
    toast.success(`Converting ${leadOrCustomer.company || leadOrCustomer.name} to Sales Order...`, {
      description: "Redirecting to Sales Order Creation Workflow...",
    });
    router.push(`/sales/orders`);
  };

  const handleDeleteRecord = (record) => {
    if (!record) return;
    if (record.stage) {
      deleteLeadMutation.mutate(record.id);
      deleteDealMutation.mutate(record.id);
    } else {
      deleteCustomerMutation.mutate(record.id);
    }
    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord(null);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* 1. Header with Export/Import/Add Record */}
      <CrmHeader
        activeTab={activeTab}
        onAddClick={() => {
          setEditingRecord(null);
          setIsAddModalOpen(true);
        }}
        onExport={handleExportCsv}
        onImport={handleImportFile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 2. Executive KPI Metrics Grid */}
      <CrmKpiGrid
        customerCount={customers.length}
        leadCount={leads.length}
        totalPipelineValue={totalPipelineValue}
        totalOutstanding={totalOutstanding}
      />

      {/* 3. Main CRM Content Area (Extended section for comfortable height & scrolling) */}
      <div className="bg-white dark:bg-[#1b1d26] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col flex-1 min-h-[580px]">
        {/* Deals Kanban commented out per requirement */}
        {viewMode === "kanban" && activeTab === "Leads" ? (
          <div className="p-5 flex-1">
            <LeadKanbanBoard
              items={leads}
              isDeals={false}
              onSelectRecord={(rec) => setSelectedRecord(rec)}
              onAddRecord={() => {
                setEditingRecord(null);
                setIsAddModalOpen(true);
              }}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>
        ) : (
          <CustomersTable
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onSelectRecord={(rec) => setSelectedRecord(rec)}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsAddModalOpen(true);
            }}
            onConvertLead={handleConvertLeadToSalesOrder}
          />
        )}
      </div>

      {/* Add / Edit Record Modal */}
      <AddEditCrmModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRecord(null);
        }}
        recordToEdit={editingRecord}
        defaultTab={activeTab}
      />

      {/* Entity Context & Details Drawer */}
      <CrmDetailsDrawer
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onConvertLead={handleConvertLeadToSalesOrder}
        onDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
}
