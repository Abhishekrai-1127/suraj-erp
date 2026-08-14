"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { Landmark } from "lucide-react";

export default function FinancePage() {
  return (
    <UnderDevelopment
      title="Finance & Accounting"
      category="Administration"
      description="Streamline General Ledger, Accounts Receivable/Payable, GST filing, cashflow forecasting, and bank reconciliation."
      icon={Landmark}
      expectedRelease="Q4 2026"
      features={[
        "Chart of Accounts & General Ledger",
        "Accounts Receivable & Payable",
        "GST / Tax Compliance & E-invoicing",
        "Automated Bank Reconciliation",
        "Cashflow Forecasting & Analytics",
        "Expense Claim Approvals"
      ]}
    />
  );
}
