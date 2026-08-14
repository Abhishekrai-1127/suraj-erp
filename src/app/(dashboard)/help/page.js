"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <UnderDevelopment
      title="Help & Documentation"
      category="Administration"
      description="Access interactive user guides, video tutorials, API references, and open support tickets directly with our tech team."
      icon={HelpCircle}
      expectedRelease="Q3 2026"
      features={[
        "Interactive ERP User Manuals",
        "Step-by-step Video Walkthroughs",
        "Keyboard Shortcuts Cheat Sheet",
        "In-App Support Ticket Submission",
        "Live Chat Assistance Integration",
        "System Status & Release Notes"
      ]}
    />
  );
}
