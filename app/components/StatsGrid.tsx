import React from "react";
import { StatCard } from "./StatCard";

interface Stat {
  label: string;
  value: number | string;
  icon?: string;
  color?: "blue" | "yellow" | "red" | "green" | "purple";
}

interface StatsGridProps {
  stats: Stat[];
  loading?: boolean;
}

export function StatsGrid({ stats, loading = false }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
}
