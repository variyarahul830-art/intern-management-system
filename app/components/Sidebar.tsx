"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./Button";

export function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { href: "/dashboard/admin", label: "Dashboard" },
        { href: "/dashboard/admin/interns", label: "Manage Interns" },
        { href: "/dashboard/admin/mentors", label: "Manage Mentors" },
        { href: "/dashboard/admin/tasks", label: "Create Tasks" },
      ];
    }
    if (role === "mentor") {
      return [
        { href: "/dashboard/mentor", label: "Dashboard" },
        { href: "/dashboard/mentor/interns", label: "My Interns" },
        { href: "/dashboard/mentor/tasks", label: "Manage Tasks" },
        { href: "/dashboard/mentor/reports", label: "View Reports" },
      ];
    }
    if (role === "intern") {
      return [
        { href: "/dashboard/intern", label: "Dashboard" },
        { href: "/dashboard/intern/tasks", label: "My Tasks" },
        { href: "/dashboard/intern/submit-report", label: "Submit Report" },
        { href: "/dashboard/intern/reports", label: "My Reports" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Intern Mgmt</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome, {session?.user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{role}</p>
      </div>

      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded transition-colors ${
                  pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-gray-700">
        <Button
          onClick={handleLogout}
          variant="secondary"
          className="w-full text-gray-800"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
