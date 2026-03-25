"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { ChatWidget } from "@/app/components/ChatWidget";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedIntern: string;
  assignedInterns?: string[];
  assignedToAll?: boolean;
  deadline: string;
  status: string;
  priority: string;
}

interface Intern {
  id: string;
  name: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedInterns: [] as string[],
    assignedToAll: false,
    deadline: "",
    priority: "medium",
    status: "pending",
  });

  useEffect(() => {
    fetchTasks();
    fetchInterns();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) {
        setInterns(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch interns:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssignedToAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      assignedToAll: checked,
      assignedInterns: checked ? [] : prev.assignedInterns,
    }));
  };

  const handleInternToggle = (internId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedInterns.includes(internId);
      return {
        ...prev,
        assignedInterns: exists
          ? prev.assignedInterns.filter((id) => id !== internId)
          : [...prev.assignedInterns, internId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assignedToAll && formData.assignedInterns.length === 0) {
      alert("Please select at least one intern or choose 'Assign to all interns'.");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchTasks();
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          assignedInterns: [],
          assignedToAll: false,
          deadline: "",
          priority: "medium",
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchTasks();
        }
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const getInternName = (internId: string) => {
    return interns.find((i) => i.id === internId)?.name || "Unknown";
  };

  const getAssignedToLabel = (task: Task) => {
    if (task.assignedToAll) {
      return "All interns";
    }

    const ids =
      task.assignedInterns && task.assignedInterns.length > 0
        ? task.assignedInterns
        : task.assignedIntern
        ? [task.assignedIntern]
        : [];

    if (ids.length === 0) {
      return "Unknown";
    }

    const names = ids.map(getInternName).filter((name) => name !== "Unknown");
    return names.length > 0 ? names.join(", ") : "Unknown";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "text-red-700 bg-red-100";
    if (priority === "medium") return "text-yellow-700 bg-yellow-100";
    return "text-green-700 bg-green-100";
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "text-green-700 bg-green-100";
    if (status === "in-progress") return "text-blue-700 bg-blue-100";
    return "text-gray-700 bg-gray-100";
  };

  return (
    <>
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Tasks</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Task"}
          </Button>
        </div>

        {showForm && (
          <Card title="Create New Task" className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.assignedToAll}
                      onChange={handleAssignedToAllChange}
                    />
                    Assign to all interns
                  </label>

                  {!formData.assignedToAll && (
                    <div className="max-h-44 overflow-y-auto border border-gray-300 rounded p-3 space-y-2">
                      {interns.map((intern) => (
                        <label
                          key={intern.id}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedInterns.includes(intern.id)}
                            onChange={() => handleInternToggle(intern.id)}
                          />
                          {intern.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="Deadline"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <Button type="submit">Create Task</Button>
            </form>
          </Card>
        )}

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <Card>
            <p className="text-gray-600">No tasks yet. Create one to get started.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getAssignedToLabel(task)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {task.deadline}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          onClick={() => handleDelete(task.id)}
                          variant="danger"
                          className="px-3 py-1 text-sm"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>

     {/* Chat Widget */}
      <ChatWidget />

    </>
  );
}
