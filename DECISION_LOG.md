# Suraj ERP — Decision & Architecture Log (ADR)

This document records key technical and architectural decisions made in the codebase, including library selection, design patterns, and accepted trade-offs.

---

### 📋 Decision Log Entries

#### ADR-001: Package Manager Migration to `pnpm`
- **Date**: 2026-08-11
- **Decision**: Standardized on `pnpm` (v11.17.0) as the repository package manager instead of `npm` or `yarn`. Configured `"packageManager": "pnpm@11.17.0"` in `package.json` and declared approved native build scripts in `.npmrc` and `pnpm-workspace.yaml`.
- **Why `pnpm` over `npm`/`yarn`**:
  - **Efficiency & Speed**: Content-addressable store avoids duplicating package files across projects and speeds up installation.
  - **Strict Dependency Resolution**: Prevents accessing undeclared transitive dependencies ("phantom dependencies").
- **Trade-offs Accepted**:
  - Requires explicit security approval for native/postinstall build scripts (e.g., `sharp`, `@firebase/util`, `protobufjs`) via `pnpm approve-builds` or `pnpm-workspace.yaml`.

---

#### ADR-002: Next.js 16 App Router with Turbopack & React 19
- **Date**: 2026-08-11
- **Decision**: Built application using Next.js 16 App Router architecture with React 19 and Turbopack.
- **Why Next.js App Router**:
  - **Server Components & Streaming**: Moves heavy data-fetching logic to the server, keeping client bundle sizes minimal.
  - **Turbopack**: Fast local development build and compilation performance.
- **Trade-offs Accepted**:
  - All interactive UI components using state/hooks require strict `'use client'` boundaries.

---

#### ADR-003: Tailwind CSS v4 for Design System
- **Date**: 2026-08-11
- **Decision**: Adopted Tailwind CSS v4 with standard PostCSS integration.
- **Why Tailwind v4**:
  - High performance utility engine with streamlined configuration.
  - Direct integration with CSS variables and modern layout primitives.
- **Trade-offs Accepted**:
  - Utility class strings must be literal (avoiding arbitrary runtime string interpolation) to allow static extraction.

---

#### ADR-004: Mandatory AI Decision & Rationale Logging
- **Date**: 2026-08-11
- **Decision**: Enforced rule that all meaningful AI architectural changes, library choices, design patterns, and trade-offs must be logged incrementally in `DECISION_LOG.md`.
- **Why Log Decisions**:
  - Maintains full transparency and context continuity across future development sessions.
  - Prevents regression of architectural choices and ensures all trade-offs are explicitly acknowledged.

---

#### ADR-005: Non-Obvious Code Flow Commenting Standard
- **Date**: 2026-08-11
- **Decision**: Enforced mandatory code commenting standard for non-obvious logic.
- **Commenting Focus**:
  - Comments must focus on **architectural context & execution flow**:
    1. **Purpose**: What the code block is for.
    2. **Callers**: What calls into it.
    3. **Dependents**: What downstream components or modules assume it exists.
  - Avoid literal syntax restatements (e.g. `// increment i by 1`).
- **Why Enforce Flow Comments**:
  - Prevents developer confusion when refactoring complex calculations, async integrations, or edge-case handling.
  - Documents implicit coupling and callers directly in the codebase.

---

#### ADR-006: Execution Path Documentation Standard
- **Date**: 2026-08-11
- **Decision**: Documented the full application execution path in `ARCHITECTURE.md` and mandated documenting execution flow during code modifications.
- **Required Documentation**:
  - **Execution Path**: Trace how control and data travel between files, functions, and modules (what calls what, in what order).
  - **Modification Scope**: Identify the exact segment of the execution path being modified during code edits.
- **Why Document Execution Paths**:
  - Prevents breaking upstream callers or downstream dependents when modifying shared handlers, components, or services.

---

#### ADR-007: Firebase SDK Removal
- **Date**: 2026-08-11
- **Decision**: Removed Firebase SDK (`firebase` package and `src/lib/firebase.js`) per explicit user instruction.
- **Why Removed**:
  - The ERP system uses client-side state synchronization (`localStorage` and custom events in `erp-storage.js`) and modern REST APIs without needing external Firebase services.
  - Reduces dependency surface and node_modules weight.
- **Trade-offs Accepted**:
  - Uninstalls unused `@firebase` packages and native build scripts.

---

#### ADR-008: Sonner Toast Engine & Auto-Dismiss Integration
- **Date**: 2026-08-11
- **Decision**: Standardized on Sonner for application notifications with root `<Toaster />` rendering in `theme-provider.jsx` and auto-dismiss duration configuration.
- **Why Sonner Toasts**:
  - Replaces blocking native browser `alert()` and `confirm()` prompts with sleek, non-blocking UI notifications.
  - Theme-aware styling matching dark/light mode with rich colors and dismiss timers.
