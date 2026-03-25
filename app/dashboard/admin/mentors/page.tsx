"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Card } from "@/app/components/Card";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { ChatWidget } from "@/app/components/ChatWidget";

interface Mentor {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface CredentialNotice {
  role: "mentor";
  name: string;
  email: string;
  id: string;
  password: string;
}

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE"];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pageError, setPageError] = useState("");
  const [credentialNotice, setCredentialNotice] =
    useState<CredentialNotice | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "AI",
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const users = await fetch("/api/auth/users");
      if (users.ok) {
        const data = await users.json();
        setMentors(data.filter((u: any) => u.role === "mentor"));
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    } finally {
      setLoading(false);
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
      const payload = {
        ...formData,
        role: "mentor",
      };

      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setPageError(err?.error || "Failed to create mentor");
        return;
      }

      const data = await res.json();
      await fetchMentors();
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        department: "AI",
      });

      setCredentialNotice({
        role: "mentor",
        name: payload.name,
        email: payload.email,
        id: data.credentials.id,
        password: data.credentials.password,
      });
    } catch (error) {
      console.error("Failed to create mentor:", error);
      setPageError("Failed to create mentor");
    }
  };

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
    <>
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Mentors</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Mentor"}
          </Button>
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
                Created mentor: <strong>{credentialNotice.name}</strong>
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

        {showForm && (
          <Card title="Add New Mentor" className="mb-8">
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
              </div>
              <Button type="submit">Create Mentor</Button>
            </form>
          </Card>
        )}

        {loading ? (
          <p>Loading mentors...</p>
        ) : mentors.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-600">No mentors available.</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{mentor.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{mentor.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{mentor.email || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{mentor.department || "N/A"}</td>
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
