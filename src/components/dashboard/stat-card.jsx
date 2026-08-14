import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * MiniBarChart — accepts raw data values, normalises them to the max,
 * and renders pixel-perfect SVG bars with top-only rounded corners.
 */
function MiniBarChart({ data = [], color = "#3b82f6" }) {
  if (!data.length) return null;

  const max = Math.max(...data);
  const chartH = 48;
  const barW = 6;
  const gap = 6;
  const totalW = data.length * barW + (data.length - 1) * gap;

  // Normalise: map each value to a % of max; enforce min visible height of 4%
  const heights = data.map((v) => Math.max((v / max) * 100, 4));

  return (
    <svg
      width="100%"
      height={chartH}
      viewBox={`0 0 ${totalW} ${chartH}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {heights.map((h, i) => {
        const barH = (h / 100) * chartH;
        const x = i * (barW + gap);
        const y = chartH - barH;
        const r = Math.min(3, barH); // Max radius is 3px or bar height

        const pathData = `
          M ${x},${y + barH}
          L ${x},${y + r}
          A ${r},${r} 0 0 1 ${x + r},${y}
          L ${x + barW - r},${y}
          A ${r},${r} 0 0 1 ${x + barW},${y + r}
          L ${x + barW},${y + barH}
          Z
        `;

        return (
          <g key={i}>
            <path d={pathData} fill={color} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

export default function StatCard({
  title,
  value,
  badgeText,
  badgeVariant = "default",
  icon: Icon,
  iconBgClass = "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
  data = [40, 70, 55, 90, 60, 80],
  barColor = "#3b82f6",
}) {
  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`h-11 w-11 flex items-center justify-center rounded-xl ${iconBgClass}`}>
          {Icon && <Icon size={20} className="stroke-[2]" />}
        </div>
        {/* Badge */}
        <Badge variant={badgeVariant} className="px-2.5 py-1">
          {badgeText}
        </Badge>
      </div>

      {/* Text */}
      <div className="mt-4 space-y-0.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <span className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight block leading-tight">
          {value}
        </span>
      </div>

      {/* Data-driven SVG bar chart */}
      <div className="mt-4 w-full select-none">
        <MiniBarChart data={data} color={barColor} />
      </div>
    </Card>
  );
}