- **Trade-offs Accepted**:
  - Action feedback triggers are asynchronous toast notifications; destructive operations are tracked via local state engine with instant feedback.

---

#### ADR-009: Single-Invoice Validation Engine per Sales Order
- **Date**: 2026-08-12
- **Decision**: Implemented centralized validation (`hasInvoiceForSalesOrder` in `src/lib/erp-storage.js`) to guarantee that only 1 invoice can ever be created per Sales Order across Sales Order creation, direct Invoice creation, and list actions.
- **Why Implemented**:
  - Prevents duplicate billing, double invoicing, and accounting inconsistencies in the ERP workflow.
  - Gives clear user feedback via toasts and visual table badges ("Invoice Created") when an invoice already exists for a given Sales Order.
- **Trade-offs Accepted**:
  - Direct invoice creation from a Sales Order requires deleting or editing the pre-existing invoice before recreating.

---

#### ADR-010: Fully Functional CRM Module Architecture
- **Date**: 2026-08-12
- **Decision**: Architected and implemented a complete client-side persistent CRM suite in `src/lib/crm-storage.js` and `src/components/crm/` supporting Customers, Vendors, Leads, Contacts, and Deals with live state persistence, CRUD modals, context drawers, Kanban pipeline views, CSV export/import, and dedicated sub-routes (`/crm`, `/crm/leads`, `/crm/contacts`, `/crm/deals`).
- **Why Implemented**:
  - Delivers a production-ready, feature-rich B2B CRM experience integrated with the ERP sales lifecycle.
  - Allows full lead qualification, activity logging, and 1-click lead conversion to Sales Orders (`/sales/orders`).
- **Trade-offs Accepted**:
  - Offline-first state persistence uses client-side localStorage with reactive `suraj_crm_updated` event broadcasting.

---

#### ADR-011: Purchase Module Scope Streamlining & Capital Machinery Integration
- **Date**: 2026-08-13
- **Decision**: Streamlined the Purchase module by focusing on RFO (Request For Order) (`/purchase/rfo`), Purchase Bills (`/purchase/bills`), Purchased Machinery & Capital Assets (`/purchase/machinery`), and Analytics (`/purchase/analytics`).
- **Why Implemented**:
  - Aligns the ERP workflow with RFO requisition approval, vendor bills clearance, capital machinery asset tracking, and procurement analytics.
- **Trade-offs Accepted**:
  - Machinery purchases are tracked with dedicated asset tags, location bays, warranty dates, and maintenance statuses.

---

#### ADR-012: Central ERP Backend API Client & TanStack Query Store Architecture
- **Date**: 2026-09-10
- **Decision**: Implemented centralized Axios client (`src/lib/api-client.js`), CRM service layer (`src/services/crm-api.js`), and TanStack Query store (`src/hooks/use-crm-store.js`) adhering to `api_document.md`.
- **Why Implemented**:
  - Unifies network communication with automatic Bearer token injection, response envelope unwrapping (`{ success, data, meta }`), and normalized error handling.
  - Incorporates automatic cache invalidation on mutations (Customer, Lead, Deal, Contact, and Activity creation/updates/deletions).
  - Provides graceful offline/local fallback when backend is temporarily unreachable during local frontend design sessions.
- **Trade-offs Accepted**:
  - Components consume React Query hooks rather than directly accessing localStorage, providing standard optimistic updates and server synchronization.

---

#### ADR-013: Central ERP Success-Envelope Normalization
- **Date**: 2026-09-11
- **Decision**: Normalize successful Central ERP `{ success, data }` envelopes in `src/lib/api-client.js` by returning the contained payload.
- **Why**:
  - Paginated CRM endpoints contain their record array at `data.data`; returning the outer envelope made CRM views receive an object instead of the expected array.
- **Trade-offs Accepted**:
  - API services continue owning endpoint-specific extraction of paginated arrays, while the shared client performs only standardized envelope normalization.

---

#### ADR-014: Atomic Browser Session Cleanup
- **Date**: 2026-09-11
- **Decision**: Clear every browser authentication key before login attempts and on logout; persist a returned access token only when it is JWT-shaped.
- **Why**:
  - A retained literal `null` token was forwarded as `Bearer null`, causing CRM API requests to fail before the list payload could be rendered.
- **Trade-offs Accepted**:
  - A failed login clears the prior local browser session, requiring a new successful login before protected data is available.

---

