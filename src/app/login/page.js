"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Truck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("surajenterprises@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email address and password");
      return;
    }

    if (password !== "Erp@123") {
      toast.error("Incorrect password. Please try again.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Authenticating session...");

    setTimeout(() => {
      setIsLoading(false);
      try {
        const userObj = {
          name: "Suraj Enterprises",
          email: email,
          role: "Administrator",
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("suraj_erp_user", JSON.stringify(userObj));
      } catch (err) {
        console.error("Failed to store user session:", err);
      }

      toast.success("Welcome back, Suraj Enterprises!", { id: toastId });
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand & Feature Showcase */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            {/* Company Logo / Header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 border border-blue-400/30">
                S
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  SURAJ ERP
                </h1>
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest">
                  Engineers & Consultants
                </p>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
                Sales & Billing Management
              </h2>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Streamlined GST Tax Invoices, Delivery Challans, and Quotations System.
              </p>
            </div>

            {/* Feature Cards List */}
            <div className="space-y-3 pt-2">
              {[
                {
                  icon: Receipt,
                  title: "GST Tax Invoices",
                  desc: "Print & download 1-page A4 invoices with QR",
                  color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                },
                {
                  icon: Truck,
                  title: "Auto Delivery Challans",
                  desc: "Generate physical billbook format challans",
                  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                },
                {
                  icon: FileText,
                  title: "Quotations & Proposals",
                  desc: "Track price estimates with 1-click PDF export",
                  color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className={`p-2 rounded-xl border ${feat.color} shrink-0`}>
                    <feat.icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{feat.title}</div>
                    <div className="text-[11px] font-medium text-slate-400">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Badge */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              Suraj ERP Secured
            </span>
            <div className="text-right">
              <div>For changes contact: abhishekrai1878@gmail.com
              </div>
              <div className="text-[10px] text-slate-400 font-medium">(Abhishek Rai)</div>
            </div>
          </div>
        </div>

        {/* Right Side: Single User Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-slate-900/40">
          <div className="my-auto space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Sign In</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Enter your password to access the ERP dashboard.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="surajenterprises@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options: Forgot Password */}
              <div className="flex items-center justify-end text-xs pt-1">
                <button
                  type="button"
                  onClick={() => toast.info("Contact system administrator to reset password.")}
                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold tracking-wide shadow-lg shadow-blue-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>SIGN IN TO DASHBOARD</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 font-medium">
            Suraj Enterprises &copy; 2026 &bull; Confidential ERP System
          </div>
        </div>
      </div>
    </div>
  );
}
