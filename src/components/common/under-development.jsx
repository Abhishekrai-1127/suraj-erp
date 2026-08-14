"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Wrench, 
  ArrowLeft, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Layers,
  Construction
} from "lucide-react";

export default function UnderDevelopment({
  title = "Module Under Development",
  category = "System Module",
  description = "Our engineering team is actively building this module. Check back soon or request priority updates.",
  icon: Icon = Construction,
  expectedRelease = "Q3 2026",
  features = [
    "Comprehensive Data Management",
    "Real-time Analytics & Dashboard Integrations",
    "Automated Workflows & Reporting",
    "Role-based Granular Access Control"
  ]
}) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full min-h-[calc(100vh-140px)] justify-center py-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest gap-2">
            <span>{category}</span>
            <span>›</span>
            <span className="text-blue-600 dark:text-blue-500">{title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            {title}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock size={12} />
              Under Development
            </span>
          </h1>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#222530] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="relative overflow-hidden bg-white dark:bg-[#1b1d26] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-12 shadow-sm flex flex-col items-center text-center">
        {/* Subtle Background Accent Pattern */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10">
            <Icon size={38} className="stroke-[1.8]" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center border-2 border-white dark:border-[#1b1d26] shadow-sm">
            <Wrench size={14} />
          </div>
        </div>

        {/* Heading & Intro */}
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold">
            <Sparkles size={13} className="text-blue-500" />
            Target Launch: {expectedRelease}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title} is Coming Soon
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Roadmap Preview Box */}
        <div className="mt-8 w-full max-w-xl bg-slate-50 dark:bg-[#222530]/60 rounded-xl p-5 border border-slate-200/60 dark:border-slate-800/60 text-left">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Layers size={15} className="text-blue-600 dark:text-blue-400" />
            <span>Planned Features for {title}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Subscription / Priority Request Form */}
        <div className="mt-8 w-full max-w-md">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={16} />
              <span>You&apos;re on the priority notification list for {title}!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter email for launch notify..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#222530] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition duration-150 shrink-0"
              >
                <BellRing size={14} />
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