#### ADR-015: Proxy Payload Sanitization & React 19 Theme Script Warning Suppression
- **Date**: 2026-09-11
- **Decision**: 
  1. Updated `src/lib/server-api.js` and `src/app/api/[...slug]/route.js` to strip `data` and `Content-Type` headers on `GET` and `HEAD` requests, ensuring axios never serializes `null` into `"null"` string payloads.
  2. Suppressed the React 19 / Turbopack development `console.error` regarding `next-themes` client-side `&lt;script&gt;` tag injection inside `src/providers/theme-provider.jsx`.
- **Why**:
  - Sending `Content-Type: application/json` with `Body: "null"` on `GET /crm/*` requests caused backend JSON body parsers and validation pipes to reject requests with `400 Bad Request` ("Unexpected token 'n', null is not valid JSON").
  - React 19 warns against inline `&lt;script&gt;` tags inside client component trees, which Turbopack surfaced as a full-screen blocking error overlay on the frontend.
- **Trade-offs Accepted**:
  - In development, the specific `Encountered a script tag` warning is filtered while preserving all other critical console errors.

---

#### ADR-016: Standardized CRM Entity Payload Structure
- **Date**: 2026-09-11
- **Decision**: Standardized the core payload structure across all CRM entities (Leads, Vendors, Customers):
  ```json
  {
    "name": "string",
    "company": "string",
    "email": "string",
    "phone": "string",
    "stage": "string",
    "source": "string"
  }
  ```
  - Added `stage` and `source` fields to Customer/Vendor forms, mutations, and table columns in `suraj-erp`.
  - Added `stage` and `source` support to `crm_customers` schema, `CreateCustomerDto`, `UpdateCustomerDto`, and `CrmService` in `central-erp-backend`.
  - Standardized lead creation, update, and Kanban stage advancement payloads to prevent unwhitelisted field rejection by NestJS `ValidationPipe`.
- **Why**:
  - Enforces consistent data ingestion and querying across all party types (leads, vendors, customers) and guarantees strict DTO compatibility between frontend and backend.
- **Trade-offs Accepted**:
  - `stage` and `source` are stored and synchronized for accounts as well as pipeline leads, providing end-to-end attribution from initial lead prospect to active customer/vendor.

---

## 2026-09-12 — Monthly Sales Target State Management & Real-Time Event Dispatch
- **Decision**:
  - Implemented calendar month keying (`YYYY-MM`) for stored sales targets in `suraj_erp_monthly_sales_target`.
  - Replaced hardcoded fallback calculation with an explicit verification check (`getStoredSalesTarget()`).
  - Implemented `SetSalesTargetModal` offering quick preset selection chips and real-time goal projection.
  - Wired real-time synchronization through custom DOM event dispatch (`erp_sales_target_updated`) and cross-tab `storage` event listeners.
- **Why**:
  - Automatically guessing artificial targets caused confusion because users had no visibility into whether goals were actually defined by management.
  - Calendar month keying prevents sales goals from leaking into preceding or subsequent months while preserving target history.
- **Trade-offs Accepted**:
  - Storing per-month targets in browser local storage ensures instant, offline-capable goal tracking without requiring a complex backend database schema migration upfront, while dispatching events keeps all open UI widgets in sync.

---

## 2026-09-12 — Dynamic Document Aggregations & Universal Unit Sanitization
- **Decision**:
  - Eliminated all hardcoded dummy fallback units (`"Nos"`, `"Pcs"`, `"Units"`, `"Bags"`), replacing them with pure user-supplied measurement units or empty defaults.
  - Replaced hardcoded KPI metric cards and static chart arrays in Sales Analytics, Purchase Analytics, Dashboard Sales Analytics, Dashboard Liquidity, and Profit Margin with live aggregations calculated dynamically from actual ERP documents.
  - Stripped fabricated fallback line items (`"Industrial Machinery Equipment & Components"`, `"10 H.P Blower..."`) in print and preview generators, enforcing that empty documents render honest empty states.
- **Why**:
  - Hardcoded units and dummy numbers corrupted genuine user inventory and sales data, gave false financial telemetry, and prevented clean ERP reporting.
- **Trade-offs Accepted**:
  - Empty or newly created ERP instances will legitimately display ₹0.00 and 0 items until actual transactions or products are recorded, ensuring authentic enterprise bookkeeping.

---

## 2026-09-12 — Sales Analytics Chart Rendering & Live Store Normalization
- **Decision**:
  - Refactored `Sales Analytics` (`/sales/analytics`) to consume both React Query (`useSalesDocuments`, `useCrmCustomers`) and persistent local storage, standardizing all document types via `normalizeSalesDocType`.
  - Added strict BarChart bar sizing constraints (`maxBarSize={48}`, `barSize={36}`) and SVG linear gradients (`#3b82f6` to `#1d4ed8`) to prevent Recharts from stretching low-count category bars into monolithic slabs.
  - Dynamically compute category distribution based on line item keywords and user categories, and dynamic payment breakdown from recorded payments and paid invoices, replacing hardcoded mock percentages.
  - Consolidated Revenue from Invoices and non-invoiced Sales Orders to prevent double-counting while instantly capturing booked order value.
