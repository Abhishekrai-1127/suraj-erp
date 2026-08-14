# Suraj ERP — High-Level System Architecture & Execution Flow

This document provides the high-level map of the system: modules, services, data movement, and execution paths.

---

## 🗺️ High-Level System Map (The Shape of the System)

```mermaid
graph TD
    subgraph UI_Layer["🖥️ Frontend & User Interface (Next.js App Router)"]
        Dashboard["/dashboard"]
        SalesModule["/sales<br/>(Invoices, Orders, Quotations, Payments, Challans)"]
        PurchaseModule["/purchase<br/>(RFOs, Bills, Machinery, Analytics)"]
        InventoryModule["/inventory<br/>(Stock, Warehouses, Movements)"]
        FinanceModule["/finance<br/>(General Ledger, Accounts, Vouchers)"]
        MfgModule["/manufacturing<br/>(BOM, Work Orders)"]
        CRMModule["/crm<br/>(Leads, Customers, Deals)"]
        ReportsModule["/reports<br/>(Analytics & Exports)"]
    end

    subgraph Service_Layer["⚡ Cross-Cutting Services & State Engine"]
        StorageEngine["ERP Storage Engine (erp-storage.js + Custom Event Bus)"]
        QueryEngine["TanStack Query (Async Cache & Mutations)"]
        ValidationEngine["Zod Schema Validator"]
        PrintService["PDF / Print Engine (jspdf, html2pdf)"]
        NotificationService["Sonner Toast Engine (Auto-Dismiss)"]
    end

    subgraph Backend_Layer["💾 Backend Services & Persistence"]
        NextAPI["Next.js Route Handlers (/api/...)"]
        LocalStorage["Client Storage & Event Bus"]
    end

    %% Interactions
    UI_Layer --> QueryEngine
    UI_Layer --> StorageEngine
    UI_Layer --> PrintService
    UI_Layer --> NotificationService
    
    QueryEngine --> ValidationEngine
    ValidationEngine --> NextAPI
    StorageEngine --> LocalStorage
```

---

## 🔄 Inter-Module Data Movement Flow

```mermaid
sequenceDiagram
    autonumber
    participant CRM as CRM / Sales Leads
    participant Sales as Sales Module
    participant Inv as Inventory Module
    participant Fin as Finance Module
    participant DB as LocalStorage / ERP State Engine

    CRM->>Sales: Convert Lead to Quotation / Sales Order
    Sales->>DB: Save Sales Order & Auto-Generate Invoice/Challan
    Sales->>Inv: Reserve Item Stock (Pending Delivery)
    Inv->>DB: Update Stock Allocations
    Sales->>Sales: Issue Invoice / Delivery Challan
    Sales->>Inv: Deduct Physical Stock (Stock Outward)
    Sales->>Fin: Create Accounts Receivable & Tax Ledger Entry
    Fin->>DB: Record Financial Voucher / Payment Entry
```

### Data Movement Rules Between Business Modules:
1. **Sales ↔ Inventory**: Creating a Sales Order reserves inventory stock; fulfilling an Invoice/Challan triggers stock deduction.
2. **Purchase ↔ Inventory**: Confirming a Purchase Receipt / Bill increments warehouse item quantities.
3. **Sales & Purchase ↔ Finance**: Sales invoices populate Accounts Receivable; Purchase bills populate Accounts Payable and General Ledger.
4. **CRM ↔ Sales**: CRM customer records populate customer dropdowns in Quotations/Invoices.
5. **Manufacturing ↔ Inventory**: Work Orders consume raw material inventory (BOM) and output finished goods to inventory.

---

## 🧭 System Call Order & Traversal

### 1. Root Shell & Context Initializer
- **Entry**: `src/app/layout.js` & `src/providers/theme-provider.jsx`
- **Responsibilities**:
  1. Loads design tokens (`src/app/globals.css`).
  2. Mounts global state providers (Theme, Toast / `Sonner` with auto-dismiss duration).
  3. Renders app navigation layout (Sidebar, Header, Top Bar).

### 2. Module Route Execution
- **Paths**: `src/app/<module>/page.js` (`/sales`, `/purchase`, `/inventory`, `/finance`, `/manufacturing`, `/crm`, `/reports`, `/settings`, `/users`)
- **Responsibilities**:
  1. Next.js App Router matches route to `page.js`.
  2. Mounts module sub-navigation, analytics banners, and TanStack Data Tables.
  3. Triggers data fetching hooks / storage sync events (`erp_document_created`, `erp_customer_created`).

### 3. Component & Form Execution
- **Paths**: `src/components/<module>/...`
- **Responsibilities**:
  1. Client components handling forms (`React Hook Form` + `Zod`), edit modals (`EditDocumentModal`), and print layouts (`/print-invoice`).
  2. Emits client storage mutations and real-time event dispatches.

### 4. Data Storage & API Route Handlers
- **Paths**: `src/app/api/.../route.js` and `src/lib/erp-storage.js`
- **Responsibilities**:
  1. Handles HTTP `GET`, `POST`, `PUT`, `DELETE` requests and local storage persistence.
  2. Validates payloads against Zod schemas.
  3. Manages document deduplication, deletion tracking, and real-time state synchronization.

---

## 🎯 Current Modification Scope Marker

Whenever modifying code, specify which segment of the system path is being modified:

- **[ ] Root Shell**: `src/app/layout.js`, `src/providers/theme-provider.jsx`, `globals.css`
- **[ ] Module Page Entry**: `src/app/<module>/page.js`
- **[ ] Component UI / Form**: `src/components/...`
- **[ ] Data Access / State Engine**: `src/app/api/...`, `src/lib/erp-storage.js`
- **[ ] Project Config / Agent Docs**: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.agents/AGENTS.md`
