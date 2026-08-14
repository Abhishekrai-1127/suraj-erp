"use client";

import React from "react";
import DashboardLayout from "./(dashboard)/layout";
import NotFound from "./(dashboard)/not-found";

export default function RootNotFound() {
  return (
    <DashboardLayout>
      <NotFound />
    </DashboardLayout>
  );
}