- **Why**:
  - Default Recharts behavior without explicit `maxBarSize` rendered giant solid grey blocks when only 1 or 2 products existed.
  - Document type mismatch (`order` vs `sales_order`) led to false ₹0 revenue and 0 orders displays even when orders had been entered.
- **Trade-offs Accepted**:
  - Categorization uses keyword heuristics when items do not have an explicit category defined in their line item payload, providing clean classification across diverse manufacturing inventories.

---

## 2026-09-12 — Central ERP Sales DTO & Validation Pipeline Normalization
- **Decision**:
  - Aligned all frontend API payloads with NestJS backend DTOs (`CreateSalesDocDto`, `UpdateSalesDocDto`, `LineItemDto`, `SalesDocQueryDto`, `SalesDocType`, `SalesDocStatus`).
  - Added frontend normalization pipelines `buildCreateSalesDocDto` and `buildUpdateSalesDocDto` in `src/services/sales-api.js` that automatically enforce strict enum values, ISO date formatting, numeric tax segment calculations (`cgstAmount`, `sgstAmount`, `igstAmount`), and required line item attributes (`listPrice`, `qty`, `description`).
  - Standardized status transitions across QuickAddModal, CreateChallanModal, EditDocumentModal, and Orders page invoice generation to use strictly whitelisted enum values (`DRAFT | PENDING | APPROVED | PAID | UNPAID | DELIVERED | CANCELLED`).
- **Why**:
  - NestJS validation pipes reject requests containing invalid enum strings, unformatted dates, missing numeric properties on line items, or missing required fields.
- **Trade-offs Accepted**:
  - Legacy UI status labels (e.g. "IN PROCESS", "IN PROGRESS", "Sent") are automatically mapped to strict backend enum values (`PENDING`, `UNPAID`, etc.) before transmission, preserving friendly UI terminology while ensuring strict server validation passes.

---

## 2026-09-13 — Purchase Module REST Integration, Sequential Ref Numbering & Full CRUD Synchronization
- **Decision**:
  - Created `src/services/purchase-api.js` adhering strictly to NestJS `PurchaseRecordType` (`rfo`, `purchase_bill`, `purchased_machinery`), `RfoPriority` (`NORMAL`, `HIGH`, `URGENT`), and `CreatePurchaseRecordDto` / `UpdatePurchaseRecordDto`.
  - Added `@Get('next-ref-no')` and `getNextRefNo()` to `central-erp-backend` Purchase controller and service, providing deterministic sequential zero-padded reference numbering (`PB-YYYY-XXXX`, `RFO-YYYY-XXXX`, `MAC-YYYY-XXXX`) replacing legacy random number generation.
  - Implemented `generateLocalSequentialPurchaseRefNo` in `purchase-api.js` as an offline-first fallback.
  - Added explicit UI status dropdown selectors in `PurchaseAddModal` across Purchase Bill (`UNPAID`, `PAID`, `PARTIAL`, `DRAFT`, `CANCELLED`), RFO (`PENDING APPROVAL`, `APPROVED`, `CANCELLED`), and Machinery (`OPERATIONAL`, `UNDER MAINTENANCE`, `CALIBRATION DUE`, `INACTIVE`).
  - Added `if (!isOpen) return null;` guard, backdrop dismissal, and ESC key listener to `PurchaseAddModal`.
  - Upgraded Purchase sub-pages (`/purchase/bills`, `/purchase/rfo`, `/purchase/machinery`, `/purchase`) with row actions (delete, status updates, approval toggles), dynamic search, and status filtering.
- **Why**:
  - The Purchase module was disconnected from the live backend REST API, lacked row deletion and editing capabilities, and generated random reference IDs.
- **Trade-offs Accepted**:
  - `purchaseApi` uses a hybrid offline-first strategy: queries and mutations call the live backend API first, falling back to local storage and browser events when offline or during backend cold-starts, ensuring seamless continuous operation for factory personnel.

---

## 2026-09-13 — Default Application Route Configured to /login
- **Decision**:
  - Configured `/login` as the default landing route across Suraj ERP.
  - Implemented Next.js server-level redirect in `next.config.mjs` (`source: '/' -> destination: '/login'`) and client-side fallback in `src/app/page.js` (`router.replace('/login')`).
- **Why**:
  - Secure enterprise ERP workflow requires users to authenticate at `/login` before accessing application modules and dashboard metrics.
- **Trade-offs Accepted**:
  - Direct root access (`/`) automatically redirects to `/login`. Once credentials are authenticated, the login flow transitions the session to `/dashboard`.






