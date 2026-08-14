"use client";

import React from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200">
      {/* Left Sidebar (fixed) */}
      <Sidebar />

      {/* Right main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header (fixed) */}
        <Header />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
