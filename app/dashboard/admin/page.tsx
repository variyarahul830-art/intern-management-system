"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";

interface DashboardStats {
  totalInterns: number;
  activeTasks: number;
  pendingTasks: number;
  completedTasks: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500">
              <h3 className="text-gray-600 text-sm font-medium">Total Interns</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalInterns}
              </p>
            </Card>

            <Card className="border-l-4 border-yellow-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Active Tasks
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeTasks}
              </p>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Pending Tasks
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingTasks}
              </p>
            </Card>

            <Card className="border-l-4 border-green-500">
              <h3 className="text-gray-600 text-sm font-medium">
                Completed Tasks
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.completedTasks}
              </p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card title="Quick Actions">
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard/admin/interns"
                  className="text-blue-600 hover:underline"
                >
                  → Manage Interns
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/admin/tasks"
                  className="text-blue-600 hover:underline"
                >
                  → Create New Task
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/admin/mentors"
                  className="text-blue-600 hover:underline"
                >
                  → Manage Mentors
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/admin/interns"
                  className="text-blue-600 hover:underline"
                >
                  → View All Interns
                </a>
              </li>
            </ul>
          </Card>

          <Card title="System Information">
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Welcome:</strong> {session?.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {session?.user?.email}
              </p>
              <p>
                <strong>Role:</strong> Administrator
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Last login: {new Date().toLocaleString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
