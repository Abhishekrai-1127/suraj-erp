"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <UnderDevelopment
      title="System Settings"
      category="Administration"
      description="Configure company profile, GST rate slabs, currency defaults, email SMTP servers, and third-party API integrations."
      icon={Settings}
      expectedRelease="Q3 2026"
      features={[
        "Company Profile & Branding Settings",
        "Tax Slabs & Financial Year Defaults",
        "Email & SMS Gateway Integrations",
        "API Keys & Webhooks Management",
        "Document Numbering Schemes",
        "System Backup & Restore Controls"
      ]}
    />
  );
}
