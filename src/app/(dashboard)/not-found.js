"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <UnderDevelopment
      title="Page Not Found / Under Development"
      category="404 Error"
      description="The page or section you requested is either unavailable or currently undergoing development."
      icon={AlertCircle}
      expectedRelease="Coming Soon"
      features={[
        "Double-check your target URL for typos",
        "Use the left sidebar navigation menu to browse active modules",
        "Contact your system administrator if you believe this is an error",
        "Return to the primary Dashboard home overview"
      ]}
    />
  );
}
