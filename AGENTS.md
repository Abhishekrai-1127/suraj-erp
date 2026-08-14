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

---

## 🚧 What's In Progress
- Connecting frontend modules to live backend services / database APIs.
- Expanding form validation (Zod + React Hook Form) across ERP workflows.

---

## ⚠️ What's Broken / Known Issues
- *None currently.* (`pnpm run build` compiles cleanly).

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
