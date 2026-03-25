import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: "blue" | "yellow" | "red" | "green" | "purple";
}

const colorStyles = {
  blue: "border-blue-500",
  yellow: "border-yellow-500",
  red: "border-red-500",
  green: "border-green-500",
  purple: "border-purple-500",
};

export function StatCard({ label, value, icon, color = "blue" }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorStyles[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-600 text-sm font-medium">{label}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        {icon && <div className="text-3xl opacity-30">{icon}</div>}
      </div>
    </div>
  );
}
