"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { StatsGrid } from "@/app/components/StatsGrid";
import { QuickLinksSection } from "@/app/components/QuickLinksSection";
import { Card } from "@/app/components/Card";
import { ChatWidget } from "@/app/components/ChatWidget";

interface AdminDashboardStats {
  totalInterns: number;
  activeTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalInterns: 0,
    activeTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [internsRes, tasksRes] = await Promise.all([
          fetch("/api/interns"),
          fetch("/api/tasks"),
        ]);

        const interns = internsRes.ok ? await internsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];

        setStats({
          totalInterns: interns.length,
          activeTasks: tasks.filter((t: any) => t.status === "in-progress")
            .length,
          pendingTasks: tasks.filter((t: any) => t.status === "pending").length,
          completedTasks: tasks.filter((t: any) => t.status === "completed")
            .length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      label: "Total Interns",
      value: stats.totalInterns,
      icon: "👥",
      color: "blue" as const,
    },
    {
      label: "Active Tasks",
      value: stats.activeTasks,
      icon: "⚡",
      color: "yellow" as const,
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: "⏳",
      color: "red" as const,
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: "✓",
      color: "green" as const,
    },
  ];

  const quickLinks = [
    {
      label: "Manage Interns",
      href: "/dashboard/admin/interns",
      description: "View & edit intern records",
      icon: "👥",
    },
    {
      label: "Create New Task",
      href: "/dashboard/admin/tasks",
      description: "Assign tasks to interns",
      icon: "✓",
    },
    {
      label: "Manage Mentors",
      href: "/dashboard/admin/mentors",
      description: "Mentor assignments & info",
      icon: "🎓",
    },
    {
      label: "View Reports",
      href: "/dashboard/admin/reports",
      description: "Analytics & exports",
      icon: "📊",
    },
  ];

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">
            Admin Dashboard
          </h1>

          {/* Stats Grid */}
          <StatsGrid stats={statsData} loading={loading} />

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <QuickLinksSection links={quickLinks} />

            <Card title="System Info">
              <div className="space-y-4">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {session?.user?.name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {session?.user?.email ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="text-sm font-semibold text-gray-900">
                    Administrator
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>

      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
}
