"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <UnderDevelopment
      title="Reports & Analytics"
      category="Administration"
      description="Generate executive dashboards, custom cross-module reports, export datasets in Excel/PDF, and schedule automated emails."
      icon={BarChart3}
      expectedRelease="Q4 2026"
      features={[
        "Executive Summary Dashboards",
        "Custom Drag-and-Drop Report Builder",
        "Sales, Purchase & Inventory Insights",
        "Automated Scheduled Email Delivery",
        "Export to PDF, CSV, and Excel",
        "Historical Trend & Variance Analysis"
      ]}
    />
  );
}
