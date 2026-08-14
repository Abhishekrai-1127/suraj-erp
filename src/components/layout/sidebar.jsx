import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Banknote,
  ShoppingCart,
  Boxes,
  Factory,
  Landmark,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ name: "Abhishek Sharma", role: "Administrator" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("suraj_erp_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUser(parsed);
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("suraj_erp_user");
    } catch (e) {}
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const menuItems = {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "CRM", href: "/crm", icon: Users2 },
      { name: "Sales", href: "/sales", icon: Banknote },
      { name: "Purchase", href: "/purchase", icon: ShoppingCart },
      { name: "Inventory", href: "/inventory", icon: Boxes },
      { name: "Manufacturing", href: "/manufacturing", icon: Factory },
    ],
    admin: [
      { name: "Finance", href: "/finance", icon: Landmark },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Users", href: "/users", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Help", href: "/help", icon: HelpCircle },
    ],
  };

  return (
    <aside className="w-[260px] min-w-[260px] bg-[#222530] text-slate-300 flex flex-col h-screen border-r border-slate-800/20 select-none overflow-hidden">
      {/* Header / Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
          <Factory size={22} className="stroke-[1.8]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wide">ERP System</span>
          <span className="text-[11px] text-slate-400 font-medium">Suraj Enterprises</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        {/* Main Menu */}
        <div className="space-y-2">
          <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            Main Menu
          </h4>
          <nav className="space-y-1">
            {menuItems.main.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration */}
        <div className="space-y-2">
          <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            Administration
          </h4>
          <nav className="space-y-1">
            {menuItems.admin.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-700/20 bg-[#1b1d26] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-slate-700/40">
            <Image
              src="/avatar.png"
              alt={user.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-white">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-medium">{user.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition duration-150"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
