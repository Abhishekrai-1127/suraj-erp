"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { Factory } from "lucide-react";

export default function ManufacturingPage() {
  return (
    <UnderDevelopment
      title="Manufacturing & Production"
      category="Main Menu"
      description="Manage Bill of Materials (BOM), Work Orders, production floor scheduling, and shop floor material consumption."
      icon={Factory}
      expectedRelease="Q3 2026"
      features={[
        "Multi-level Bill of Materials (BOM)",
        "Work Order Management & Tracking",
        "Production Capacity & Scheduling",
        "Shop Floor Material Consumption",
        "Scrap & Yield Analysis",
        "Machine Maintenance Logs"
      ]}
    />
  );
}
