"use client";

import React from "react";
import UnderDevelopment from "@/components/common/under-development";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <UnderDevelopment
      title="User Management"
      category="Administration"
      description="Manage staff accounts, assign granular role-based access permissions (RBAC), and review security audit trails."
      icon={Users}
      expectedRelease="Q3 2026"
      features={[
        "Role-Based Access Control (RBAC)",
        "Granular Module & Action Permissions",
        "Activity & Security Audit Logs",
        "Two-Factor Authentication (2FA)",
        "Department & Team Groupings",
        "User Session Management"
      ]}
    />
  );
}
