"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";

interface Intern {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  mentorId: string;
  startDate: string;
  status: string;
  collegeName?: string;
  university?: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface CredentialNotice {
  role: "intern" | "mentor";
  name: string;
  email: string;
  id: string;
  password: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE"];

export default function InternsPage() {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInternForm, setShowInternForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [credentialNotice, setCredentialNotice] =
    useState<CredentialNotice | null>(null);
  const [filters, setFilters] = useState({
    name: "",
    collegeName: "",
    department: "",
    mentorName: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "AI",
    mentorId: "",
    startDate: "",
    collegeName: "",
  });

  useEffect(() => {
    fetchInterns();
    fetchMentors();
  }, []);

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/interns");
      if (res.ok) {
        setInterns(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch interns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const users = await fetch("/api/auth/users");
      if (users.ok) {
        const data = await users.json();
        setMentors(data.filter((u: any) => u.role === "mentor"));
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError("");
    setCredentialNotice(null);

    try {
      const url = editingId ? `/api/interns/${editingId}` : "/api/interns";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        ...formData,
        university: formData.collegeName,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setPageError(err?.error || "Failed to save intern");
        return;
      }

      const responseData = await res.json();
      await fetchInterns();
      setShowInternForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "AI",
        mentorId: "",
        startDate: "",
        collegeName: "",
      });

      if (!editingId && responseData?.credentials) {
        setCredentialNotice({
          role: "intern",
          name: payload.name,
          email: payload.email,
          id: responseData.credentials.id,
          password: responseData.credentials.password,
        });
      }
    } catch (error) {
      console.error("Failed to save intern:", error);
      setPageError("Failed to save intern");
    }
  };

  const handleEdit = (intern: Intern) => {
    setFormData({
      name: intern.name,
      email: intern.email,
      phone: intern.phone || "",
      department: intern.department,
      mentorId: intern.mentorId,
      startDate: intern.startDate,
      collegeName: intern.collegeName || intern.university || "",
    });
    setEditingId(intern.id);
    setShowInternForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this intern?")) {
      try {
        const res = await fetch(`/api/interns/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchInterns();
        }
      } catch (error) {
        console.error("Failed to delete intern:", error);
      }
    }
  };

  const getMentorLabel = (mentorId: string) => {
    const mentor = mentors.find((m) => m.id === mentorId);
    if (!mentor) {
      return "Not assigned";
    }
    return mentor.department
      ? `${mentor.name} (${mentor.department})`
      : mentor.name;
  };

  const filteredInterns = interns.filter((intern) => {
    const mentorLabel = getMentorLabel(intern.mentorId).toLowerCase();
    return (
      intern.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (intern.collegeName || intern.university || "")
        .toLowerCase()
        .includes(filters.collegeName.toLowerCase()) &&
      intern.department.toLowerCase().includes(filters.department.toLowerCase()) &&
      mentorLabel.includes(filters.mentorName.toLowerCase())
    );
  });

  const copyCredentials = async () => {
    if (!credentialNotice) {
      return;
    }

    const text = [
      `Role: ${credentialNotice.role}`,
      `Name: ${credentialNotice.name}`,
      `Email: ${credentialNotice.email}`,
      `Login ID: ${credentialNotice.id}`,
      `Password: ${credentialNotice.password}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy credentials:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Interns</h1>
          <div className="flex gap-3 items-center">
            <Link
              href="/dashboard/admin/mentors"
              className="text-sm text-blue-600 hover:underline"
            >
              Go to mentor dashboard
            </Link>
            <Button
              onClick={() => {
                setShowInternForm(!showInternForm);
                setEditingId(null);
              }}
            >
              {showInternForm ? "Cancel" : "+ Add Intern"}
            </Button>
          </div>
        </div>

        {pageError && (
          <Card className="mb-6">
            <p className="text-sm text-red-600">{pageError}</p>
          </Card>
        )}

        {credentialNotice && (
          <Card title="Share Login Credentials" className="mb-6 border border-blue-200">
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Created {credentialNotice.role}: <strong>{credentialNotice.name}</strong>
              </p>
              <p>Email: {credentialNotice.email}</p>
              <p>
                Login ID: <strong>{credentialNotice.id}</strong>
              </p>
              <p>
                Password: <strong>{credentialNotice.password}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Share these credentials securely. Password is shown only now.
              </p>
            </div>
            <div className="mt-4">
              <Button onClick={copyCredentials} className="text-sm px-4 py-2">
                Copy Credentials
              </Button>
            </div>
          </Card>
        )}

        {showInternForm && (
          <Card title={editingId ? "Edit Intern" : "Add New Intern"} className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <Input
                  label="College Name"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mentor
                  </label>
                  <select
                    name="mentorId"
                    value={formData.mentorId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.department
                          ? `${mentor.name} (${mentor.department})`
                          : mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </form>
          </Card>
        )}

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
              <input
                type="text"
                placeholder="Search name..."
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by College</label>
              <input
                type="text"
                placeholder="Search college..."
                value={filters.collegeName}
                onChange={(e) => setFilters({ ...filters, collegeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Mentor</label>
              <select
                value={filters.mentorName}
                onChange={(e) => setFilters({ ...filters, mentorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All mentors</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.name}>
                    {mentor.department ? `${mentor.name} (${mentor.department})` : mentor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {loading ? (
          <p>Loading interns...</p>
        ) : interns.length === 0 ? (
          <Card>
            <p className="text-gray-600">No interns yet. Create one to get started.</p>
          </Card>
        ) : filteredInterns.length === 0 ? (
          <Card>
            <p className="text-gray-600">No interns match the current filters.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      College
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Mentor
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
                  {filteredInterns.map((intern) => (
                    <tr key={intern.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{intern.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{intern.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{intern.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{intern.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {intern.collegeName || intern.university || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{intern.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getMentorLabel(intern.mentorId)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {intern.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Button
                          onClick={() => handleEdit(intern)}
                          className="px-3 py-1 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(intern.id)}
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
  );
}
