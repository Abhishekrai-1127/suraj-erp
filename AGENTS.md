# Suraj ERP — Living Project Context

This file is a living record of project status, architecture decisions, current tasks, and repository guidelines. Update this file incrementally as work progresses.

---

## 📌 Project Overview
- **Stack**: Next.js 16.2.10 (App Router + Turbopack), React 19.2.4, Tailwind CSS v4, Lucide React, TanStack Query & Table, Sonner.
- **Package Manager**: `pnpm` (v11.17.0).
- **Architecture & Execution Flow**: [ARCHITECTURE.md](file:///Users/abhii/Documents/GitHub/suraj-erp/ARCHITECTURE.md)
- **Decision & ADR Log**: [DECISION_LOG.md](file:///Users/abhii/Documents/GitHub/suraj-erp/DECISION_LOG.md)
- **Task & Bug Execution Log**: [WORK_LOG.md](file:///Users/abhii/Documents/GitHub/suraj-erp/WORK_LOG.md)

---

## ✅ What's Done
- **Rollback & Recovery Plan**: Established explicit rollback steps and post-revert verification procedures for large or risky edits.
- **Definition of Done & Verification Checklist**: Documented exact terminal commands and required exit outputs before marking any change as complete.
- **AI Strict Guardrails**: Documented non-negotiable rules (no unapproved dependencies, no npm/yarn usage, no direct payment logic edits).
- **Start-to-Finish Task Trace Log**: Created `WORK_LOG.md` to document every bug fix or feature from scoping to verification.
- **Execution Path Mapping**: Created `ARCHITECTURE.md` to map call order across layouts, routes, components, and data services.
- **Non-Obvious Code Commenting Rule**: Enforced mandatory commenting standard for non-obvious logic focused on flow, purpose, callers, and dependent assumptions.
- **Decision & Architecture Logging**: Established mandatory decision log in `DECISION_LOG.md` to record AI choices, library selection rationale, design patterns, and accepted trade-offs.
- **Package Manager Migration**: Migrated from `npm` to `pnpm`.
- **Single-Invoice Enforcement**: Enforced 1 invoice limit per Sales Order across order generation, modal creation, and table actions with `hasInvoiceForSalesOrder` helper and toast alerts.
- **Fully Functional CRM Suite**: Implemented complete B2B CRM module supporting Customers, Vendors, Leads, Contacts, and Deals with live persistence, CRUD modals, context drawers, activity logs, CSV export/import, Kanban pipeline views, and sub-routes (/crm, /crm/leads, /crm/contacts, /crm/deals).
- **Purchase Scope Streamlining**: Streamlined Purchase module navigation and views with RFO (Request For Order) (/purchase/rfo), Purchase Bills (/purchase/bills), Purchased Machinery (/purchase/machinery), and Analytics (/purchase/analytics).
- **Dedicated Purchase Creation Modal**: Built `PurchaseAddModal` (`src/components/purchase/purchase-add-modal.jsx`) replacing sales modals, supporting Vendor autocomplete, itemized raw materials/machinery purchasing, subtotal/tax calculations, manual input options, and local storage persistence.
- **TanStack React Query Purchase Store**: Created central React Query hooks (`src/hooks/use-purchase-store.js`) and `QueryProvider` (`src/providers/query-provider.jsx`) providing real-time state invalidation across `/purchase`, `/purchase/rfo`, `/purchase/bills`, and `/purchase/machinery`, prepared with commented API endpoints for backend integration in 2 days.
- **Comprehensive Inventory Management Suite**: Built complete Inventory suite matching user UI design with 8 KPI cards, Recharts trend area chart, Donut warehouse utilization, weekly stock activity inflow/outflow bar chart, 6 quick action tiles, recent stock movements table, multi-tab `InventoryAddModal` (supporting Add Product and Receive Stock with Transfer Stock and Stock Adjustment tabs removed), TanStack React Query store (`src/hooks/use-inventory-store.js`), and sub-routes, configured for a single main factory warehouse hub with plant storage bays.
- **Backend API & Data Schema Specification**: Created comprehensive developer handover contract (`backend_api_specification.md`) detailing database entities, JSON schemas, HTTP REST endpoints, response envelopes, and key business logic rules across CRM, Sales, Purchase, Inventory, Finance, and Manufacturing.
- **Central ERP CRM API Integration**: Connected the CRM module to the live REST API specification (`api_document.md`), incorporating `apiClient` (`src/lib/api-client.js`), CRM service methods (`src/services/crm-api.js`), and TanStack Query store (`src/hooks/use-crm-store.js`) for real-time synchronization, optimistic mutations, and resilient offline fallback.
- **CRM List Response Normalization**: Fixed Central ERP success-envelope unwrapping so paginated customer, lead, and deal API results reach the CRM tables as arrays.
- **Proxy Payload Normalization & React 19 Script Tag Warning Suppression**: Prevented serializing `null` into `"null"` strings with `Content-Type: application/json` on GET/HEAD requests, fixing backend JSON parse failures (`Unexpected token 'n'`). Suppressed the development false-positive console error for `next-themes` client-side hydration `&lt;script&gt;` tags, preventing Turbopack full-screen modal overlays.
- **Standardized CRM Entity Payload Structure**: Standardized payload structure (`name`, `company`, `email`, `phone`, `stage`, `source`) across Customer, Vendor, and Lead creations/updates in `AddEditCrmModal` and `LeadKanbanBoard`, aligning with `CreateCustomerDto`, `CreateLeadDto`, and `CrmService` in `central-erp-backend`.
- **Comprehensive Mock & Hardcoded Data Removal**: Removed all remaining dummy datasets across Sales, Purchase, Inventory, and Dashboard modules (emptied mock arrays, removed hardcoded table rows/alerts/ratios, implemented graceful empty states, and wired all tables to dynamic local storage / React Query stores).
- **CRM Account Rep Removal**: Removed "Assigned Account Rep" input field from customer modal, removed fake executive options ("Sarah Jenkins", "Michael Chen", etc.) from filters and drawers, and cleaned up filter predicates.
- **Debounced Customer & Vendor Suggestions in Sales**: Added `useDebounce` hook with debounced live suggestions across both Customers and Vendors in `SalesHeader` search and `QuickAddModal` account selection with distinct type badges, click-outside dismissal, and instant query filtering.
- **Commented Out Deals & Opportunities in CRM**: Deactivated Deals / Opportunities tab in `CustomersTable`, record type and form in `AddEditCrmModal`, Deals route view (`/crm/deals` redirects to `/crm`), and removed opportunities mentions from KPI cards and headers.
- **CRM Table Section Extension & Dropdown Clearance**: Extended CRM table card with `min-h-[580px]` and inner table with `min-h-[380px] pb-28 custom-scrollbar`, added smart dropup collision detection for row action menus, and pinned pagination to eliminate dropdown clipping and overflow glitches on short record sets.
- **Sales QuickAddModal Close Guard & Dismissal**: Re-introduced `if (!isOpen) return null;` guard, backdrop click dismissal, and Escape key listener on `QuickAddModal` in the Sales workflow.
- **React 19 Hydration Mismatch Resolution**: Deterministically initialized user state and stored documents across SSR and initial client mount, converted avatar image alt text to static string, and added `suppressHydrationWarning` to client-synchronized user text in [sidebar.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/layout/sidebar.jsx) and [recent-transactions.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/recent-transactions.jsx).
- **Dynamic Metrics Engine & Hardcoded Number Removal**: Removed hardcoded figures across Sales ([sales-target.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/sales-target.jsx), [kpi-grid.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/kpi-grid.jsx), [performance-trend.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/performance-trend.jsx), [pipeline-lifecycle.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/pipeline-lifecycle.jsx)), Inventory ([page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/inventory/page.js)), and Dashboard ([page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/dashboard/page.js)), wiring calculations to real document stores and enforcing deterministic `en-IN` formatters ([formatters.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/lib/formatters.js)) to eradicate locale-based SSR/client hydration failures.
- **Removal of Assigned Sales Executive & Rep**: Removed "Assigned Sales Executive" dropdown and fake executive options from Quotation modal ([quick-add-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/quick-add-modal.jsx)), Sales filter drawer ([sales-filter-drawer.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/sales-filter-drawer.jsx)), Edit Document modal ([edit-document-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/edit-document-modal.jsx)), CRM Details drawer ([crm-details-drawer.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/crm/crm-details-drawer.jsx)), CRM Add/Edit modal states and payloads ([add-edit-crm-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/crm/add-edit-crm-modal.jsx)), Quotations list view ([sales/quotations/page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/sales/quotations/page.js)), and preview print view ([tally-quotation-preview.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/invoice/tally-quotation-preview.jsx)).
- **Universal Rupees (INR) Standard & Currency Dropdown Removal**: Removed all redundant currency selection dropdowns across Quotation, Sales Order, and Invoice modals, setting Indian Rupees (`INR (₹)`) as the universal default across all documents, calculations, and tables in [quick-add-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/quick-add-modal.jsx).
- **Sales Reference Number Sequential Management & Central ERP Backend Integration**: Implemented sequential zero-padded reference numbering (`QT-2026-0001`, `SO-2026-0001`, `INV-2026-0001`, `DC-2026-0001`) replacing random 2024 seeds, exposed `GET /sales/next-ref-no` in `central-erp-backend`, enhanced `sales_documents` PostgreSQL table schema with `valid_until`, `notes`, and `currency`, created `salesApi` (`src/services/sales-api.js`) and TanStack React Query store (`src/hooks/use-sales-store.js`), and wired `QuickAddModal`, `/sales/quotations`, `/sales/orders`, and `/sales/invoices` to real-time database queries with resilient offline fallback.
- **Monthly Sales Target Verification & Setting Option**: Added explicit verification for whether the monthly sales target is set for the active calendar month, added an amber status prompt when unset, and built `SetSalesTargetModal` ([set-sales-target-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/set-sales-target-modal.jsx)) with quick INR presets, real-time compact previews, goal projections, reset capabilities, and storage sync in [sales-target.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/sales-target.jsx) and [erp-storage.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/lib/erp-storage.js).
- **Delivery Challan Deletion, Batch Actions & Management Suite**: Added single-row deletion controls, multi-select checkboxes with batch deletion (`Delete Selected (N)`), status filter bar, date sorting, dispatch summary KPI cards, CSV export, and built `CreateChallanModal` ([create-challan-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/sales/create-challan-modal.jsx)) in [delivery-challans/page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/sales/delivery-challans/page.js).
- **Comprehensive Removal of Hardcoded Data & Unit Fallbacks**: Purged all hardcoded measurement units ("Nos", "Pcs", "Units", "Bags") and fallback injections across line item generators, modals, and print layouts; eliminated fabricated mock lines in Tally mappers; wired static KPI metric cards and charts across Dashboard, Sales Analytics, Purchase Analytics, and Invoices to dynamic ERP document stores with deterministic INR formatters.
- **Sales Analytics Chart Scaling & Dynamic Data Resolution**: Constrained BarChart bar sizes (`maxBarSize={48}`, `barSize={36}`) with blue SVG gradients to eliminate monolithic grey block rendering; normalized document type checks (`sales_order` vs `order`) and merged React Query with local stores to accurately count orders and revenue; dynamically derived category distributions and payment methods from real line items; and integrated active monthly target projections into the forecast suite.
- **Sales API DTO Normalization & NestJS Backend Compliance**: Aligned all frontend API payloads with backend NestJS DTO specifications (`CreateSalesDocDto`, `UpdateSalesDocDto`, `LineItemDto`, `SalesDocQueryDto`, `SalesDocType`, `SalesDocStatus`) in [sales-api.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/services/sales-api.js), enforcing strict enum types, ISO date formatting, numeric line item attributes (`listPrice`, `qty`), and precise tax segment splits (`cgstAmount`, `sgstAmount`, `igstAmount`).
- **Purchase Module Modernization, Sequential Ref Numbering & Full CRUD REST Integration**: Created `purchaseApi` ([purchase-api.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/services/purchase-api.js)) connecting `/api/v1/purchase` with offline-fallback to local storage; exposed sequential zero-padded reference numbering (`PB-2026-0001`, `RFO-2026-0001`, `MAC-2026-0001`) via backend `GET /purchase/next-ref-no`; wired `usePurchaseStore` to mutations and invalidations; integrated UI status selectors for bills, RFOs, and machinery in `PurchaseAddModal` ([purchase-add-modal.jsx](file:///Users/abhii/Documents/GitHub/suraj-erp/src/components/purchase/purchase-add-modal.jsx)); added row deletions, quick approval/cancellation, status updates, and search filters across Purchase Bills ([bills/page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/purchase/bills/page.js)), RFOs ([rfo/page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/purchase/rfo/page.js)), and Machinery ([machinery/page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/(dashboard)/purchase/machinery/page.js)).
- **Default Application Route Configured to /login**: Set `/login` as the default landing route across Suraj ERP via server-side redirect in [next.config.mjs](file:///Users/abhii/Documents/GitHub/suraj-erp/next.config.mjs) and client-side fallback in [page.js](file:///Users/abhii/Documents/GitHub/suraj-erp/src/app/page.js).

---

## 🚧 What's In Progress
- Connecting remaining frontend modules (Inventory, Finance, Manufacturing) to live backend services / database APIs.
- Expanding form validation (Zod + React Hook Form) across ERP workflows.

---

## ⚠️ What's Broken / Known Issues
- *None currently.* Both frontend `pnpm run build` (38/38 routes) and backend `nest build` compile cleanly with 0 errors.

---

## 🚨 What the AI Must Never Do (Strict Guardrails)
1. **NO Unapproved Dependencies**: NEVER run `pnpm add` or install new third-party dependencies without asking the user for explicit permission first.
2. **NO Alternative Package Managers**: NEVER run `npm`, `yarn`, or `npx`. Always use `pnpm` (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm exec`, `pnpm dlx`).
3. **NO Direct Payment Logic Edits**: NEVER modify core payment gateways, financial transaction logic, or payment processing workflows without explicit user confirmation.
4. **NO Omitting `'use client'`: NEVER omit the `'use client'` directive at the top of React 19 components using hooks or browser APIs in Next.js App Router.
5. **NO Literal Syntax Comments**: NEVER restate literal syntax in comments (e.g. `// increment i by 1`). Always comment non-obvious logic explaining flow, block purpose, callers, and dependent assumptions.
6. **NO Undocumented Architectural Changes**: NEVER change design patterns, library selections, or system boundaries without logging an entry in [DECISION_LOG.md](file:///Users/abhii/Documents/GitHub/suraj-erp/DECISION_LOG.md).
7. **NO Destructive Commands**: NEVER run destructive database commands or delete critical project files without explicit user approval.

---

## ↺ Rollback & Recovery Protocol for Large or Risky Edits

If a large edit, refactoring, or package update breaks the build or runtime:

### 1. Pre-Edit Checkpoint Identification
- Before initiating risky edits, verify clean working tree state via `git status` and record the current HEAD commit hash:
  ```bash
  git rev-parse HEAD
  ```

### 2. Immediate Revert Commands
- **File-Level Revert** (if breaking changes are localized to specific files):
  ```bash
  git restore <file-path-1> <file-path-2>
  ```
- **Full Working-Tree Revert** (if widespread edits break compilation):
  ```bash
  git reset --hard HEAD
  git clean -fd
  ```
- **Dependency / Lockfile Restoration** (if package installation caused regressions):
  ```bash
  git restore package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc
  pnpm install
  ```

### 3. Post-Rollback Re-Verification Checklist
1. Run `pnpm install` to confirm node_modules are intact.
2. Run `pnpm run build` to confirm the application compiles cleanly back to the last known working state.
3. Log the failed edit attempt in [WORK_LOG.md](file:///Users/abhii/Documents/GitHub/suraj-erp/WORK_LOG.md) under **"What Didn't Work"** before attempting a different resolution strategy.

---

## 🧪 Verification & Definition of Done Checklist

Before any task or change counts as **"done"**, the AI must run and verify all of the following commands:

### 1. Dependency & Lockfile Verification
- **Command**: `pnpm install`
- **Expected Output**: `Already up to date` or `Done in ...ms using pnpm v11.17.0` (Exit code: 0).

### 2. Static Analysis & Linting
- **Command**: `pnpm run lint`
- **Expected Output**: `✔ No ES-Lint warnings or errors` (Exit code: 0).

### 3. Production Build Compilation
- **Command**: `pnpm run build`
- **Expected Output**: `✓ Compiled successfully`, `✓ Generating static pages ... (30/30)`, zero TypeScript or Turbopack errors (Exit code: 0).

### 4. Audit & Context Log Verification
- **Expected Checks**:
  - `WORK_LOG.md` entry exists for the task tracing scoping, attempts, results, and verification.
  - `DECISION_LOG.md` updated if architectural or library decisions were made.
  - `AGENTS.md` updated with incremental project status changes.
