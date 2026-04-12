"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  CreditCard,
  FileUp,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Upload,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  pendingPayments: number;
  pendingImports: number;
}

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalBookings: 0,
    pendingPayments: 0,
    pendingImports: 0,
  });

  useEffect(() => {
    if (!accessToken) return;

    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    }
    fetchStats();
  }, [accessToken]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      href: "/admin/customers",
      gradient: "from-blue-600 to-blue-700",
      trend: TrendingUp,
      trendLabel: "Active",
    },
    {
      title: "Active Bookings",
      value: stats.totalBookings,
      icon: Building2,
      href: "/admin/bookings/import",
      gradient: "from-emerald-600 to-emerald-700",
      trend: TrendingUp,
      trendLabel: "Growing",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments,
      icon: CreditCard,
      href: "/admin/payments",
      gradient: "from-amber-500 to-orange-600",
      trend: TrendingDown,
      trendLabel: "Needs attention",
    },
    {
      title: "Pending Imports",
      value: stats.pendingImports,
      icon: FileUp,
      href: "/admin/bookings/import",
      gradient: "from-purple-600 to-purple-700",
      trend: TrendingUp,
      trendLabel: "Queued",
    },
  ];

  const quickActions = [
    {
      label: "Import Booking",
      icon: Upload,
      href: "/admin/bookings/import",
      color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
    },
    {
      label: "Mark Payment",
      icon: CheckCircle,
      href: "/admin/payments",
      color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    },
    {
      label: "Upload Document",
      icon: FileText,
      href: "/admin/documents",
      color: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || "Admin"}
          </h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0">
              <CardContent className={`p-0`}>
                <div className={`bg-gradient-to-br ${card.gradient} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-white/70">
                    <card.trend className="h-3.5 w-3.5" />
                    <span>{card.trendLabel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-auto py-4 px-5 justify-between ${action.color} border`}
              >
                <span className="flex items-center gap-2.5 font-medium">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
