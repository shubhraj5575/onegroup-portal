"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  FileText,
  LogOut,
  User,
  MessageSquare,
  Bell,
  ClipboardCheck,
  Gift,
  Landmark,
  Users,
  ChevronRight,
} from "lucide-react";

const navSections = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/construction", label: "Construction", icon: Building2 },
      { href: "/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    title: "Services",
    items: [
      { href: "/tickets", label: "Tickets", icon: MessageSquare },
      { href: "/notifications", label: "Notifications", icon: Bell, badge: true },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "More",
    items: [
      { href: "/possession", label: "Possession", icon: ClipboardCheck },
      { href: "/referrals", label: "Referrals", icon: Gift },
      { href: "/loans", label: "Loans", icon: Landmark },
      { href: "/community", label: "Community", icon: Users },
    ],
  },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PortalSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-gray-300">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              ONE Group
            </h1>
            <p className="text-[11px] font-medium text-gray-500">
              Customer Portal
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-blue-500" />
                    )}

                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-blue-400"
                          : "text-gray-500 group-hover:text-gray-400"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>

                    {/* Notification badge */}
                    {"badge" in item && item.badge && (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                      </span>
                    )}

                    {/* Hover arrow */}
                    {!isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-600 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

      {/* User card */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
            {getInitials(user?.customer?.name || user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.customer?.name || user?.name || "Customer"}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              +91 {user?.phone}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-white/10 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
