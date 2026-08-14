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
